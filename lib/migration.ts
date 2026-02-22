'use client'

import { createSupabaseClient } from '@/lib/supabase'
import { loadAllHistory } from '@/lib/history-db'
import type { Workspace } from '@/stores/workspaceStore'
import type { SearchHistoryEntry } from '@/types'

/**
 * Check if data migration has already been completed for this user
 */
export function isMigrationComplete(userId: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`migration_complete_${userId}`) === 'true'
}

/**
 * Migrate user data from localStorage to Supabase database
 * - Inserts workspaces from localStorage into user_workspaces table
 * - Updates orphaned knowledge_notes to be associated with the user
 * - Sets migration complete flag to prevent re-running
 */
export async function migrateUserData(userId: string, workspaces: Workspace[]): Promise<void> {
  if (typeof window === 'undefined') {
    console.warn('Migration can only run in browser context')
    return
  }

  // Skip if already migrated
  if (isMigrationComplete(userId)) {
    console.log('Migration already completed for user', userId)
    return
  }

  try {
    const supabase = createSupabaseClient()

    // Step 1: Insert workspaces into user_workspaces
    if (workspaces.length > 0) {
      const workspacesToInsert = workspaces.map((ws) => ({
        id: ws.id,
        user_id: userId,
        name: ws.name,
        icon: ws.icon,
        color: ws.color,
        is_favorite: ws.isFavorite || false,
        is_archived: ws.isArchived || false,
        created_at: new Date(ws.createdAt).toISOString(),
      }))

      const { error: workspaceError } = await supabase
        .from('user_workspaces')
        .upsert(workspacesToInsert, { onConflict: 'id,user_id' })

      if (workspaceError) {
        console.error('Failed to migrate workspaces:', workspaceError)
        // Don't throw to allow migration flag to be set, but surface the error
        console.error('WARNING: Workspace migration failed silently. This may cause multi-user issues.')
        // Still set the flag to avoid repeated upsert attempts
        localStorage.setItem(`migration_complete_${userId}`, 'true')
        return
      }

      console.log(`Migrated ${workspaces.length} workspace(s) for user ${userId}`)
    }

    // Step 2: Update orphaned knowledge_notes to be associated with user
    if (workspaces.length > 0) {
      const { error: notesError } = await supabase
        .from('knowledge_notes')
        .update({ user_id: userId })
        .is('user_id', null)
        .in('workspace_id', workspaces.map((ws) => ws.id))

      if (notesError) {
        console.error('Failed to update notes with user_id:', notesError)
        throw new Error(`Notes migration failed: ${notesError.message}`)
      }
    }

    // Step 3: Mark migration as complete
    localStorage.setItem(`migration_complete_${userId}`, 'true')
    console.log('Data migration completed successfully for user', userId)
  } catch (error) {
    console.error('Data migration error:', error)
    throw error
  }
}

/**
 * Upsert a single workspace to Supabase (for ongoing sync after initial migration)
 * Fire-and-forget operation - does not block workspace creation
 */
export async function upsertWorkspaceToCloud(workspace: Workspace, userId: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()

    const dbWorkspace = {
      id: workspace.id,
      user_id: userId,
      name: workspace.name,
      icon: workspace.icon,
      color: workspace.color,
      is_favorite: workspace.isFavorite || false,
      is_archived: workspace.isArchived || false,
      created_at: new Date(workspace.createdAt).toISOString(),
    }

    const { error } = await supabase
      .from('user_workspaces')
      .upsert(dbWorkspace, { onConflict: 'id,user_id' })

    if (error) {
      console.error('Failed to save workspace to cloud:', error)
      // Non-blocking - don't throw
    }
  } catch (error) {
    console.error('Error upserting workspace to cloud:', error)
    // Non-blocking - don't throw
  }
}

/**
 * Upsert a workspace to Supabase for the current logged-in user
 * Gets the current user session first, then syncs the workspace
 * Fire-and-forget operation
 */
export async function upsertWorkspaceToCloudForCurrentUser(workspace: Workspace): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      console.warn('No authenticated user session available for workspace sync')
      return
    }

    await upsertWorkspaceToCloud(workspace, session.user.id)
  } catch (error) {
    console.error('Error upserting workspace for current user:', error)
    // Non-blocking - don't throw
  }
}

/**
 * Delete a workspace from Supabase for the current logged-in user
 * Gets the current user session first, then deletes the workspace
 * Fire-and-forget operation
 */
export async function deleteWorkspaceFromCloudForCurrentUser(workspaceId: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const { error } = await supabase
      .from('user_workspaces')
      .delete()
      .eq('id', workspaceId)
      .eq('user_id', session.user.id)
    if (error) console.error('Failed to delete workspace from cloud:', error)
  } catch (error) {
    console.error('Error deleting workspace from cloud:', error)
  }
}

/**
 * Load all user data from Supabase on login.
 * Runs on EVERY login — NOT gated by migration_complete flag.
 * Returns cloud workspaces so caller can merge them into Zustand store.
 */
export async function loadCloudDataOnLogin(userId: string): Promise<Workspace[]> {
  if (typeof window === 'undefined') return []

  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('user_workspaces')
      .select('id, user_id, name, icon, color, is_favorite, is_archived, search_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to load workspaces from cloud:', error)
      return []
    }
    if (!data || data.length === 0) return []

    const cloudWorkspaces: Workspace[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: (row.color as Workspace['color']) || 'teal',
      createdAt: new Date(row.created_at).getTime(),
      isFavorite: row.is_favorite ?? false,
      isArchived: row.is_archived ?? false,
      searchCount: row.search_count ?? 0,
    }))

    // Load search history for all cloud workspaces → merge into localStorage
    await migrateSearchHistory(userId, cloudWorkspaces)

    return cloudWorkspaces
  } catch (error) {
    console.error('Error loading cloud data on login:', error)
    return []
  }
}

/**
 * Helper: Migrate search history from Supabase to localStorage
 * Fetches cloud history for each workspace and merges with existing localStorage entries
 */
export async function migrateSearchHistory(userId: string, workspaces: Workspace[]): Promise<void> {
  try {
    // Load all cloud history for the user (grouped by workspace)
    const cloudHistoryMap = await loadAllHistory(userId)

    if (cloudHistoryMap.size === 0) {
      console.log('No cloud history to migrate')
      return
    }

    // For each workspace, merge cloud history with localStorage
    workspaces.forEach((workspace) => {
      const wsId = workspace.id
      const cloudEntries = cloudHistoryMap.get(wsId) || []

      if (cloudEntries.length === 0) return

      // Load existing localStorage history with userId namespace
      const userPrefix = userId.slice(0, 8)
      const historyKey = `voicesearch_history_${userPrefix}_${wsId}`
      const localStorageJson = localStorage.getItem(historyKey)
      const localEntries: SearchHistoryEntry[] = localStorageJson ? JSON.parse(localStorageJson) : []

      // Create a set of existing IDs for fast lookup
      const existingIds = new Set(localEntries.map((e) => e.id))

      // Merge: add cloud entries that don't already exist in localStorage
      const mergedEntries = [...cloudEntries.filter((e) => !existingIds.has(e.id)), ...localEntries]

      // Sort by timestamp descending and keep only the most recent 100
      mergedEntries.sort((a, b) => b.timestamp - a.timestamp)
      const finalEntries = mergedEntries.slice(0, 100)

      // Write back to localStorage
      localStorage.setItem(historyKey, JSON.stringify(finalEntries))
      console.log(`Migrated ${cloudEntries.length} history entry(ies) for workspace ${wsId}`)
    })
  } catch (error) {
    console.error('Error migrating search history:', error)
    // Non-blocking error - don't throw
  }
}
