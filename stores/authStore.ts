import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean

  setUser: (user: AuthUser | null) => void
  setIsLoading: (isLoading: boolean) => void
  setHydrated: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setIsLoading: (isLoading) => set({ isLoading }),

      setHydrated: () => set({ hasHydrated: true }),

      logout: () => {
        // Clear localStorage immediately to prevent re-hydration of stale state
        try {
          localStorage.removeItem('auth-store');
        } catch (e) {
          console.warn('Failed to clear auth-store from localStorage:', e);
        }
        return set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    }
  )
)
