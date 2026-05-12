'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/services/api'
import { extractApiError } from '@/lib/utils'

export function useAuth() {
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    refreshToken,
    setUser,
    setToken,
    setRefreshToken,
    setLoading,
    logout: logoutStore,
  } = useAuthStore()

  // Sync token from store to apiClient after hydration (runs once)
  const synced = useRef(false)
  useEffect(() => {
    if (synced.current) return
    synced.current = true

    const storedToken = token || useAuthStore.getState().token
    const storedRefresh = refreshToken || useAuthStore.getState().refreshToken

    if (storedToken && !apiClient.getToken()) {
      apiClient.setToken(storedToken)
    }
    if (storedRefresh && !apiClient.getRefreshToken()) {
      apiClient.setRefreshToken(storedRefresh)
    }
  }, [token, refreshToken])

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
        return { success: false, error: extractApiError(error, 'Login failed') }
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
        return { success: false, error: extractApiError(error, 'Registration failed') }
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
