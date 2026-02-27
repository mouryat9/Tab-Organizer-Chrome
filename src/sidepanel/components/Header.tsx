import { useState, useRef, useEffect } from 'react'
import { useTabContext } from '../context/TabContext'
import { SearchBar } from './SearchBar'
import { TEMPLATES } from '../../shared/constants'
import type { OrganizingTemplate } from '../../shared/types'

export function Header() {
  const { organizeTabs, showSettings, setShowSettings, groups, settings, updateSettings } = useTabContext()
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const totalTabs = groups.reduce((sum, g) => sum + g.tabs.length, 0)
  const activeTemplate = TEMPLATES.find(t => t.id === settings.activeTemplate) ?? TEMPLATES[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTemplateDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleTemplateChange(id: OrganizingTemplate) {
    updateSettings({ activeTemplate: id })
    setShowTemplateDropdown(false)
  }

  return (
    <div className="sticky top-0 z-10 bg-[#16213e] border-b border-[#0f3460] p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white">Tab Organizer</h1>
          <span className="text-xs text-gray-400 bg-[#1a1a2e] px-2 py-0.5 rounded-full">
            {totalTabs} tabs
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg hover:bg-[#1a1a2e] text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </div>

      {/* Template Selector + Search + Organize */}
      <div className="flex gap-2 items-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a2e] border border-[#0f3460] rounded-lg text-sm text-white hover:border-[#e94560] transition-colors"
            title={activeTemplate.description}
          >
            <span className="truncate max-w-[90px]">{activeTemplate.label}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform shrink-0 ${showTemplateDropdown ? 'rotate-180' : ''}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {showTemplateDropdown && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#16213e] border border-[#0f3460] rounded-lg shadow-xl z-50 overflow-hidden">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`w-full text-left px-3 py-2.5 hover:bg-[#1a1a2e] transition-colors ${
                    t.id === settings.activeTemplate ? 'bg-[#1a1a2e] border-l-2 border-l-[#e94560]' : ''
                  }`}
                >
                  <p className="text-sm text-white font-medium">{t.label}</p>
                  <p className="text-[11px] text-gray-500 leading-tight">{t.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <SearchBar />
        <button
          onClick={organizeTabs}
          className="px-4 py-2 bg-[#e94560] hover:bg-[#c73e54] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          Organize
        </button>
      </div>
    </div>
  )
}
