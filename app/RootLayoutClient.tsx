'use client';

import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useKeyboardShortcuts } from '@/lib/hooks';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastStack } from '@/components/ToastStack';
import { useSearchHistory } from '@/lib/hooks';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [historyCount, setHistoryCount] = useState(0);
  const { getSearchHistory } = useSearchHistory();
  const { activeWorkspaceId, _hasHydrated } = useWorkspaceStore();

  // Only access localStorage after hydration (on client side)
  // Re-calculate when workspace changes
  useEffect(() => {
    if (!_hasHydrated) return; // Don't count until hydrated

    try {
      const entries = getSearchHistory();
      setHistoryCount(entries.length);
    } catch (error) {
      console.error('Failed to load history count:', error);
    }
  }, [getSearchHistory, activeWorkspaceId, _hasHydrated]);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onNewSearch: () => {
      // Focus search input on the page
      const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      input?.focus();
    },
    onOpenHistory: () => {
      // Handled by page component
      window.dispatchEvent(new CustomEvent('open-history'));
    },
    onOpenSettings: () => {
      // Handled by page component
      window.dispatchEvent(new CustomEvent('open-settings'));
    },
    onOpenNotifications: () => {
      // Handled by page component
      window.dispatchEvent(new CustomEvent('open-notifications'));
    },
    onOpenKnowledge: () => {
      // Handled by page component
      window.dispatchEvent(new CustomEvent('open-knowledge'));
    },
  });

  return (
    <>
      {children}
      <CommandPalette
        historyCount={historyCount}
      />
      <ToastStack />
    </>
  );
}
