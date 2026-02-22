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
import { migrateUserData, isMigrationComplete, loadCloudDataOnLogin } from '@/lib/migration';
import { clearAllHistoryKeysForUser } from '@/lib/storage';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [historyCount, setHistoryCount] = useState(0);
  const { getSearchHistory } = useSearchHistory();
  const { activeWorkspaceId, _hasHydrated, workspaces, mergeCloudWorkspaces } = useWorkspaceStore();
  const { setUser, logout } = useAuthStore();
  const { showToast } = useNotificationStore();
  const migrationRunningRef = useRef(false);
  const cloudLoadRunningRef = useRef(false);

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

  // Load cloud data on login (runs every login, not gated by migration flag)
  const loadCloudData = useCallback(async (userId: string) => {
    if (cloudLoadRunningRef.current) return;
    cloudLoadRunningRef.current = true;
    try {
      const cloudWorkspaces = await loadCloudDataOnLogin(userId);
      if (cloudWorkspaces.length > 0) {
        mergeCloudWorkspaces(cloudWorkspaces);
      }
    } catch (error) {
      console.error('Cloud data load failed:', error);
    } finally {
      cloudLoadRunningRef.current = false;
    }
  }, [mergeCloudWorkspaces]);

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
          // Detect user switch: compare incoming user ID with stored user ID
          const lastUserId = localStorage.getItem('researchflow_last_user_id');
          if (lastUserId && lastUserId !== session.user.id) {
            // Different user logged in — clear previous user's data
            clearAllHistoryKeysForUser(lastUserId);
            useWorkspaceStore.getState().clearForNewUser();
          }
          // Store current user ID for next login
          localStorage.setItem('researchflow_last_user_id', session.user.id);

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });

          // Only trigger migration and cloud load after Zustand has hydrated from localStorage
          if (_hasHydrated) {
            await Promise.all([
              runMigrationOnce(session.user.id),
              loadCloudData(session.user.id),
            ]);
          }
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };

    initializeUser();
  }, [setUser, runMigrationOnce, loadCloudData, _hasHydrated]);

  // Listen for auth state changes
  useEffect(() => {
    const supabase = createSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Detect user switch: compare incoming user ID with stored user ID
          const lastUserId = localStorage.getItem('researchflow_last_user_id');
          if (lastUserId && lastUserId !== session.user.id) {
            // Different user logged in — clear previous user's data
            clearAllHistoryKeysForUser(lastUserId);
            useWorkspaceStore.getState().clearForNewUser();
          }
          // Store current user ID for next login
          localStorage.setItem('researchflow_last_user_id', session.user.id);

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });

          // Only trigger migration and cloud load after Zustand has hydrated from localStorage
          if (_hasHydrated) {
            await Promise.all([
              runMigrationOnce(session.user.id),
              loadCloudData(session.user.id),
            ]);
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('researchflow_last_user_id');
          logout();
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [setUser, logout, runMigrationOnce, loadCloudData, _hasHydrated]);

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
