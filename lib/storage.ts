import type { SearchHistoryEntry } from '@/types';
import { isValidHistoryEntry, repairEntry } from './storage-diagnostic';

const HISTORY_KEY_PREFIX = 'voicesearch_history';
const MAX_HISTORY_ENTRIES = 50;
const MAX_STORAGE_SIZE = 100 * 1024; // 100KB per workspace

/**
 * Get the storage key for a workspace
 * Namespace by user ID to prevent cross-user data leakage
 * Defaults to 'default' workspace if not specified
 */
const getHistoryKey = (workspaceId?: string, userId?: string): string => {
  const userPrefix = userId ? `${userId.slice(0, 8)}_` : '';
  return `${HISTORY_KEY_PREFIX}_${userPrefix}${workspaceId || 'default'}`;
};

/**
 * Clear all history keys for a specific user
 * Used when switching users on the same browser
 */
export const clearAllHistoryKeysForUser = (userId: string): void => {
  const prefix = `${HISTORY_KEY_PREFIX}_${userId.slice(0, 8)}_`;
  const keysToDelete: string[] = [];

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove history key ${key}:`, error);
    }
  });
};

/**
 * Save a search entry to localStorage history
 * Maintains chronological order (newest first)
 * Workspace-isolated and user-scoped storage
 * Includes validation and size limits
 */
export const saveSearchToHistory = (
  entry: SearchHistoryEntry,
  workspaceId?: string,
  userId?: string
): void => {
  try {
    // Validate entry
    if (!isValidHistoryEntry(entry)) {
      console.error('Invalid history entry:', entry);
      return;
    }

    const history = getSearchHistory(workspaceId, userId);
    // Remove any existing entry with the same ID to prevent duplicates after cloud sync
    const deduped = history.filter((e) => e.id !== entry.id);
    const entryWithWorkspace = { ...entry, workspaceId: workspaceId || 'default' };
    deduped.unshift(entryWithWorkspace);
    const limited = deduped.slice(0, MAX_HISTORY_ENTRIES);

    const serialized = JSON.stringify(limited);

    // Check size limit
    if (serialized.length > MAX_STORAGE_SIZE) {
      console.warn(`Storage limit exceeded for workspace ${workspaceId || 'default'}, trimming entries`);
      // Remove entries until size is acceptable
      const trimmed = limited.slice(0, Math.max(10, Math.floor(limited.length * 0.75)));
      localStorage.setItem(getHistoryKey(workspaceId, userId), JSON.stringify(trimmed));
    } else {
      localStorage.setItem(getHistoryKey(workspaceId, userId), serialized);
    }
  } catch (error) {
    console.error('Failed to save search to history:', error);
    // Emergency fallback: try to clear old entries if quota exceeded
    if (error instanceof DOMException && error.code === 22) {
      try {
        const fallback = getSearchHistory(workspaceId, userId);
        const trimmed = fallback.slice(0, 10);
        localStorage.setItem(getHistoryKey(workspaceId, userId), JSON.stringify(trimmed));
      } catch (fallbackError) {
        console.error('Emergency fallback failed:', fallbackError);
      }
    }
  }
};

/**
 * Retrieve all search history from localStorage
 * Returns empty array if no history exists
 * Workspace-isolated and user-scoped retrieval
 * Validates and repairs entries on load
 */
export const getSearchHistory = (workspaceId?: string, userId?: string): SearchHistoryEntry[] => {
  try {
    const data = localStorage.getItem(getHistoryKey(workspaceId, userId));
    if (!data) return [];

    const parsed = JSON.parse(data) as unknown;
    if (!Array.isArray(parsed)) {
      console.error('History data is not an array, clearing');
      clearSearchHistory(workspaceId, userId);
      return [];
    }

    // Validate and repair entries
    const validEntries: SearchHistoryEntry[] = [];
    let hasRepaired = false;

    for (const entry of parsed) {
      if (isValidHistoryEntry(entry)) {
        validEntries.push(entry);
      } else {
        const repaired = repairEntry(entry);
        if (repaired) {
          validEntries.push(repaired);
          hasRepaired = true;
        }
      }
    }

    // Save repaired data back to storage
    if (hasRepaired && validEntries.length > 0) {
      try {
        localStorage.setItem(getHistoryKey(workspaceId, userId), JSON.stringify(validEntries));
      } catch (error) {
        console.error('Failed to save repaired history:', error);
      }
    }

    return validEntries;
  } catch (error) {
    console.error('Failed to retrieve search history:', error);
    return [];
  }
};

/**
 * Clear all search history for a workspace
 */
export const clearSearchHistory = (workspaceId?: string, userId?: string): void => {
  try {
    localStorage.removeItem(getHistoryKey(workspaceId, userId));
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
};

/**
 * Delete a specific history entry by ID
 */
export const deleteHistoryEntry = (
  id: string,
  workspaceId?: string,
  userId?: string
): void => {
  try {
    const history = getSearchHistory(workspaceId, userId);
    const filtered = history.filter(entry => entry.id !== id);
    localStorage.setItem(getHistoryKey(workspaceId, userId), JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete history entry:', error);
  }
};

/**
 * Get grouped history by date (Today, Yesterday, This Week, Older)
 */
export const getGroupedHistory = (
  workspaceId?: string,
  userId?: string
): Record<string, SearchHistoryEntry[]> => {
  const history = getSearchHistory(workspaceId, userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const grouped: Record<string, SearchHistoryEntry[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Older: [],
  };

  history.forEach(entry => {
    const entryDate = new Date(entry.timestamp);
    const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

    if (entryDay.getTime() === today.getTime()) {
      grouped.Today.push(entry);
    } else if (entryDay.getTime() === yesterday.getTime()) {
      grouped.Yesterday.push(entry);
    } else if (entryDay > weekAgo) {
      grouped['This Week'].push(entry);
    } else {
      grouped.Older.push(entry);
    }
  });

  return grouped;
};

/**
 * Format timestamp for display
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
