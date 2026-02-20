'use client';

import { useCallback } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export type AnalyticsEventType = 'search' | 'summarize' | 'question' | 'note_create' | 'export' | 'ui_interaction';
export type AnalyticsCategory = 'search_workflow' | 'knowledge_base' | 'exports' | 'ui_interactions';

/**
 * useAnalytics Hook
 *
 * Fire-and-forget analytics logging. Logs are sent asynchronously with a 2-second timeout.
 * Gracefully handles Supabase unavailability and respects user privacy settings.
 *
 * Usage:
 * const { logEvent } = useAnalytics();
 * logEvent('search', 'search_workflow', { query: 'AI', results_count: 42, duration_ms: 1250 });
 */
export function useAnalytics() {
  const { activeWorkspaceId } = useWorkspaceStore();

  const logEvent = useCallback(
    async (eventType: AnalyticsEventType, eventCategory: AnalyticsCategory, metadata?: Record<string, unknown>) => {
      // Fire-and-forget: Don't wait for response or block user interactions
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Analytics timeout')), 2000)
      );

      const logPromise = (async () => {
        try {
          // Log the event via the server API (which handles user_id from auth session)
          await fetch('/api/analytics/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspace_id: activeWorkspaceId,
              event_type: eventType,
              event_category: eventCategory,
              metadata: metadata || {},
            }),
          });
        } catch (error) {
          // Silently fail - never interrupt user experience for analytics
          if (process.env.NODE_ENV === 'development') {
            console.debug('[Analytics Error]', error);
          }
        }
      })();

      // Race: finish or timeout (whichever is faster)
      // We use Promise.race to ensure logging doesn't slow down the app
      try {
        await Promise.race([logPromise, timeout]);
      } catch (error) {
        // Timeout or error - silently ignore
        if (process.env.NODE_ENV === 'development' && error instanceof Error && error.message !== 'Analytics timeout') {
          console.debug('[Analytics Race Error]', error);
        }
      }
    },
    [activeWorkspaceId]
  );

  return { logEvent };
}

/**
 * Helper function to log search events
 * Used by search API routes and components
 */
export async function logSearchEvent(
  workspaceId: string,
  query: string,
  resultsCount: number,
  durationMs: number
) {
  try {
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        event_type: 'search',
        event_category: 'search_workflow',
        metadata: {
          query,
          results_count: resultsCount,
          duration_ms: durationMs,
        },
      }),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] Failed to log search event:', error);
    }
  }
}

/**
 * Helper function to log summarize events
 */
export async function logSummarizeEvent(
  workspaceId: string,
  query: string,
  summaryLength: number,
  durationMs: number
) {
  try {
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        event_type: 'summarize',
        event_category: 'search_workflow',
        metadata: {
          query,
          summary_length: summaryLength,
          duration_ms: durationMs,
        },
      }),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] Failed to log summarize event:', error);
    }
  }
}

/**
 * Helper function to log question generation events
 */
export async function logQuestionEvent(
  workspaceId: string,
  query: string,
  questionCount: number,
  durationMs: number
) {
  try {
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        event_type: 'question',
        event_category: 'search_workflow',
        metadata: {
          query,
          question_count: questionCount,
          duration_ms: durationMs,
        },
      }),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] Failed to log question event:', error);
    }
  }
}

/**
 * Helper function to log note creation events
 */
export async function logNoteCreationEvent(
  workspaceId: string,
  noteId: string,
  title: string,
  tagCount: number
) {
  try {
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        event_type: 'note_create',
        event_category: 'knowledge_base',
        metadata: {
          note_id: noteId,
          title,
          tag_count: tagCount,
        },
      }),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] Failed to log note creation event:', error);
    }
  }
}

/**
 * Helper function to log export events
 */
export async function logExportEvent(
  workspaceId: string,
  exportFormat: 'markdown' | 'pdf' | 'csv',
  itemCount: number
) {
  try {
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        event_type: 'export',
        event_category: 'exports',
        metadata: {
          export_format: exportFormat,
          item_count: itemCount,
        },
      }),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] Failed to log export event:', error);
    }
  }
}
