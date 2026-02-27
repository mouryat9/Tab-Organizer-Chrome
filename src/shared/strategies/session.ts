import type { Settings, StrategyResult } from '../types'

const SESSION_GAP_MS = 15 * 60 * 1000 // 15 minutes

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  const m = minutes.toString().padStart(2, '0')
  return `${h}:${m} ${ampm}`
}

export function groupBySession(
  tabs: chrome.tabs.Tab[],
  settings: Settings,
  tabOpenTimes: Record<string, number>,
): StrategyResult {
  const result: StrategyResult = new Map()

  // Build tab list with timestamps
  const tabsWithTime: { id: number; timestamp: number }[] = []
  const noTimestamp: number[] = []

  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue
    if (settings.ignorePinnedTabs && tab.pinned) continue
    if (settings.ignoreInternalPages && isInternalUrl(tab.url)) continue

    const ts = tabOpenTimes[String(tab.id)]
    if (ts) {
      tabsWithTime.push({ id: tab.id, timestamp: ts })
    } else {
      noTimestamp.push(tab.id)
    }
  }

  // Sort by open time
  tabsWithTime.sort((a, b) => a.timestamp - b.timestamp)

  // Walk through and detect session gaps
  let sessionIndex = 1
  let sessionStart = 0

  for (let i = 0; i < tabsWithTime.length; i++) {
    if (i === 0) {
      sessionStart = tabsWithTime[i].timestamp
    } else {
      const gap = tabsWithTime[i].timestamp - tabsWithTime[i - 1].timestamp
      if (gap > SESSION_GAP_MS) {
        sessionIndex++
        sessionStart = tabsWithTime[i].timestamp
      }
    }

    const title = `Session ${sessionIndex} (${formatTime(sessionStart)})`
    if (!result.has(title)) result.set(title, { tabIds: [] })
    result.get(title)!.tabIds.push(tabsWithTime[i].id)
  }

  // Tabs without timestamps
  if (noTimestamp.length > 0) {
    result.set('Unknown Session', { tabIds: noTimestamp, color: 'grey' })
  }

  return result
}

function isInternalUrl(url: string): boolean {
  return url.startsWith('chrome:') || url.startsWith('chrome-extension:') ||
    url.startsWith('about:') || url.startsWith('edge:') || url.startsWith('brave:')
}
