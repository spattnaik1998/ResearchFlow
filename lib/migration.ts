'use client'

import { createSupabaseClient } from '@/lib/supabase'
import type { Workspace } from '@/stores/workspaceStore'

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
        .upsert(workspacesToInsert, { onConflict: 'id' })

      if (workspaceError) {
        console.error('Failed to migrate workspaces:', workspaceError)
        throw new Error(`Workspace migration failed: ${workspaceError.message}`)
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
