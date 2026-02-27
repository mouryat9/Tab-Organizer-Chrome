import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import type { GroupedTabState, Settings, Theme } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'
import { sendToBackground } from '../../shared/messaging'

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

interface TabContextValue {
  groups: GroupedTabState[]
  settings: Settings
  searchQuery: string
  setSearchQuery: (q: string) => void
  showSettings: boolean
  setShowSettings: (v: boolean) => void
  organizeTabs: () => Promise<void>
  deorganizeTabs: () => Promise<void>
  moveTabToGroup: (tabId: number, groupId: number) => Promise<void>
  renameGroup: (groupId: number, title: string) => Promise<void>
  recolorGroup: (groupId: number, color: chrome.tabGroups.ColorEnum) => Promise<void>
  toggleCollapseGroup: (groupId: number, collapsed: boolean) => Promise<void>
  closeTab: (tabId: number) => Promise<void>
  activateTab: (tabId: number) => Promise<void>
  updateSettings: (settings: Partial<Settings>) => Promise<void>
  toggleTheme: () => void
}

const TabContext = createContext<TabContextValue | null>(null)

export function TabProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<GroupedTabState[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const portRef = useRef<chrome.runtime.Port | null>(null)

  // Apply theme on settings change
  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  // Apply default theme immediately
  useEffect(() => {
    applyTheme(DEFAULT_SETTINGS.theme)
  }, [])

  useEffect(() => {
    // Establish long-lived port connection
    const port = chrome.runtime.connect({ name: 'sidepanel' })
    portRef.current = port

    port.onMessage.addListener((msg) => {
      if (msg.type === 'TAB_STATE_UPDATE') {
        setGroups(msg.groups)
      } else if (msg.type === 'SETTINGS_UPDATE') {
        setSettings(msg.settings)
      }
    })

    // Request initial state
    port.postMessage({ type: 'GET_TAB_STATE' })
    sendToBackground({ type: 'GET_SETTINGS' }).then((res) => {
      if (res.type === 'SETTINGS_UPDATE') {
        setSettings(res.settings)
      }
    })

    port.onDisconnect.addListener(() => {
      portRef.current = null
    })

    return () => {
      port.disconnect()
    }
  }, [])

  const organizeTabs = useCallback(async () => {
    await sendToBackground({ type: 'ORGANIZE_TABS' })
  }, [])

  const deorganizeTabs = useCallback(async () => {
    await sendToBackground({ type: 'DEORGANIZE_TABS' })
  }, [])

  const moveTabToGroup = useCallback(async (tabId: number, groupId: number) => {
    await sendToBackground({ type: 'MOVE_TAB_TO_GROUP', tabId, targetGroupId: groupId })
  }, [])

  const renameGroup = useCallback(async (groupId: number, title: string) => {
    await sendToBackground({ type: 'RENAME_GROUP', groupId, title })
  }, [])

  const recolorGroup = useCallback(async (groupId: number, color: chrome.tabGroups.ColorEnum) => {
    await sendToBackground({ type: 'RECOLOR_GROUP', groupId, color })
  }, [])

  const toggleCollapseGroup = useCallback(async (groupId: number, collapsed: boolean) => {
    await sendToBackground({ type: 'TOGGLE_COLLAPSE_GROUP', groupId, collapsed })
  }, [])

  const closeTab = useCallback(async (tabId: number) => {
    await sendToBackground({ type: 'CLOSE_TAB', tabId })
  }, [])

  const activateTab = useCallback(async (tabId: number) => {
    await sendToBackground({ type: 'ACTIVATE_TAB', tabId })
  }, [])

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }))
    await sendToBackground({ type: 'UPDATE_SETTINGS', settings: partial })
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = settings.theme === 'dark' ? 'light' : 'dark'
    updateSettings({ theme: newTheme })
  }, [settings.theme, updateSettings])

  return (
    <TabContext.Provider
      value={{
        groups,
        settings,
        searchQuery,
        setSearchQuery,
        showSettings,
        setShowSettings,
        organizeTabs,
        deorganizeTabs,
        moveTabToGroup,
        renameGroup,
        recolorGroup,
        toggleCollapseGroup,
        closeTab,
        activateTab,
        updateSettings,
        toggleTheme,
      }}
    >
      {children}
    </TabContext.Provider>
  )
}

export function useTabContext() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('useTabContext must be used within TabProvider')
  return ctx
}
