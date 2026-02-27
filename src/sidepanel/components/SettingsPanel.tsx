import { useTabContext } from '../context/TabContext'
import { TEMPLATES } from '../../shared/constants'
import type { OrganizingTemplate, Theme } from '../../shared/types'

export function SettingsPanel() {
  const { settings, updateSettings } = useTabContext()

  return (
    <div className="p-4 space-y-5">
      {/* Appearance */}
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Appearance</h2>
        <div className="flex gap-2">
          {(['light', 'dark'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => updateSettings({ theme: t })}
              className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                settings.theme === t
                  ? 'bg-[var(--accent-muted)] border-[var(--accent)]'
                  : 'bg-[var(--bg-primary)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              <div className="flex justify-center mb-1.5">
                {t === 'light' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-primary)]">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-primary)]">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] capitalize">{t}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Organizing Style */}
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Organizing Style</h2>
        <div className="space-y-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSettings({ activeTemplate: t.id as OrganizingTemplate })}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                t.id === settings.activeTemplate
                  ? 'bg-[var(--accent-muted)] border-[var(--accent)]'
                  : 'bg-[var(--bg-primary)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--text-primary)]">{t.label}</p>
                {t.id === settings.activeTemplate && (
                  <span className="text-[10px] text-[var(--accent)] font-medium uppercase">Active</span>
                )}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Preferences</h2>
        <div className="space-y-4">
          {/* Auto Organize */}
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-primary)]">Auto-organize</p>
              <p className="text-xs text-[var(--text-tertiary)]">Automatically group new tabs</p>
            </div>
            <button
              onClick={() => updateSettings({ autoOrganize: !settings.autoOrganize })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                settings.autoOrganize ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoOrganize ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </label>

          {/* Ignore Pinned */}
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-primary)]">Ignore pinned tabs</p>
              <p className="text-xs text-[var(--text-tertiary)]">Don't move pinned tabs into groups</p>
            </div>
            <button
              onClick={() => updateSettings({ ignorePinnedTabs: !settings.ignorePinnedTabs })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                settings.ignorePinnedTabs ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.ignorePinnedTabs ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </label>

          {/* Ignore Internal */}
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-primary)]">Ignore browser pages</p>
              <p className="text-xs text-[var(--text-tertiary)]">Skip chrome://, about:// pages</p>
            </div>
            <button
              onClick={() => updateSettings({ ignoreInternalPages: !settings.ignoreInternalPages })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                settings.ignoreInternalPages ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.ignoreInternalPages ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-tertiary)]">
          Tab Organizer v1.0.0
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Double-click a group title to rename it. Click the color dot to change group color.
        </p>
      </div>
    </div>
  )
}
