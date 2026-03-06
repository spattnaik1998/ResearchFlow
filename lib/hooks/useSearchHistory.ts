'use client';

import { useCallback } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAuthStore } from '@/stores/authStore';
import { getSearchHistory, saveSearchToHistory, deleteHistoryEntry, clearSearchHistory, getGroupedHistory } from '@/lib/storage';
import type { SearchHistoryEntry } from '@/types';

export function useSearchHistory() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const workspaceId = activeWorkspaceId || 'default';
  const userId = user?.id;

  const getHistory = useCallback(() => {
    return getSearchHistory(workspaceId, userId);
  }, [workspaceId, userId]);

  const saveSearch = useCallback(
    (entry: SearchHistoryEntry) => {
      saveSearchToHistory(entry, workspaceId, userId);
    },
    [workspaceId, userId]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      deleteHistoryEntry(id, workspaceId, userId);
    },
    [workspaceId, userId]
  );

  const clearHistory = useCallback(() => {
    clearSearchHistory(workspaceId, userId);
  }, [workspaceId, userId]);

  const getGrouped = useCallback(() => {
    return getGroupedHistory(workspaceId, userId);
  }, [workspaceId, userId]);

  return {
    getSearchHistory: getHistory,
    saveSearch,
    deleteEntry,
    clearHistory,
    getGrouped,
  };
}
