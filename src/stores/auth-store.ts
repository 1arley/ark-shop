import { create } from 'zustand'
import type { AuthUser } from '@/types/api'
import { apiClient } from '@/services/api'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  /** Inicializa o estado de auth consultando /auth/me via cookie HTTP-only */
  initialize: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  initialize: async () => {
    try {
      const res = await apiClient.auth.me()
      set({ user: res.data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
}))

export type { AuthUser as User } from '@/types/api'
