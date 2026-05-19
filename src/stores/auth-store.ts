import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '@/types/api'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

const storageKey = 'ark-shop-auth'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        // Delegate token cleanup to apiClient to avoid cross-module localStorage coupling
        if (typeof window !== 'undefined') {
          localStorage.removeItem(storageKey)
        }
      },
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
      // Only persist user data — isAuthenticated is derived from !!user
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => {
        // Use zustand's setState instead of mutating the state object directly
        return (state) => {
          if (state) {
            useAuthStore.setState({
              isLoading: false,
              isAuthenticated: !!state.user,
            })
          }
        }
      },
    }
  )
)

export type { AuthUser as User } from '@/types/api'
