import { useMemo } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { useTabContext } from '../context/TabContext'
import { TabGroupCard } from './TabGroupCard'
import type { GroupedTabState } from '../../shared/types'

export function TabOverview() {
  const { groups, searchQuery, moveTabToGroup } = useTabContext()

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups

    const query = searchQuery.toLowerCase()
    return groups
      .map((group): GroupedTabState => ({
        ...group,
        tabs: group.tabs.filter(
          tab =>
            tab.title.toLowerCase().includes(query) ||
            tab.url.toLowerCase().includes(query) ||
            tab.domain.toLowerCase().includes(query)
        ),
      }))
      .filter(group => group.tabs.length > 0)
  }, [groups, searchQuery])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const tabId = active.id as number
    const targetGroupId = over.data.current?.groupId as number | undefined

    if (targetGroupId !== undefined) {
      const sourceTab = groups.flatMap(g => g.tabs).find(t => t.id === tabId)
      if (sourceTab && sourceTab.groupId !== targetGroupId) {
        moveTabToGroup(tabId, targetGroupId)
      }
    }
  }

  if (filteredGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--text-tertiary)]">
        {searchQuery ? (
          <>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-50">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p className="text-sm">No tabs match "{searchQuery}"</p>
          </>
        ) : (
          <>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-50">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p className="text-sm">No tabs open</p>
            <p className="text-xs mt-1">Open some tabs and click Organize</p>
          </>
        )}
      </div>
    )
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="p-3 space-y-2">
        {filteredGroups.map(group => (
          <TabGroupCard key={group.groupId} group={group} />
        ))}
      </div>
    </DndContext>
  )
}
