import type { Settings } from './types'

export type MessageToBackground =
  | { type: 'ORGANIZE_TABS' }
  | { type: 'DEORGANIZE_TABS' }
  | { type: 'GET_TAB_STATE' }
  | { type: 'MOVE_TAB_TO_GROUP'; tabId: number; targetGroupId: number }
  | { type: 'RENAME_GROUP'; groupId: number; title: string }
  | { type: 'RECOLOR_GROUP'; groupId: number; color: chrome.tabGroups.ColorEnum }
  | { type: 'TOGGLE_COLLAPSE_GROUP'; groupId: number; collapsed: boolean }
  | { type: 'CLOSE_TAB'; tabId: number }
  | { type: 'ACTIVATE_TAB'; tabId: number }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<Settings> }
  | { type: 'GET_SETTINGS' }

export type MessageFromBackground =
  | { type: 'TAB_STATE_UPDATE'; groups: import('./types').GroupedTabState[] }
  | { type: 'SETTINGS_UPDATE'; settings: Settings }
  | { type: 'ORGANIZE_COMPLETE'; success: boolean; error?: string }

export async function sendToBackground<T extends MessageToBackground>(
  message: T
): Promise<MessageFromBackground> {
  return chrome.runtime.sendMessage(message)
}
