'use client'

import { createSupabaseClient } from '@/lib/supabase'
import type { SearchHistoryEntry } from '@/types'

/**
 * Database utility for search history persistence
 * Handles reading and writing search history to Supabase
 */

const MAX_HISTORY_ENTRIES_PER_QUERY = 50

/**
 * Save a search history entry to Supabase
 * Fire-and-forget operation (does not block the search flow)
 */
export async function saveHistoryEntry(
  entry: SearchHistoryEntry,
  userId: string
): Promise<void> {
  try {
    const supabase = createSupabaseClient()

    // Map entry format to database format
    const dbEntry = {
      id: entry.id,
      user_id: userId,
      workspace_id: entry.workspaceId || 'default',
      query: entry.query,
      results: entry.results,
      summary: entry.summary,
      questions: entry.questions || [],
    }

    // Upsert (insert or update if exists)
    const { error } = await supabase
      .from('search_history')
      .upsert(dbEntry, { onConflict: 'id' })

    if (error) {
      console.error('Failed to save history entry:', error)
      // Non-blocking - don't throw
    }
  } catch (error) {
    console.error('Error saving history entry:', error)
    // Non-blocking - don't throw
  }
}

/**
 * Load search history for a specific workspace
 * Returns the most recent entries (up to MAX_HISTORY_ENTRIES_PER_QUERY)
 */
export async function loadHistory(
  userId: string,
  workspaceId: string
): Promise<SearchHistoryEntry[]> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY_ENTRIES_PER_QUERY)

    if (error) {
      console.error('Failed to load history:', error)
      return []
    }

    // Map database format to entry format
    return (data || []).map((row) => ({
      id: row.id,
      query: row.query,
      timestamp: new Date(row.created_at).getTime(),
      results: row.results || [],
      summary: row.summary || { summary: '', keyPoints: [] },
      questions: row.questions || [],
      workspaceId: row.workspace_id,
    }))
  } catch (error) {
    console.error('Error loading history:', error)
    return []
  }
}

/**
 * Load search history across all workspaces for a user
 * Used during migration to fetch all cloud history
 */
export async function loadAllHistory(userId: string): Promise<Map<string, SearchHistoryEntry[]>> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load all history:', error)
      return new Map()
    }

    // Group by workspace_id
    const historyMap = new Map<string, SearchHistoryEntry[]>()

    ;(data || []).forEach((row) => {
      const wsId = row.workspace_id
      const entry: SearchHistoryEntry = {
        id: row.id,
        query: row.query,
        timestamp: new Date(row.created_at).getTime(),
        results: row.results || [],
        summary: row.summary || { summary: '', keyPoints: [] },
        questions: row.questions || [],
        workspaceId: wsId,
      }

      if (!historyMap.has(wsId)) {
        historyMap.set(wsId, [])
      }
      historyMap.get(wsId)!.push(entry)
    })

    return historyMap
  } catch (error) {
    console.error('Error loading all history:', error)
    return new Map()
  }
}

/**
 * Delete a history entry
 */
export async function deleteHistoryEntry(entryId: string, userId: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to delete history entry:', error)
      throw error
    }
  } catch (error) {
    console.error('Error deleting history entry:', error)
    throw error
  }
}

/**
 * Clear all history for a workspace
 */
export async function clearWorkspaceHistory(
  userId: string,
  workspaceId: string
): Promise<void> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)

    if (error) {
      console.error('Failed to clear workspace history:', error)
      throw error
    }
  } catch (error) {
    console.error('Error clearing workspace history:', error)
    throw error
  }
}
