import { useDraggable } from '@dnd-kit/core'
import { useTabContext } from '../context/TabContext'
import type { TabInfo } from '../../shared/types'

interface Props {
  tab: TabInfo
  groupId: number
}

export function TabItem({ tab, groupId }: Props) {
  const { closeTab, activateTab } = useTabContext()

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tab.id,
    data: { groupId },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 px-3 py-1.5 mx-1 rounded hover:bg-[#1a1a2e] group cursor-grab active:cursor-grabbing transition-colors ${
        isDragging ? 'opacity-50 z-50' : ''
      } ${tab.active ? 'bg-[#1a1a2e]/60' : ''}`}
    >
      {/* Favicon */}
      <img
        src={tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239aa0a6"><rect width="24" height="24" rx="4"/></svg>'}
        alt=""
        className="w-4 h-4 rounded shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239aa0a6"><rect width="24" height="24" rx="4"/></svg>'
        }}
      />

      {/* Title + URL */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => activateTab(tab.id)}
      >
        <p className="text-xs text-white truncate leading-tight">
          {tab.title || 'Untitled'}
        </p>
        <p className="text-[10px] text-gray-500 truncate leading-tight">
          {tab.domain}
        </p>
      </div>

      {/* Active indicator */}
      {tab.active && (
        <div className="w-1.5 h-1.5 rounded-full bg-[#e94560] shrink-0" />
      )}

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          closeTab(tab.id)
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all shrink-0"
        title="Close tab"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
