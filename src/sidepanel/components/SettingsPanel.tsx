import { useTabContext } from '../context/TabContext'
import { TEMPLATES } from '../../shared/constants'
import type { OrganizingTemplate } from '../../shared/types'

export function SettingsPanel() {
  const { settings, updateSettings } = useTabContext()

  return (
    <div className="p-4 space-y-5">
      {/* Organizing Style */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Organizing Style</h2>
        <div className="space-y-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSettings({ activeTemplate: t.id as OrganizingTemplate })}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                t.id === settings.activeTemplate
                  ? 'bg-[#e94560]/10 border-[#e94560]'
                  : 'bg-[#1a1a2e] border-[#0f3460] hover:border-[#e94560]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{t.label}</p>
                {t.id === settings.activeTemplate && (
                  <span className="text-[10px] text-[#e94560] font-medium uppercase">Active</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Preferences</h2>
        <div className="space-y-4">
          {/* Auto Organize */}
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Auto-organize</p>
              <p className="text-xs text-gray-500">Automatically group new tabs</p>
            </div>
            <button
              onClick={() => updateSettings({ autoOrganize: !settings.autoOrganize })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                settings.autoOrganize ? 'bg-[#e94560]' : 'bg-gray-600'
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
              <p className="text-sm text-white">Ignore pinned tabs</p>
              <p className="text-xs text-gray-500">Don't move pinned tabs into groups</p>
            </div>
            <button
              onClick={() => updateSettings({ ignorePinnedTabs: !settings.ignorePinnedTabs })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                settings.ignorePinnedTabs ? 'bg-[#e94560]' : 'bg-gray-600'
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
              <p className="text-sm text-white">Ignore browser pages</p>
              <p className="text-xs text-gray-500">Skip chrome://, about:// pages</p>
            </div>
            <button
              onClick={() => updateSettings({ ignoreInternalPages: !settings.ignoreInternalPages })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                settings.ignoreInternalPages ? 'bg-[#e94560]' : 'bg-gray-600'
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
      <div className="pt-3 border-t border-[#0f3460]">
        <p className="text-xs text-gray-500">
          Tab Organizer v1.0.0
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Double-click a group title to rename it. Click the color dot to change group color.
        </p>
      </div>
    </div>
  )
}
