import type { OrganizingTemplate, Settings, StrategyResult } from '../types'
import { groupByDomain } from './domain'
import { groupBySession } from './session'
import { groupByCategory } from './category'
import { groupByRecency } from './recency'
import { groupByActivity } from './activity'

export function executeStrategy(
  template: OrganizingTemplate,
  tabs: chrome.tabs.Tab[],
  settings: Settings,
  tabOpenTimes: Record<string, number>,
): StrategyResult {
  switch (template) {
    case 'domain':
      return groupByDomain(tabs, settings)
    case 'session':
      return groupBySession(tabs, settings, tabOpenTimes)
    case 'category':
      return groupByCategory(tabs, settings)
    case 'recency':
      return groupByRecency(tabs, settings, tabOpenTimes)
    case 'activity':
      return groupByActivity(tabs, settings)
    default:
      return groupByDomain(tabs, settings)
  }
}
