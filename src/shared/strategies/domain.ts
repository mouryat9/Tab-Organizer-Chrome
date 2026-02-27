import { extractDomain, domainToGroupTitle } from '../domain-utils'
import type { Settings, StrategyResult } from '../types'

export function groupByDomain(
  tabs: chrome.tabs.Tab[],
  settings: Settings,
): StrategyResult {
  const domainMap: StrategyResult = new Map()

  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue
    if (settings.ignorePinnedTabs && tab.pinned) continue

    const domain = extractDomain(tab.url)
    if (!domain) {
      if (settings.ignoreInternalPages) continue
      const key = 'Browser'
      if (!domainMap.has(key)) domainMap.set(key, { tabIds: [] })
      domainMap.get(key)!.tabIds.push(tab.id)
      continue
    }

    const title = domainToGroupTitle(domain)
    if (!domainMap.has(title)) domainMap.set(title, { tabIds: [] })
    domainMap.get(title)!.tabIds.push(tab.id)
  }

  return domainMap
}
