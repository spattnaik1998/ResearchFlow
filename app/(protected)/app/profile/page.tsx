'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize display name from user
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Generate avatar with initial letter
  const avatar = user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase() || '?';

  async function handleSaveName() {
    if (!displayName.trim()) {
      setSaveError('Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const supabase = createSupabaseClient();

      // Update user profile in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: { name: displayName },
      });

      if (error) {
        setSaveError(error.message);
        return;
      }

      // Update auth store
      if (user) {
        useAuthStore.setState({
          user: { ...user, name: displayName },
        });
      }

      setSaveSuccess(true);
      setIsEditing(false);

      // Clear success message after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    console.log('[Logout] Starting logout process');
    try {
      // Step 1: Clear all auth-related localStorage keys immediately
      // This prevents re-hydration of stale auth state
      console.log('[Logout] Clearing localStorage');
      localStorage.removeItem('researchflow_last_user_id');
      localStorage.removeItem('auth-store'); // Zustand persist key

      // Step 2: Clear all workspace-related localStorage
      // Pattern: voicesearch_history_${userId}_${workspaceId}
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.startsWith('voicesearch_history_')) {
          localStorage.removeItem(key);
        }
      }

      // Step 3: Clear sessionStorage to remove any session tokens
      console.log('[Logout] Clearing sessionStorage');
      sessionStorage.clear();

      // Step 4: Clear auth store to remove user from client-side state
      console.log('[Logout] Clearing auth store');
      logout();

      // Step 5: Call server-side logout endpoint to invalidate session cookies
      console.log('[Logout] Calling server logout endpoint');
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include', // Include cookies so Supabase can clear them
        });
      } catch (error) {
        console.warn('[Logout] Server logout failed:', error);
        // Continue anyway - local cleanup is complete
      }

      // Step 6: Clear any Supabase client-side cache
      // Supabase stores auth state in memory, so creating a new client
      // won't help, but we can try to clear it explicitly
      const supabase = createSupabaseClient();
      try {
        // Attempt to clear client session
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) {
          console.warn('[Logout] Client signOut returned error:', error);
        } else {
          console.log('[Logout] Client signOut succeeded');
        }
      } catch (error) {
        console.warn('[Logout] Client signOut exception:', error);
      }

      // Step 7: Hard navigation to login
      // Use hard navigation so middleware re-evaluates with cleared session state
      // Add small delay to ensure all async operations complete
      setTimeout(() => {
        console.log('[Logout] Navigating to /auth/login');
        window.location.href = '/auth/login?logout=true';
      }, 200);
    } catch (error) {
      console.error('[Logout] Exception during logout:', error);
      // Even on error, attempt to clear state and redirect
      logout();
      setTimeout(() => {
        window.location.href = '/auth/login?error=logout_failed';
      }, 200);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account information</p>
        </div>

        {/* Avatar Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-white">{avatar}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {user.name || 'User'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Display Name Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 p-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display Name</h3>

          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-400">✓ Profile updated successfully</p>
            </div>
          )}

          {saveError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400">{saveError}</p>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={isSaving}
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user.name || '');
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-700 dark:text-gray-300">{displayName || 'Not set'}</p>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
        </div>

        {/* Account Information Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 p-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <p className="px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white">
                {user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed. Contact support if you need to update it.
              </p>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <p className="px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm break-all">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-red-200 dark:border-red-900 p-8">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">⚠️ Danger Zone</h3>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign out of your account. You&apos;ll need to log in again to access ResearchFlow.
            </p>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
