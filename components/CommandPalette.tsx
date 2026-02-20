'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useCommandStore } from '@/stores/commandStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import type { Command } from '@/types';

const CATEGORY_LABELS = {
  search: 'Search',
  workspace: 'Workspaces',
  action: 'Actions',
  setting: 'Settings',
  history: 'History',
  knowledge: 'Knowledge',
};

export function CommandPalette({
  onSearch,
  onOpenHistory,
  onOpenSettings,
  historyCount = 0,
}: {
  onSearch?: () => void;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
  historyCount?: number;
}) {
  const { isOpen, close, query, setQuery } = useCommandStore();
  const { workspaces, switchWorkspace, activeWorkspaceId } = useWorkspaceStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build commands dynamically
  const commands: Command[] = useMemo(() => {
    const cmds: Command[] = [
      {
        id: 'new-search',
        label: 'New Search',
        category: 'action',
        icon: '🔍',
        shortcut: 'Cmd+N',
        action: () => {
          onSearch?.();
          close();
        },
      },
      {
        id: 'dashboard',
        label: 'View Dashboard',
        category: 'action',
        icon: '📊',
        shortcut: undefined,
        action: () => {
          router.push('/app/dashboard');
          close();
        },
      },
      {
        id: 'toggle-theme',
        label: `Toggle Dark Mode (${theme === 'dark' ? 'ON' : 'OFF'})`,
        category: 'setting',
        icon: theme === 'dark' ? '☀️' : '🌙',
        shortcut: 'Cmd+/',
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          close();
        },
      },
      {
        id: 'open-settings',
        label: 'Settings',
        category: 'setting',
        icon: '⚙️',
        shortcut: 'Cmd+,',
        action: () => {
          onOpenSettings?.();
          close();
        },
      },
      {
        id: 'open-history',
        label: `Search History (${historyCount})`,
        category: 'history',
        icon: '📜',
        shortcut: 'Cmd+H',
        action: () => {
          onOpenHistory?.();
          close();
        },
      },
      {
        id: 'open-knowledge',
        label: 'Knowledge Base',
        category: 'knowledge',
        icon: '📚',
        shortcut: 'Cmd+B',
        action: () => {
          window.dispatchEvent(new CustomEvent('open-knowledge'));
          close();
        },
      },
      {
        id: 'create-workspace',
        label: 'Create New Workspace',
        category: 'workspace',
        icon: '➕',
        shortcut: undefined,
        action: () => {
          // This will trigger a dialog in the parent
          window.dispatchEvent(new CustomEvent('create-workspace'));
          close();
        },
      },
      // Add workspace switching commands
      ...workspaces
        .filter((ws) => !ws.isArchived)
        .map((ws, i) => ({
          id: `workspace-${ws.id}`,
          label: `Switch to ${ws.name}`,
          category: 'workspace' as const,
          icon: ws.icon,
          shortcut: i < 9 ? `Cmd+${i + 1}` : undefined,
          action: () => {
            switchWorkspace(ws.id);
            close();
          },
        })),
    ];

    return cmds;
  }, [
    workspaces,
    switchWorkspace,
    close,
    onSearch,
    onOpenHistory,
    onOpenSettings,
    theme,
    setTheme,
    router,
    historyCount,
  ]);

  // Fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(commands, {
        keys: ['label', 'category'],
        threshold: 0.3,
        minMatchCharLength: 1,
      }),
    [commands]
  );

  const filteredCommands = useMemo(() => {
    if (query.length === 0) {
      // Show recent/pinned items first
      return commands.sort((a, b) => {
        // Prioritize action commands
        if (a.category === 'action' && b.category !== 'action') return -1;
        if (a.category !== 'action' && b.category === 'action') return 1;
        // Prioritize current workspace
        if (
          a.category === 'workspace' &&
          a.id === `workspace-${activeWorkspaceId}`
        )
          return -1;
        return 0;
      });
    }

    const results = fuse.search(query);
    return results.map((result) => result.item);
  }, [query, commands, fuse, activeWorkspaceId]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const allFilteredFlat = useMemo(
    () => filteredCommands.flat(),
    [filteredCommands]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allFilteredFlat.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allFilteredFlat[selectedIndex];
        if (selected) {
          selected.action();
        }
      } else if (e.key === 'Escape') {
        close();
      }
    },
    [allFilteredFlat, selectedIndex, close]
  );

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset and close on escape
  useEffect(() => {
    const handleEscape = () => {
      if (isOpen) {
        close();
      }
    };
    window.addEventListener('keyboard-escape', handleEscape);
    return () => window.removeEventListener('keyboard-escape', handleEscape);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={close}
      />

      {/* Command Palette Modal */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-white dark:bg-slate-800 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-in slide-in-from-top-5 fade-in duration-300">
          {/* Search Input */}
          <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-lg outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {Object.entries(grouped).length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No commands found
              </div>
            ) : (
              Object.entries(grouped).map(([category, cmds]) => (
                <div key={category} className="mb-2 last:mb-0">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  </div>
                  {cmds.map((cmd) => {
                    const globalIdx = allFilteredFlat.indexOf(cmd);
                    const isSelected = globalIdx === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                        }}
                        className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-colors mb-1 ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-900/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="text-lg">{cmd.icon}</span>
                        <span className="flex-1 text-left">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {cmd.label}
                          </p>
                        </span>
                        {cmd.shortcut && (
                          <kbd className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded font-mono">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <span>
              ↑↓ Navigate • Enter Select • Esc Close
            </span>
            <span>{allFilteredFlat.length} results</span>
          </div>
        </div>
      </div>
    </>
  );
}
