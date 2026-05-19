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
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        // Clean up all auth-related localStorage keys.
        // NOTE: useAuth() also calls apiClient.clearAuth() which handles token cleanup.
        // This direct cleanup protects against calling logout() from outside useAuth().
        if (typeof window !== 'undefined') {
          localStorage.removeItem(storageKey)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_refresh_token')
          localStorage.removeItem('auth_remember_me')
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
        return (state) => {
          useAuthStore.setState({
            isLoading: false,
            isAuthenticated: !!state?.user,
          })
        }
      },
    },
  ),
)

export type { AuthUser as User } from '@/types/api'
