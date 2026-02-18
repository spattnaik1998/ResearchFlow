'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const migrationRunningRef = useRef(false);

  // Helper to run migration only once, preventing concurrent/duplicate calls
  const runMigrationOnce = useCallback(async (userId: string) => {
    if (migrationRunningRef.current || isMigrationComplete(userId)) return;
    migrationRunningRef.current = true;
    try {
      await migrateUserData(userId, workspaces);
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
    } finally {
      migrationRunningRef.current = false;
    }
  }, [workspaces, showToast]);

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

  // Initialize user from current session on mount
  useEffect(() => {
    const supabase = createSupabaseClient();

    // Check current session first
    const initializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });

          // Trigger migration if needed
          await runMigrationOnce(session.user.id);
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };

    initializeUser();
  }, [setUser, runMigrationOnce]);

  // Listen for auth state changes
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
          await runMigrationOnce(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [setUser, logout, runMigrationOnce]);

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
