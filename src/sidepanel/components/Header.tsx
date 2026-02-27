import { useState, useRef, useEffect } from 'react'
import { useTabContext } from '../context/TabContext'
import { SearchBar } from './SearchBar'
import { TEMPLATES } from '../../shared/constants'
import type { OrganizingTemplate } from '../../shared/types'

export function Header() {
  const { organizeTabs, deorganizeTabs, showSettings, setShowSettings, groups, settings, updateSettings, toggleTheme } = useTabContext()
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const totalTabs = groups.reduce((sum, g) => sum + g.tabs.length, 0)
  const activeTemplate = TEMPLATES.find(t => t.id === settings.activeTemplate) ?? TEMPLATES[0]
  const isDark = settings.theme === 'dark'

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
    <div className="sticky top-0 z-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Tab Organizer</h1>
          <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2 py-0.5 rounded-full">
            {totalTabs} tabs
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Template Selector + Search + Organize */}
      <div className="flex gap-2 items-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            title={activeTemplate.description}
          >
            <span className="truncate max-w-[90px]">{activeTemplate.label}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform shrink-0 ${showTemplateDropdown ? 'rotate-180' : ''}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {showTemplateDropdown && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl z-50 overflow-hidden">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`w-full text-left px-3 py-2.5 hover:bg-[var(--bg-primary)] transition-colors ${
                    t.id === settings.activeTemplate ? 'bg-[var(--bg-primary)] border-l-2 border-l-[var(--accent)]' : ''
                  }`}
                >
                  <p className="text-sm text-[var(--text-primary)] font-medium">{t.label}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">{t.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <SearchBar />
        <button
          onClick={deorganizeTabs}
          className="px-3 py-2 border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          title="Remove all tab groups and restore tabs to normal"
        >
          Reset
        </button>
        <button
          onClick={organizeTabs}
          className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          Organize
        </button>
      </div>
    </div>
  )
}
