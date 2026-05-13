'use client'

import { useCallback, useEffect } from 'react'
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
    initialize,
  } = useAuthStore()

  // On mount: try to authenticate via HTTP-only cookie (sent automatically)
  useEffect(() => {
    initialize()
  }, [initialize])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true)
        const response = await apiClient.auth.login({ email, password })
        const { access_token, refresh_token, user: userData } = response.data

        // Store in apiClient as fallback Authorization header
        apiClient.setToken(access_token)
        apiClient.setRefreshToken(refresh_token)
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
    // Notify backend to revoke refresh token (fire-and-forget)
    apiClient.auth.logout().catch(() => {})
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
