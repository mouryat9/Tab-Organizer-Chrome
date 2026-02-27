import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useTabContext } from '../context/TabContext'
import { TabItem } from './TabItem'
import { GROUP_COLORS } from '../../shared/constants'
import type { GroupedTabState } from '../../shared/types'

const COLOR_MAP: Record<string, string> = {
  blue: '#4285f4',
  red: '#ea4335',
  yellow: '#fbbc04',
  green: '#34a853',
  pink: '#ff6d94',
  purple: '#a142f4',
  cyan: '#24c1e0',
  orange: '#fa903e',
  grey: '#9aa0a6',
}

interface Props {
  group: GroupedTabState
}

export function TabGroupCard({ group }: Props) {
  const { renameGroup, recolorGroup, toggleCollapseGroup } = useTabContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(group.title)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.groupId}`,
    data: { groupId: group.groupId },
  })

  const color = COLOR_MAP[group.color] || COLOR_MAP.grey

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
      className={`rounded-lg border transition-colors ${
        isOver ? 'border-[#e94560] bg-[#1a1a2e]/80' : 'border-[#0f3460] bg-[#16213e]'
      }`}
    >
      {/* Group Header */}
      <div className="flex items-center gap-2 p-2.5">
        <button
          onClick={handleCollapseToggle}
          className="text-gray-400 hover:text-white transition-colors"
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
          className="w-3 h-3 rounded-full shrink-0 hover:ring-2 ring-white/30 transition-all"
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
            className="flex-1 bg-[#1a1a2e] border border-[#0f3460] rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-[#e94560]"
          />
        ) : (
          <span
            className={`flex-1 text-sm font-medium text-white truncate ${
              group.groupId !== -1 ? 'cursor-pointer hover:text-[#e94560]' : ''
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

        <span className="text-xs text-gray-500 bg-[#1a1a2e] px-1.5 py-0.5 rounded">
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
                c === group.color ? 'ring-2 ring-white scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: COLOR_MAP[c] }}
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
