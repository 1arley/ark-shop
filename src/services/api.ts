import { env } from '@/lib/env'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  Product,
  ProductListParams,
  Category,
  ApiCart,
  Order,
  CreateOrderPayload,
  Payment,
  CreatePaymentPayload,
  DeliveredKey,
  DashboardStats,
  PaginatedResponse,
} from '@/types/api'

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
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshQueue: Array<{
    resolve: (token: string) => void
    reject: (error: Error) => void
  }> = []

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken
    if (typeof window !== 'undefined') {
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken)
      } else {
        localStorage.removeItem('auth_refresh_token')
      }
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return this.token || localStorage.getItem('auth_token') || null
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return this.refreshToken || localStorage.getItem('auth_refresh_token') || null
  }

  clearAuth() {
    this.token = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
    }
  }

  private async tryRefreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject })
      })
    }

    this.isRefreshing = true

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        this.clearAuth()
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newToken = data.access_token
      const newRefreshToken = data.refresh_token

      this.setToken(newToken)
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken)
      }

      this.refreshQueue.forEach(({ resolve }) => resolve(newToken))
      this.refreshQueue = []

      return newToken
    } catch (error) {
      this.refreshQueue.forEach(({ reject }) => reject(error as Error))
      this.refreshQueue = []
      this.clearAuth()
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: RequestMethod
      data?: Record<string, unknown>
      requiresAuth?: boolean
      retry?: boolean
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', data, retry = true } = options
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      })

      // Handle 401 — try token refresh once
      if (response.status === 401 && retry && this.getRefreshToken()) {
        try {
          const newToken = await this.tryRefreshToken()
          headers['Authorization'] = `Bearer ${newToken}`
          const retryResponse = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
          })
          const retryData = await retryResponse.json().catch(() => ({}))
          if (!retryResponse.ok) {
            const error: ApiError = {
              name: 'ApiError',
              message: retryData.message || `HTTP ${retryResponse.status}`,
              status: retryResponse.status,
              code: retryData.code || 'UNKNOWN_ERROR',
              details: retryData.details,
            }
            throw error
          }
          return { data: retryData as T, status: retryResponse.status }
        } catch {
          // Refresh failed — clear auth and redirect to login
          this.clearAuth()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          throw {
            name: 'AuthError',
            message: 'Session expired. Please log in again.',
            status: 401,
            code: 'SESSION_EXPIRED',
          } as ApiError
        }
      }

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        const error: ApiError = {
          name: 'ApiError',
          message: Array.isArray(responseData.message)
            ? responseData.message.join(', ')
            : responseData.message || `HTTP ${response.status}`,
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

  // --- Generic HTTP methods ---

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

  // ============================================================
  // Typed API Methods
  // ============================================================

  // --- Auth ---

  auth = {
    login: (payload: LoginPayload) =>
      this.post<AuthResponse>('/auth/login', payload as unknown as Record<string, unknown>),

    register: (payload: RegisterPayload) =>
      this.post<AuthResponse>('/auth/register', payload as unknown as Record<string, unknown>),

    refresh: (refreshToken: string) =>
      this.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken }),
  }

  // --- Products ---

  products = {
    list: (params?: ProductListParams) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.search) searchParams.set('search', params.search)
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive))
      if (params?.categoryId) searchParams.set('categoryId', params.categoryId)
      const query = searchParams.toString()
      return this.get<PaginatedResponse<Product> | Product[]>(`/products${query ? `?${query}` : ''}`)
    },

    getById: (id: string) =>
      this.get<Product>(`/products/${id}`),
  }

  // --- Categories ---

  categories = {
    list: () =>
      this.get<Category[]>('/categories'),

    getRoot: () =>
      this.get<Category[]>('/categories/root'),
  }

  // --- Cart ---

  cart = {
    get: () =>
      this.get<ApiCart>('/cart', { requiresAuth: true }),

    addItem: (productId: string, quantity: number) =>
      this.post<ApiCart>('/cart/items', { productId, quantity }, { requiresAuth: true }),

    updateItem: (productId: string, quantity: number) =>
      this.patch<ApiCart>(`/cart/items/${productId}`, { quantity }, { requiresAuth: true }),

    removeItem: (productId: string) =>
      this.delete<ApiCart>(`/cart/items/${productId}`, { requiresAuth: true }),

    clear: () =>
      this.delete<void>('/cart', { requiresAuth: true }),
  }

  // --- Orders ---

  orders = {
    create: (payload: CreateOrderPayload) =>
      this.post<Order>('/orders', payload as unknown as Record<string, unknown>, { requiresAuth: true }),

    list: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return this.get<PaginatedResponse<Order> | Order[]>(`/orders${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    getById: (id: string) =>
      this.get<Order>(`/orders/${id}`, { requiresAuth: true }),

    cancel: (id: string) =>
      this.post<Order>(`/orders/${id}/cancel`, undefined, { requiresAuth: true }),

    downloadKeys: (id: string) =>
      this.get<DeliveredKey[]>(`/orders/${id}/download`, { requiresAuth: true }),
  }

  // --- Payments ---

  payments = {
    create: (orderId: string, payload: CreatePaymentPayload) =>
      this.post<Payment>(`/payments/${orderId}`, payload as unknown as Record<string, unknown>, { requiresAuth: true }),

    getById: (id: string) =>
      this.get<Payment>(`/payments/${id}`, { requiresAuth: true }),

    getByOrder: (orderId: string) =>
      this.get<Payment>(`/payments/order/${orderId}`, { requiresAuth: true }),
  }

  // --- Admin ---

  admin = {
    dashboard: () =>
      this.get<DashboardStats>('/admin/dashboard', { requiresAuth: true }),

    listProducts: (params?: { page?: number; limit?: number; search?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.search) searchParams.set('search', params.search)
      const query = searchParams.toString()
      return this.get<PaginatedResponse<Product>>(`/admin/products${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    createProduct: (data: { name: string; description?: string; price: number; stock: number; categoryId?: string; imageUrl?: string }) =>
      this.post<Product>('/admin/products', data as unknown as Record<string, unknown>, { requiresAuth: true }),

    updateProduct: (id: string, data: { name?: string; description?: string; price?: number; stock?: number; categoryId?: string; imageUrl?: string; isActive?: boolean }) =>
      this.patch<Product>(`/admin/products/${id}`, data as unknown as Record<string, unknown>, { requiresAuth: true }),

    deleteProduct: (id: string) =>
      this.delete<void>(`/admin/products/${id}`, { requiresAuth: true }),

    listOrders: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.status) searchParams.set('status', params.status)
      const query = searchParams.toString()
      return this.get<PaginatedResponse<Order>>(`/admin/orders${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    updateOrderStatus: (id: string, status: string) =>
      this.patch<Order>(`/admin/orders/${id}/status`, { status }, { requiresAuth: true }),

    addKeys: (productId: string, keys: string[]) =>
      this.post<{ count: number }>(`/admin/products/${productId}/keys`, { keys }, { requiresAuth: true }),

    listKeys: (params?: { page?: number; limit?: number; productId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.productId) searchParams.set('productId', params.productId)
      const query = searchParams.toString()
      return this.get<PaginatedResponse<{ id: string; key: string; status: string; product: { name: string } }>>(`/admin/keys${query ? `?${query}` : ''}`, { requiresAuth: true })
    },
  }
}

export const apiClient = new ApiClientClass()
