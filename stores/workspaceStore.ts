import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { upsertWorkspaceToCloudForCurrentUser, deleteWorkspaceFromCloudForCurrentUser } from '@/lib/migration';

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: 'teal' | 'purple' | 'blue' | 'green';
  createdAt: number;
  isFavorite: boolean;
  isArchived: boolean;
  searchCount: number;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  _hasHydrated: boolean;
}

interface WorkspaceActions {
  createWorkspace: (name: string, icon?: string, color?: Workspace['color']) => void;
  deleteWorkspace: (id: string) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  switchWorkspace: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleArchive: (id: string) => void;
  incrementSearchCount: (id: string) => void;
  getActiveWorkspace: () => Workspace | null;
  mergeCloudWorkspaces: (cloudWorkspaces: Workspace[]) => void;
  clearForNewUser: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

/**
 * Generate a unique workspace ID to prevent multi-user collisions
 */
function generateId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a default workspace with a unique ID
 */
function createDefaultWorkspace(): Workspace {
  return {
    id: generateId(),
    name: 'Personal',
    icon: '🏠',
    color: 'teal',
    createdAt: Date.now(),
    isFavorite: true,
    isArchived: false,
    searchCount: 0,
  };
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => {
      const defaultWorkspace = createDefaultWorkspace();
      return {
        workspaces: [defaultWorkspace],
        activeWorkspaceId: defaultWorkspace.id,
        isLoading: false,
        _hasHydrated: false,

        createWorkspace: (name, icon = '📁', color = 'teal') => {
          const newWorkspace: Workspace = {
            id: generateId(),
            name,
            icon,
            color,
            createdAt: Date.now(),
            isFavorite: false,
            isArchived: false,
            searchCount: 0,
          };
          set((state) => ({
            workspaces: [...state.workspaces, newWorkspace],
            activeWorkspaceId: newWorkspace.id,
          }));

          // Sync new workspace to Supabase (fire-and-forget)
          upsertWorkspaceToCloudForCurrentUser(newWorkspace).catch(() => {
            // Silently handle errors - local workspace was created successfully
            // Cloud sync is best-effort
          });
        },

        deleteWorkspace: (id) => {
          // Don't allow deleting the only non-archived workspace
          set((state) => {
            const nonArchivedCount = state.workspaces.filter((ws) => !ws.isArchived).length;
            if (nonArchivedCount <= 1 && !state.workspaces.find((ws) => ws.id === id)?.isArchived) {
              return state;
            }

            const filtered = state.workspaces.filter((ws) => ws.id !== id);
            const newActiveId =
              state.activeWorkspaceId === id
                ? filtered.find((ws) => !ws.isArchived)?.id || filtered[0]?.id || null
                : state.activeWorkspaceId;

            return {
              workspaces: filtered,
              activeWorkspaceId: newActiveId,
            };
          });

          // Sync deletion to Supabase (fire-and-forget)
          deleteWorkspaceFromCloudForCurrentUser(id).catch(() => {});
        },

        updateWorkspace: (id, updates) => {
          set((state) => ({
            workspaces: state.workspaces.map((ws) =>
              ws.id === id ? { ...ws, ...updates } : ws
            ),
          }));

          // Sync update to Supabase (fire-and-forget)
          const updated = get().workspaces.find((ws) => ws.id === id);
          if (updated) upsertWorkspaceToCloudForCurrentUser(updated).catch(() => {});
        },

        switchWorkspace: (id) => {
          const workspace = get().workspaces.find((ws) => ws.id === id);
          if (workspace && !workspace.isArchived) {
            set({ activeWorkspaceId: id });
          }
        },

        toggleFavorite: (id) => {
          set((state) => ({
            workspaces: state.workspaces.map((ws) =>
              ws.id === id ? { ...ws, isFavorite: !ws.isFavorite } : ws
            ),
          }));

          // Sync update to Supabase (fire-and-forget)
          const updated = get().workspaces.find((ws) => ws.id === id);
          if (updated) upsertWorkspaceToCloudForCurrentUser(updated).catch(() => {});
        },

        toggleArchive: (id) => {
          set((state) => {
            // Don't archive if it's the only active workspace
            const target = state.workspaces.find((ws) => ws.id === id);
            if (target && !target.isArchived) {
              const nonArchivedCount = state.workspaces.filter((ws) => !ws.isArchived).length;
              if (nonArchivedCount <= 1) return state;
            }

            const updated = state.workspaces.map((ws) =>
              ws.id === id ? { ...ws, isArchived: !ws.isArchived } : ws
            );

            const newActiveId =
              state.activeWorkspaceId === id && target?.isArchived === false
                ? updated.find((ws) => !ws.isArchived)?.id || updated[0]?.id || null
                : state.activeWorkspaceId;

            return {
              workspaces: updated,
              activeWorkspaceId: newActiveId,
            };
          });

          // Sync update to Supabase (fire-and-forget)
          const updated = get().workspaces.find((ws) => ws.id === id);
          if (updated) upsertWorkspaceToCloudForCurrentUser(updated).catch(() => {});
        },

        incrementSearchCount: (id) => {
          set((state) => ({
            workspaces: state.workspaces.map((ws) =>
              ws.id === id ? { ...ws, searchCount: ws.searchCount + 1 } : ws
            ),
          }));
        },

        getActiveWorkspace: () => {
          const state = get();
          return state.workspaces.find((ws) => ws.id === state.activeWorkspaceId) || null;
        },

        mergeCloudWorkspaces: (cloudWorkspaces: Workspace[]) => {
          if (cloudWorkspaces.length === 0) return;
          set((state) => {
            // Build lookup map of cloud workspaces by ID
            const cloudById = new Map<string, Workspace>(
              cloudWorkspaces.map((ws) => [ws.id, ws])
            );

            // Start with local workspaces — cloud wins if IDs overlap
            const mergedMap = new Map<string, Workspace>();
            for (const local of state.workspaces) {
              const cloud = cloudById.get(local.id);
              mergedMap.set(local.id, cloud ? { ...local, ...cloud } : local);
            }
            // Add cloud-only workspaces (not present locally)
            for (const cloud of cloudWorkspaces) {
              if (!mergedMap.has(cloud.id)) {
                mergedMap.set(cloud.id, cloud);
              }
            }

            const mergedWorkspaces = Array.from(mergedMap.values());

            // Validate activeWorkspaceId is still valid after merge
            const activeStillExists = mergedWorkspaces.some(
              (ws) => ws.id === state.activeWorkspaceId
            );
            const newActiveId = activeStillExists
              ? state.activeWorkspaceId
              : mergedWorkspaces.find((ws) => !ws.isArchived)?.id ||
                mergedWorkspaces[0]?.id || null;

            return { workspaces: mergedWorkspaces, activeWorkspaceId: newActiveId };
          });
        },

        clearForNewUser: () => {
          const newDefault = createDefaultWorkspace();
          set({
            workspaces: [newDefault],
            activeWorkspaceId: newDefault.id,
          });
          localStorage.removeItem('workspace-storage');
        },
      };
    },
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
