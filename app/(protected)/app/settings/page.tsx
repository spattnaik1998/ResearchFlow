'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/Button';

type SettingCategory = 'appearance' | 'search' | 'workspaces' | 'notifications' | 'keyboard' | 'export' | 'privacy';

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('appearance');
  const {
    theme: themeSetting,
    accentColor,
    fontSize,
    animationsEnabled,
    autoSummarize,
    autoGenerateQuestions,
    historyLimit,
    autoClearHistory,
    enableToasts,
    toastDuration,
    enableVimMode,
    defaultExportFormat,
    includeTimestamps,
    includeSources,
    autoCopyShareUrl,
    enableAnalytics,
    setTheme,
    setAccentColor,
    setFontSize,
    setAnimationsEnabled,
    setAutoSummarize,
    setAutoGenerateQuestions,
    setHistoryLimit,
    setAutoClearHistory,
    setEnableToasts,
    setToastDuration,
    setEnableVimMode,
    setDefaultExportFormat,
    setIncludeTimestamps,
    setIncludeSources,
    setAutoCopyShareUrl,
    setEnableAnalytics,
    resetToDefaults,
  } = useSettingsStore();

  const { setTheme: setThemeMode } = useTheme();

  const categories: Array<{ id: SettingCategory; label: string; icon: string }> = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'search', label: 'Search & History', icon: '🔍' },
    { id: 'workspaces', label: 'Workspaces', icon: '🗂️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'keyboard', label: 'Keyboard', icon: '⌨️' },
    { id: 'export', label: 'Export & Sharing', icon: '📤' },
    { id: 'privacy', label: 'Privacy & Data', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="flex h-full gap-0">
        {/* Sidebar Navigation */}
        <div className="w-56 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto sticky top-0 h-screen">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
          </div>

          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium ${
                  activeCategory === category.id
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetToDefaults();
                setThemeMode('light');
              }}
              className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              ↺ Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 p-8 overflow-y-auto max-w-4xl">
          {/* Appearance Settings */}
          {activeCategory === 'appearance' && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Appearance</h3>

              {/* Theme */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Theme
                </label>
                <div className="flex gap-3">
                  {['light', 'dark', 'auto'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t as any);
                        if (t !== 'auto') {
                          setThemeMode(t as any);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        themeSetting === t
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                          : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                      }`}
                    >
                      {t === 'light' && '☀️'} {t === 'dark' && '🌙'} {t === 'auto' && '🔄'}{' '}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Accent Color
                </label>
                <div className="flex gap-3">
                  {['teal', 'purple', 'blue', 'green'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color as any)}
                      className={`w-12 h-12 rounded-full border-4 transition-transform hover:scale-110 ${
                        accentColor === color
                          ? `border-${color}-600`
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      style={{
                        backgroundColor:
                          color === 'teal'
                            ? '#0f4c5c'
                            : color === 'purple'
                              ? '#7c3aed'
                              : color === 'blue'
                                ? '#2563eb'
                                : '#059669',
                      }}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Font Size
                </label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large', 'extra-large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size as any)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        fontSize === size
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {size === 'small' && 'S'}
                      {size === 'medium' && 'M'}
                      {size === 'large' && 'L'}
                      {size === 'extra-large' && 'XL'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div className="mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={animationsEnabled}
                    onChange={(e) => setAnimationsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Enable Animations
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Search & History Settings */}
          {activeCategory === 'search' && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Search & History</h3>

              {/* Auto-Summarize */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSummarize}
                    onChange={(e) => setAutoSummarize(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Auto-Summarize Results
                  </span>
                </label>
              </div>

              {/* Auto-Questions */}
              <div className="mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateQuestions}
                    onChange={(e) => setAutoGenerateQuestions(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Auto-Generate Related Questions
                  </span>
                </label>
              </div>

              {/* History Limit */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  History Limit ({historyLimit} entries)
                </label>
                <input
                  type="range"
                  min="25"
                  max="500"
                  step="25"
                  value={historyLimit}
                  onChange={(e) => setHistoryLimit(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Auto-Clear History */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Auto-Clear History
                </label>
                <select
                  value={autoClearHistory}
                  onChange={(e) => setAutoClearHistory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="never">Never</option>
                  <option value="7">After 7 days</option>
                  <option value="30">After 30 days</option>
                  <option value="90">After 90 days</option>
                </select>
              </div>
            </div>
          )}

          {/* Workspaces Settings */}
          {activeCategory === 'workspaces' && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Workspaces</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Workspace settings are managed from the workspace switcher. Use this section for default behaviors.
              </p>
            </div>
          )}

          {/* Notifications Settings */}
          {activeCategory === 'notifications' && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Notifications</h3>

              {/* Enable Toasts */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableToasts}
                    onChange={(e) => setEnableToasts(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Enable Toast Notifications
                  </span>
                </label>
              </div>

              {/* Toast Duration */}
              {enableToasts && (
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Auto-Dismiss Duration ({Math.round(toastDuration / 1000)}s)
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="1000"
                    value={toastDuration}
                    onChange={(e) => setToastDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* Keyboard Settings */}
          {activeCategory === 'keyboard' && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Keyboard</h3>

              {/* Vim Mode */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVimMode}
                    onChange={(e) => setEnableVimMode(e.target.checked)}
                    disabled
                    className="w-4 h-4 rounded opacity-50"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Vim Mode (Coming soon)
                  </span>
                </label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  ℹ️ Press <kbd className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">?</kbd> to view all keyboard shortcuts.
                </p>
              </div>
            </div>
          )}

          {/* Export & Sharing Settings */}
          {activeCategory === 'export' && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Export & Sharing</h3>

              {/* Default Export Format */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Default Export Format
                </label>
                <select
                  value={defaultExportFormat}
                  onChange={(e) => setDefaultExportFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="markdown">Markdown (.md)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>

              {/* Include Timestamps */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTimestamps}
                    onChange={(e) => setIncludeTimestamps(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Include Timestamps
                  </span>
                </label>
              </div>

              {/* Include Sources */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSources}
                    onChange={(e) => setIncludeSources(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Include Sources
                  </span>
                </label>
              </div>

              {/* Auto-Copy Share URL */}
              <div className="mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCopyShareUrl}
                    onChange={(e) => setAutoCopyShareUrl(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Auto-Copy Share URL
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Privacy & Data Settings */}
          {activeCategory === 'privacy' && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Privacy & Data</h3>

              {/* Analytics */}
              <div className="mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAnalytics}
                    onChange={(e) => setEnableAnalytics(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Enable Analytics
                  </span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Help us improve by sharing anonymous usage data
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  ⚠️ Your data is stored locally in your browser. No data is sent to servers unless you explicitly enable Supabase integration (Phase 3).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
