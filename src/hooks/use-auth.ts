'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '@/stores/auth-store'

export function useAuth() {
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    setUser,
    setToken,
    setLoading,
    logout: logoutStore,
  } = useAuthStore()

  const login = useCallback(
    async (email: string, _password: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        // const response = await api.post('/auth/login', { email, password })
        // setToken(response.data.token)
        // setUser(response.data.user)
        
        // Simulated login for demo
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const mockUser: User = {
          id: '1',
          email,
          name: email.split('@')[0],
        }
        setUser(mockUser)
        
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        }
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
        // TODO: Replace with actual API call
        // const response = await api.post('/auth/register', { email, password, name })
        
        // Simulated registration
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const mockUser: User = {
          id: '1',
          email,
          name,
        }
        setUser(mockUser)
        
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Registration failed',
        }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setUser]
  )

  const logout = useCallback(() => {
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
