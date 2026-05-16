'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { apiClient } from '@/services/api'
import { extractApiError } from '@/lib/utils'

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    setLoading,
    logout: logoutStore,
  } = useAuthStore()

  // Sync token from store to apiClient after hydration (runs once)
  const synced = useRef(false)
  useEffect(() => {
    if (synced.current) return
    synced.current = true

    // On mount: apiClient already restored from localStorage in constructor.
    // If store has a user but apiClient doesn't have a token (edge case),
    // try to restore from localStorage.
    if (!apiClient.getToken()) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (stored) apiClient.setToken(stored)
    }
    if (!apiClient.getRefreshToken()) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('auth_refresh_token') : null
      if (stored) apiClient.setRefreshToken(stored)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      try {
        setLoading(true)
        const response = await apiClient.auth.login({ email, password, rememberMe })
        const { access_token, refresh_token, user: userData } = response.data

        apiClient.setToken(access_token)
        apiClient.setRefreshToken(refresh_token)
        apiClient.setRememberMe(rememberMe)
        setUser(userData)

        return { success: true }
      } catch (error) {
        return { success: false, error: extractApiError(error, 'Login failed') }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setUser]
  )

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setLoading(true)
        const response = await apiClient.auth.register({ email, password, name })
        const { access_token, refresh_token, user: userData } = response.data

        apiClient.setToken(access_token)
        apiClient.setRefreshToken(refresh_token)
        setUser(userData)

        return { success: true }
      } catch (error) {
        return { success: false, error: extractApiError(error, 'Registration failed') }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setUser]
  )

  const logout = useCallback(() => {
    apiClient.auth.logout().catch((err) => console.error('[useAuth] Logout API call failed:', err))
    apiClient.clearAuth()
    logoutStore()
    useCartStore.getState().clearCart()
  }, [logoutStore])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    setLoading,
    setUser,
  }
}
