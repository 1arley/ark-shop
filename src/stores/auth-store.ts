import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '@/types/api'

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
  setRefreshToken: (refreshToken: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

const storageKey = 'ark-shop-auth'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setToken: (token) => {
        set({ token })
      },

      setRefreshToken: (refreshToken) => {
        set({ refreshToken })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
        if (typeof window !== 'undefined') {
          localStorage.removeItem(storageKey)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_refresh_token')
        }
      },
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Re-export for backwards compatibility
export type { AuthUser as User } from '@/types/api'
