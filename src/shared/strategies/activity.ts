import type { Settings, StrategyResult } from '../types'

const MINUTE = 60 * 1000
const STALE_THRESHOLD = 30 * MINUTE    // 30 minutes
const FORGOTTEN_THRESHOLD = 60 * MINUTE // 1 hour

const ACTIVITY_COLORS: Record<string, chrome.tabGroups.ColorEnum> = {
  'Active': 'green',
  'Stale': 'yellow',
  'Forgotten': 'red',
}

export function groupByActivity(
  tabs: chrome.tabs.Tab[],
  settings: Settings,
): StrategyResult {
  const result: StrategyResult = new Map()
  const now = Date.now()

  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue
    if (settings.ignorePinnedTabs && tab.pinned) continue
    if (settings.ignoreInternalPages && isInternalUrl(tab.url)) continue

    // Use lastAccessed if available, otherwise treat as active
    const lastAccessed = (tab as chrome.tabs.Tab & { lastAccessed?: number }).lastAccessed
    let bucket: string

    if (!lastAccessed || tab.active) {
      bucket = 'Active'
    } else {
      const idle = now - lastAccessed
      if (idle < STALE_THRESHOLD) {
        bucket = 'Active'
      } else if (idle < FORGOTTEN_THRESHOLD) {
        bucket = 'Stale'
      } else {
        bucket = 'Forgotten'
      }
    }

    const color = ACTIVITY_COLORS[bucket]
    if (!result.has(bucket)) result.set(bucket, { tabIds: [], color })
    result.get(bucket)!.tabIds.push(tab.id)
  }

  return result
}

function isInternalUrl(url: string): boolean {
  return url.startsWith('chrome:') || url.startsWith('chrome-extension:') ||
    url.startsWith('about:') || url.startsWith('edge:') || url.startsWith('brave:')
}
