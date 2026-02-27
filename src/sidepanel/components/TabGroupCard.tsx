import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useTabContext } from '../context/TabContext'
import { TabItem } from './TabItem'
import { GROUP_COLORS } from '../../shared/constants'
import type { GroupedTabState } from '../../shared/types'

// Chrome's actual tab group colors (from Chromium source)
// These match exactly what Chrome renders on the tab strip
const CHROME_COLORS_DARK: Record<string, string> = {
  blue: '#8ab4f8',
  red: '#f28b82',
  yellow: '#fdd663',
  green: '#81c995',
  pink: '#ff8bcb',
  purple: '#c58af9',
  cyan: '#78d9ec',
  orange: '#fcad70',
  grey: '#9aa0a6',
}

const CHROME_COLORS_LIGHT: Record<string, string> = {
  blue: '#1a73e8',
  red: '#d93025',
  yellow: '#f9ab00',
  green: '#188038',
  pink: '#d01884',
  purple: '#9334e6',
  cyan: '#007b83',
  orange: '#e8710a',
  grey: '#5f6368',
}

interface Props {
  group: GroupedTabState
}

export function TabGroupCard({ group }: Props) {
  const { renameGroup, recolorGroup, toggleCollapseGroup, settings } = useTabContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(group.title)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.groupId}`,
    data: { groupId: group.groupId },
  })

  const colorMap = settings.theme === 'light' ? CHROME_COLORS_LIGHT : CHROME_COLORS_DARK
  const color = colorMap[group.color] || colorMap.grey

  function handleRename() {
    if (editTitle.trim() && editTitle !== group.title && group.groupId !== -1) {
      renameGroup(group.groupId, editTitle.trim())
    }
    setIsEditing(false)
  }

  function handleColorChange(newColor: chrome.tabGroups.ColorEnum) {
    if (group.groupId !== -1) {
      recolorGroup(group.groupId, newColor)
    }
    setShowColorPicker(false)
  }

  function handleCollapseToggle() {
    const next = !collapsed
    setCollapsed(next)
    if (group.groupId !== -1) {
      toggleCollapseGroup(group.groupId, next)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border ${
        isOver ? 'border-[var(--accent)] bg-[var(--accent-muted)]' : 'border-[var(--border)] bg-[var(--bg-secondary)]'
      }`}
    >
      {/* Group Header */}
      <div className="flex items-center gap-2 p-2.5">
        <button
          onClick={handleCollapseToggle}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${collapsed ? '-rotate-90' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Color dot */}
        <button
          onClick={() => group.groupId !== -1 && setShowColorPicker(!showColorPicker)}
          className="w-3 h-3 rounded-full shrink-0 hover:ring-2 ring-[var(--text-primary)]/30 transition-all"
          style={{ backgroundColor: color }}
          title="Change color"
        />

        {/* Title */}
        {isEditing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setIsEditing(false)
            }}
            autoFocus
            className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
        ) : (
          <span
            className={`flex-1 text-sm font-medium text-[var(--text-primary)] truncate ${
              group.groupId !== -1 ? 'cursor-pointer hover:text-[var(--accent)]' : ''
            }`}
            onDoubleClick={() => {
              if (group.groupId !== -1) {
                setEditTitle(group.title)
                setIsEditing(true)
              }
            }}
          >
            {group.title}
          </span>
        )}

        <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-primary)] px-1.5 py-0.5 rounded">
          {group.tabs.length}
        </span>
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <div className="flex gap-1.5 px-3 pb-2">
          {GROUP_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`w-5 h-5 rounded-full transition-all ${
                c === group.color ? 'ring-2 ring-[var(--text-primary)] scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: colorMap[c] }}
              title={c}
            />
          ))}
        </div>
      )}

      {/* Tab List */}
      {!collapsed && (
        <div className="pb-1">
          {group.tabs.map(tab => (
            <TabItem key={tab.id} tab={tab} groupId={group.groupId} />
          ))}
        </div>
      )}
    </div>
  )
}
