import { extractDomain } from '../domain-utils'
import { CATEGORY_RULES, CATEGORY_COLORS } from '../constants'
import type { Settings, StrategyResult } from '../types'

// URL keyword patterns for fallback categorization
const URL_KEYWORD_CATEGORIES: [RegExp, string][] = [
  [/\/docs?\//i, 'Research'],
  [/\/wiki\//i, 'Research'],
  [/\/learn/i, 'Research'],
  [/\/tutorial/i, 'Research'],
  [/\/shop|\/cart|\/checkout|\/product/i, 'Shopping'],
  [/\/watch|\/video|\/stream/i, 'Entertainment'],
  [/\/chat|\/message|\/feed/i, 'Social'],
  [/\/dashboard|\/admin|\/project|\/repo/i, 'Work'],
]

export function groupByCategory(
  tabs: chrome.tabs.Tab[],
  settings: Settings,
): StrategyResult {
  const result: StrategyResult = new Map()

  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue
    if (settings.ignorePinnedTabs && tab.pinned) continue
    if (settings.ignoreInternalPages && isInternalUrl(tab.url)) continue

    const domain = extractDomain(tab.url)
    let category = 'Other'

    // First try domain-based lookup
    if (domain) {
      const domainLower = domain.toLowerCase()
      if (CATEGORY_RULES[domainLower]) {
        category = CATEGORY_RULES[domainLower]
      } else {
        // Try URL keyword matching as fallback
        for (const [pattern, cat] of URL_KEYWORD_CATEGORIES) {
          if (pattern.test(tab.url)) {
            category = cat
            break
          }
        }
      }
    }

    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
    if (!result.has(category)) result.set(category, { tabIds: [], color })
    result.get(category)!.tabIds.push(tab.id)
  }

  return result
}

function isInternalUrl(url: string): boolean {
  return url.startsWith('chrome:') || url.startsWith('chrome-extension:') ||
    url.startsWith('about:') || url.startsWith('edge:') || url.startsWith('brave:')
}
