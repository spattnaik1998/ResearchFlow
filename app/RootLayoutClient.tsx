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
import { createAuthChannel, listenToAuthEvents, broadcastAuthEvent, type AuthChannelMessage } from '@/lib/broadcast-channel';
import { clearClientSession } from '@/lib/session-cleanup';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [historyCount, setHistoryCount] = useState(0);
  const { getSearchHistory } = useSearchHistory();
  const { activeWorkspaceId, _hasHydrated, setWorkspacesFromCloud } = useWorkspaceStore();
  const { setUser, logout } = useAuthStore();
  const { showToast } = useNotificationStore();
  const migrationRunningRef = useRef(false);
  const cloudLoadRunningRef = useRef(false);

  // Helper to run migration only once, preventing concurrent/duplicate calls.
  // Reads workspaces from the store at call time (not a stale closure) so it
  // always uses the current user's fresh workspaces, not a previous user's.
  const runMigrationOnce = useCallback(async (userId: string) => {
    if (migrationRunningRef.current || isMigrationComplete(userId)) return;
    migrationRunningRef.current = true;
    try {
      const currentWorkspaces = useWorkspaceStore.getState().workspaces;
      await migrateUserData(userId, currentWorkspaces);
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
  }, [showToast]);

  // Load cloud data on login (runs every login, not gated by migration flag).
  // Uses setWorkspacesFromCloud (replaces) instead of merge so stale local
  // workspaces from a previous user are never preserved.
  const loadCloudData = useCallback(async (userId: string) => {
    if (cloudLoadRunningRef.current) return;
    cloudLoadRunningRef.current = true;
    try {
      const cloudWorkspaces = await loadCloudDataOnLogin(userId);
      if (cloudWorkspaces.length > 0) {
        setWorkspacesFromCloud(cloudWorkspaces);
      }
    } catch (error) {
      console.error('Cloud data load failed:', error);
    } finally {
      cloudLoadRunningRef.current = false;
    }
  }, [setWorkspacesFromCloud]);

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
          // Detect user switch OR first login on this browser.
          // If lastUserId is null, workspace-storage may contain a previous
          // user's workspaces (logout clears the ID key but not the store).
          // Always clear when the stored user doesn't match current user.
          const lastUserId = localStorage.getItem('researchflow_last_user_id');
          if (!lastUserId || lastUserId !== session.user.id) {
            clearAllHistoryKeysForUser(lastUserId || '');
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
          // Same logic as initializeUser: clear whenever user ID doesn't match.
          const lastUserId = localStorage.getItem('researchflow_last_user_id');
          if (!lastUserId || lastUserId !== session.user.id) {
            clearAllHistoryKeysForUser(lastUserId || '');
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
          // Clear workspace-storage so the next user who logs in on this
          // browser does NOT inherit stale workspaces from this session.
          useWorkspaceStore.getState().clearForNewUser();
          localStorage.removeItem('researchflow_last_user_id');
          logout();

          // Broadcast logout to other tabs so they also logout
          const channel = createAuthChannel();
          const message: AuthChannelMessage = {
            type: 'SIGNED_OUT',
            timestamp: Date.now(),
          };
          broadcastAuthEvent(channel, message);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [setUser, logout, runMigrationOnce, loadCloudData, _hasHydrated]);

  // Listen for cross-tab auth events (e.g., logout in another tab)
  useEffect(() => {
    const channel = createAuthChannel();
    if (!channel) return;

    const unsubscribe = listenToAuthEvents(channel, (message) => {
      if (message.type === 'SIGNED_OUT') {
        // Another tab logged out — sync this tab's state and redirect
        useWorkspaceStore.getState().clearForNewUser();
        clearClientSession();
        logout();
        setTimeout(() => {
          window.location.href = '/auth/login?logout=true';
        }, 100);
      }
    });

    return () => {
      unsubscribe();
      channel?.close();
    };
  }, [logout]);

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
