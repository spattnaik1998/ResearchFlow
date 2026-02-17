'use client';

import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAuthStore } from '@/stores/authStore';
import { useKeyboardShortcuts } from '@/lib/hooks';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastStack } from '@/components/ToastStack';
import { useSearchHistory } from '@/lib/hooks';
import { useNotificationStore } from '@/stores/notificationStore';
import { createSupabaseClient } from '@/lib/supabase';
import { migrateUserData, isMigrationComplete } from '@/lib/migration';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [historyCount, setHistoryCount] = useState(0);
  const { getSearchHistory } = useSearchHistory();
  const { activeWorkspaceId, _hasHydrated, workspaces } = useWorkspaceStore();
  const { setUser, logout } = useAuthStore();
  const { showToast } = useNotificationStore();

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

  // Listen for auth state changes and trigger migration on login
  useEffect(() => {
    const supabase = createSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });

          // Trigger migration on first login
          if (!isMigrationComplete(session.user.id)) {
            try {
              await migrateUserData(session.user.id, workspaces);
              showToast({
                type: 'success',
                title: 'Workspace data synced to cloud!',
              });
            } catch (error) {
              console.error('Migration failed:', error);
              showToast({
                type: 'error',
                title: 'Failed to sync workspace data',
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [setUser, logout, workspaces, showToast]);

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
