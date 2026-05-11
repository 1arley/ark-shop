import { env } from '@/lib/env'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiError extends Error {
  status: number
  code: string
  details?: Record<string, string[]>
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
}

class ApiClientClass {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('auth_token', token)
    } else if (typeof window !== 'undefined' && !token) {
      localStorage.removeItem('auth_token')
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    return this.token || localStorage.getItem('auth_token') || null
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: RequestMethod
      data?: Record<string, unknown>
      requiresAuth?: boolean
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', data, requiresAuth = false } = options
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = this.getToken()
    if (token || requiresAuth) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      })

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        const error: ApiError = {
          name: 'ApiError',
          message: responseData.message || `HTTP ${response.status}`,
          status: response.status,
          code: responseData.code || 'UNKNOWN_ERROR',
          details: responseData.details,
        }
        throw error
      }

      return {
        data: responseData as T,
        status: response.status,
      }
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error
      }

      const networkError: ApiError = {
        name: 'NetworkError',
        message: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      }
      throw networkError
    }
  }

  async get<T>(endpoint: string, options?: { requiresAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: { requiresAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', data })
  }

  async put<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: { requiresAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data })
  }

  async delete<T>(endpoint: string, options?: { requiresAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  async patch<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: { requiresAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', data })
  }
}

export const apiClient = new ApiClientClass()
