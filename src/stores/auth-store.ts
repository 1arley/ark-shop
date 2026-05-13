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
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false)
        }
      },
    }
  )
)

export type { AuthUser as User } from '@/types/api'
