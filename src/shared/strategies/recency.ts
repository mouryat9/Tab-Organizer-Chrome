import type { Settings, StrategyResult } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

const RECENCY_COLORS: Record<string, chrome.tabGroups.ColorEnum> = {
  'Today': 'green',
  'Yesterday': 'blue',
  'This Week': 'yellow',
  'Older': 'orange',
  'Unknown': 'grey',
}

export function groupByRecency(
  tabs: chrome.tabs.Tab[],
  settings: Settings,
  tabOpenTimes: Record<string, number>,
): StrategyResult {
  const result: StrategyResult = new Map()
  const now = Date.now()

  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue
    if (settings.ignorePinnedTabs && tab.pinned) continue
    if (settings.ignoreInternalPages && isInternalUrl(tab.url)) continue

    const ts = tabOpenTimes[String(tab.id)]
    let bucket: string

    if (!ts) {
      bucket = 'Unknown'
    } else {
      const age = now - ts
      if (age < DAY_MS) {
        bucket = 'Today'
      } else if (age < 2 * DAY_MS) {
        bucket = 'Yesterday'
      } else if (age < 7 * DAY_MS) {
        bucket = 'This Week'
      } else {
        bucket = 'Older'
      }
    }

    const color = RECENCY_COLORS[bucket]
    if (!result.has(bucket)) result.set(bucket, { tabIds: [], color })
    result.get(bucket)!.tabIds.push(tab.id)
  }

  return result
}

function isInternalUrl(url: string): boolean {
  return url.startsWith('chrome:') || url.startsWith('chrome-extension:') ||
    url.startsWith('about:') || url.startsWith('edge:') || url.startsWith('brave:')
}
