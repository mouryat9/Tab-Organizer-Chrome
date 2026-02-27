export type OrganizingTemplate = 'domain' | 'session' | 'category' | 'recency' | 'activity'

export interface TemplateInfo {
  id: OrganizingTemplate
  label: string
  description: string
}

export interface TabInfo {
  id: number
  title: string
  url: string
  domain: string
  favIconUrl: string | undefined
  active: boolean
  pinned: boolean
  groupId: number
}

export interface GroupedTabState {
  groupId: number // -1 for ungrouped
  title: string
  color: chrome.tabGroups.ColorEnum
  collapsed: boolean
  tabs: TabInfo[]
}

export interface Settings {
  autoOrganize: boolean
  debounceMs: number
  ignorePinnedTabs: boolean
  ignoreInternalPages: boolean
  activeTemplate: OrganizingTemplate
}

export const DEFAULT_SETTINGS: Settings = {
  autoOrganize: false,
  debounceMs: 500,
  ignorePinnedTabs: true,
  ignoreInternalPages: true,
  activeTemplate: 'domain',
}

// Strategy function signature: takes tabs + extra data, returns groupTitle -> tabIds
export type StrategyResult = Map<string, { tabIds: number[]; color?: chrome.tabGroups.ColorEnum }>
