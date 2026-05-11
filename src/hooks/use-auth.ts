'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/services/api'

export function useAuth() {
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    setUser,
    setToken,
    setRefreshToken,
    setLoading,
    logout: logoutStore,
  } = useAuthStore()

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true)
        const response = await apiClient.auth.login({ email, password })
        const { access_token, refresh_token, user: userData } = response.data

        // Store tokens in both zustand and apiClient
        setToken(access_token)
        setRefreshToken(refresh_token)
        apiClient.setToken(access_token)
        apiClient.setRefreshToken(refresh_token)
        setUser(userData)

        return { success: true }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Login failed'
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setUser, setToken, setRefreshToken]
  )

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setLoading(true)
        const response = await apiClient.auth.register({ email, password, name })
        const { access_token, refresh_token, user: userData } = response.data

        setToken(access_token)
        setRefreshToken(refresh_token)
        apiClient.setToken(access_token)
        apiClient.setRefreshToken(refresh_token)
        setUser(userData)

        return { success: true }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Registration failed'
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setUser, setToken, setRefreshToken]
  )

  const logout = useCallback(() => {
    apiClient.clearAuth()
    logoutStore()
  }, [logoutStore])

  // Sync token from store to apiClient on hydration
  if (typeof window !== 'undefined' && token && !apiClient.getToken()) {
    apiClient.setToken(token)
  }
  const refreshToken = useAuthStore.getState().refreshToken
  if (typeof window !== 'undefined' && refreshToken && !apiClient.getRefreshToken()) {
    apiClient.setRefreshToken(refreshToken)
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    setLoading,
    setUser,
    setToken,
  }
}
