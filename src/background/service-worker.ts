import { extractDomain } from '../shared/domain-utils'
import { GROUP_COLORS, STORAGE_KEYS } from '../shared/constants'
import { executeStrategy } from '../shared/strategies/index'
import type { MessageToBackground } from '../shared/messaging'
import type { GroupedTabState, Settings } from '../shared/types'
import { DEFAULT_SETTINGS } from '../shared/types'

// --- State ---
let isOrganizing = false
const connectedPorts: chrome.runtime.Port[] = []

// --- Install / Startup ---
chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS })
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

  // Snapshot all existing tabs with current timestamp as fallback
  const tabs = await chrome.tabs.query({})
  const tabOpenTimes: Record<string, number> = {}
  const now = Date.now()
  for (const tab of tabs) {
    if (tab.id) tabOpenTimes[String(tab.id)] = now
  }
  await chrome.storage.local.set({ [STORAGE_KEYS.TAB_OPEN_TIMES]: tabOpenTimes })
})

// --- Tab Open Time Tracking ---
chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab.id) return
  const result = await chrome.storage.local.get(STORAGE_KEYS.TAB_OPEN_TIMES)
  const tabOpenTimes: Record<string, number> = result[STORAGE_KEYS.TAB_OPEN_TIMES] ?? {}
  tabOpenTimes[String(tab.id)] = Date.now()
  await chrome.storage.local.set({ [STORAGE_KEYS.TAB_OPEN_TIMES]: tabOpenTimes })
  scheduleOrganize()
})

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TAB_OPEN_TIMES)
  const tabOpenTimes: Record<string, number> = result[STORAGE_KEYS.TAB_OPEN_TIMES] ?? {}
  delete tabOpenTimes[String(tabId)]
  await chrome.storage.local.set({ [STORAGE_KEYS.TAB_OPEN_TIMES]: tabOpenTimes })
  setTimeout(broadcastTabState, 100)
})

// --- Tab Event Listeners (top-level for MV3 persistence) ---
let debounceTimer: ReturnType<typeof setTimeout> | undefined

function scheduleOrganize() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
    const settings = result[STORAGE_KEYS.SETTINGS] as Settings | undefined
    if (settings?.autoOrganize) {
      await organizeTabs()
    }
    broadcastTabState()
  }, 500)
}

chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    scheduleOrganize()
  }
})
chrome.tabs.onMoved.addListener(scheduleOrganize)

// --- Core Grouping Algorithm (Strategy Pattern) ---
async function organizeTabs(): Promise<void> {
  if (isOrganizing) return
  isOrganizing = true

  try {
    const storageResult = await chrome.storage.local.get([
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.COLOR_ASSIGNMENTS,
      STORAGE_KEYS.TAB_OPEN_TIMES,
    ])
    const settings = (storageResult[STORAGE_KEYS.SETTINGS] as Settings) ?? DEFAULT_SETTINGS
    const colorAssignments: Record<string, chrome.tabGroups.ColorEnum> =
      storageResult[STORAGE_KEYS.COLOR_ASSIGNMENTS] ?? {}
    const tabOpenTimes: Record<string, number> =
      storageResult[STORAGE_KEYS.TAB_OPEN_TIMES] ?? {}

    const tabs = await chrome.tabs.query({ currentWindow: true })

    // Execute the selected strategy
    const groupMap = executeStrategy(settings.activeTemplate, tabs, settings, tabOpenTimes)

    // Get existing groups to reuse
    const existingGroups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT })
    const titleToGroup = new Map<string, chrome.tabGroups.TabGroup>()
    for (const group of existingGroups) {
      if (group.title) {
        titleToGroup.set(group.title.toLowerCase(), group)
      }
    }

    let colorIndex = 0

    // Phase 1: Group all tabs first (create/reuse groups)
    const groupUpdates: { groupId: number; title: string; color: chrome.tabGroups.ColorEnum }[] = []

    for (const [title, { tabIds, color: preferredColor }] of groupMap) {
      if (tabIds.length === 0) continue

      const color = preferredColor ?? GROUP_COLORS[colorIndex % GROUP_COLORS.length]
      colorIndex++

      const existingGroup = titleToGroup.get(title.toLowerCase())

      if (existingGroup) {
        await chrome.tabs.group({ tabIds, groupId: existingGroup.id })
        groupUpdates.push({ groupId: existingGroup.id, title, color })
      } else {
        const groupId = await chrome.tabs.group({ tabIds })
        groupUpdates.push({ groupId, title, color })
      }

      colorAssignments[title.toLowerCase()] = color
    }

    // Phase 2: Apply titles, colors, and expand so Chrome renders group name headers
    for (const { groupId, title, color } of groupUpdates) {
      try {
        await chrome.tabGroups.update(groupId, { title, color, collapsed: false })
      } catch {
        // Group may have been removed between phases; skip it
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Phase 3: Wait for Chrome to fully render names, then collapse all groups
    await new Promise(resolve => setTimeout(resolve, 300))
    for (const { groupId } of groupUpdates) {
      try {
        await chrome.tabGroups.update(groupId, { collapsed: true })
      } catch {
        // Group may have been removed; skip it
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.COLOR_ASSIGNMENTS]: colorAssignments })
  } finally {
    isOrganizing = false
  }
}

// --- Get Current State ---
async function getGroupedTabState(): Promise<GroupedTabState[]> {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT })

  const groupMap = new Map<number, GroupedTabState>()

  for (const g of groups) {
    groupMap.set(g.id, {
      groupId: g.id,
      title: g.title || 'Untitled',
      color: g.color,
      collapsed: g.collapsed,
      tabs: [],
    })
  }

  // Ungrouped bucket
  groupMap.set(-1, {
    groupId: -1,
    title: 'Ungrouped',
    color: 'grey',
    collapsed: false,
    tabs: [],
  })

  for (const tab of tabs) {
    const gid = tab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE ? -1 : tab.groupId
    const group = groupMap.get(gid)
    if (group) {
      group.tabs.push({
        id: tab.id!,
        title: tab.title || '',
        url: tab.url || '',
        domain: extractDomain(tab.url || '') || '',
        favIconUrl: tab.favIconUrl,
        active: tab.active,
        pinned: tab.pinned,
        groupId: tab.groupId,
      })
    }
  }

  const result = Array.from(groupMap.values()).filter(g => g.tabs.length > 0)
  result.sort((a, b) => {
    if (a.groupId === -1) return 1
    if (b.groupId === -1) return -1
    return 0
  })

  return result
}

// --- Port Connections (real-time push) ---
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidepanel') {
    connectedPorts.push(port)

    port.onMessage.addListener(async (msg) => {
      if (msg.type === 'GET_TAB_STATE') {
        const groups = await getGroupedTabState()
        port.postMessage({ type: 'TAB_STATE_UPDATE', groups })
      }
    })

    port.onDisconnect.addListener(() => {
      const idx = connectedPorts.indexOf(port)
      if (idx > -1) connectedPorts.splice(idx, 1)
    })
  }
})

async function broadcastTabState() {
  if (connectedPorts.length === 0 || isOrganizing) return
  const groups = await getGroupedTabState()
  for (const port of connectedPorts) {
    port.postMessage({ type: 'TAB_STATE_UPDATE', groups })
  }
}

// --- Message Handler (one-shot requests) ---
chrome.runtime.onMessage.addListener(
  (message: MessageToBackground, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse)
    return true // keep channel open for async
  }
)

async function handleMessage(message: MessageToBackground) {
  switch (message.type) {
    case 'ORGANIZE_TABS': {
      await organizeTabs()
      await broadcastTabState()
      return { type: 'ORGANIZE_COMPLETE', success: true }
    }

    case 'DEORGANIZE_TABS': {
      const tabs = await chrome.tabs.query({ currentWindow: true })
      const groupedTabIds = tabs
        .filter(t => t.id && t.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE)
        .map(t => t.id!)
      if (groupedTabIds.length > 0) {
        await chrome.tabs.ungroup(groupedTabIds)
      }
      await broadcastTabState()
      return { type: 'ORGANIZE_COMPLETE', success: true }
    }

    case 'GET_TAB_STATE': {
      const groups = await getGroupedTabState()
      return { type: 'TAB_STATE_UPDATE', groups }
    }

    case 'MOVE_TAB_TO_GROUP': {
      if (message.targetGroupId === -1) {
        await chrome.tabs.ungroup(message.tabId)
      } else {
        await chrome.tabs.group({ tabIds: message.tabId, groupId: message.targetGroupId })
      }
      await broadcastTabState()
      return { type: 'TAB_STATE_UPDATE', groups: await getGroupedTabState() }
    }

    case 'RENAME_GROUP': {
      await chrome.tabGroups.update(message.groupId, { title: message.title })
      await broadcastTabState()
      return { success: true }
    }

    case 'RECOLOR_GROUP': {
      await chrome.tabGroups.update(message.groupId, { color: message.color })
      await broadcastTabState()
      return { success: true }
    }

    case 'TOGGLE_COLLAPSE_GROUP': {
      await chrome.tabGroups.update(message.groupId, { collapsed: message.collapsed })
      await broadcastTabState()
      return { success: true }
    }

    case 'CLOSE_TAB': {
      await chrome.tabs.remove(message.tabId)
      return { success: true }
    }

    case 'ACTIVATE_TAB': {
      await chrome.tabs.update(message.tabId, { active: true })
      const tab = await chrome.tabs.get(message.tabId)
      await chrome.windows.update(tab.windowId, { focused: true })
      return { success: true }
    }

    case 'UPDATE_SETTINGS': {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
      const current = (result[STORAGE_KEYS.SETTINGS] as Settings) ?? DEFAULT_SETTINGS
      const updated = { ...current, ...message.settings }
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated })
      for (const port of connectedPorts) {
        port.postMessage({ type: 'SETTINGS_UPDATE', settings: updated })
      }
      return { type: 'SETTINGS_UPDATE', settings: updated }
    }

    case 'GET_SETTINGS': {
      const res = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
      const settings = (res[STORAGE_KEYS.SETTINGS] as Settings) ?? DEFAULT_SETTINGS
      return { type: 'SETTINGS_UPDATE', settings }
    }
  }
}
