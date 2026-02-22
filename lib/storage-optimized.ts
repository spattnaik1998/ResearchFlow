import type { SearchHistoryEntry } from '@/types';
import { saveSearchToHistory } from './storage';

const DEBOUNCE_DELAY = 300; // ms

interface PendingWrite {
  entry: SearchHistoryEntry;
  workspaceId?: string;
  userId?: string;
}

// Queue of pending writes keyed by workspace + user
const pendingWrites = new Map<string, PendingWrite>();
const timeoutIds = new Map<string, NodeJS.Timeout>();

/**
 * Debounced version of saveSearchToHistory
 * Batches multiple writes within a 300ms window
 * Flushes immediately on page unload
 */
export const saveSearchToHistoryDebounced = (
  entry: SearchHistoryEntry,
  workspaceId?: string,
  userId?: string
): void => {
  const wsId = workspaceId || 'default';
  const key = userId ? `${userId.slice(0, 8)}_${wsId}` : wsId;

  // Queue the write
  pendingWrites.set(key, { entry, workspaceId, userId });

  // Clear existing timeout if present
  const existingTimeout = timeoutIds.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Set new debounce timeout
  const timeoutId = setTimeout(() => {
    flushPendingWrites(key);
  }, DEBOUNCE_DELAY);

  timeoutIds.set(key, timeoutId);
};

/**
 * Flushes pending writes for a specific workspace
 */
const flushPendingWrites = (key: string): void => {
  const pending = pendingWrites.get(key);
  if (!pending) return;

  try {
    saveSearchToHistory(pending.entry, pending.workspaceId, pending.userId);
  } catch (error) {
    console.error(`Failed to flush pending writes for key ${key}:`, error);
  } finally {
    pendingWrites.delete(key);
    timeoutIds.delete(key);
  }
};

/**
 * Flushes all pending writes immediately
 * Called on page unload to ensure no data loss
 */
export const flushAllPendingWrites = (): void => {
  // Clear all timeouts
  timeoutIds.forEach(timeout => clearTimeout(timeout));
  timeoutIds.clear();

  // Flush all pending writes
  pendingWrites.forEach((_, workspaceId) => {
    flushPendingWrites(workspaceId);
  });
};

/**
 * Cancel pending writes for a workspace
 * Useful for cleanup or if operation is no longer needed
 */
export const cancelPendingWrites = (workspaceId: string, userId?: string): void => {
  const wsId = workspaceId || 'default';
  const key = userId ? `${userId.slice(0, 8)}_${wsId}` : wsId;

  // Clear timeout
  const timeout = timeoutIds.get(key);
  if (timeout) {
    clearTimeout(timeout);
    timeoutIds.delete(key);
  }

  // Remove from queue
  pendingWrites.delete(key);
};

/**
 * Gets the number of pending writes (for debugging)
 */
export const getPendingWriteCount = (): number => {
  return pendingWrites.size;
};

// Setup page unload handler to flush pending writes
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushAllPendingWrites);
  window.addEventListener('unload', flushAllPendingWrites);
}

// Also handle visibility change (page minimized, tab switch, etc.)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      flushAllPendingWrites();
    }
  });
}
