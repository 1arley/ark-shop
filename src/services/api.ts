import { env } from '@/lib/env'
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  UpdateProfilePayload,
  VerifyEmailPayload,
  VerifyEmailResponse,
  Product,
  ProductListParams,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  ApiCart,
  Order,
  CreateOrderPayload,
  Payment,
  CreatePaymentPayload,
  DashboardStats,
  PaginatedResponse,
  PaginatedResponseMeta,
  AdminUser,
  AdminUpdateUserPayload,
  GameKey,
  KeyStats,
  BatchImportResult,
  Notification,
  Seller,
  CreateSellerPayload,
  UpdateSellerPayload,
  FraudLog,
  SystemHealth,
  UploadResponse,
  DownloadKeysResponse,
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  ValidateCouponPayload,
  ValidateCouponResponse,
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
  private rememberMe = false
  private isRefreshing = false
  private refreshQueue: Array<{
    resolve: (token: string) => void
    reject: (error: Error) => void
  }> = []
  private refreshQueueTimeout: ReturnType<typeof setTimeout> | null = null

  // Auto-refresh tracking
  private autoRefreshTimer: ReturnType<typeof setInterval> | null = null
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null
  private lastActivity = Date.now()
  private tokenExpiryTime: number | null = null

  // Timings (in ms)
  private readonly ACCESS_TOKEN_LIFETIME = 30 * 60 * 1000 // 30 minutes
  private readonly REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000 // 5 minutes before
  private readonly INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes of inactivity

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL
    // Restore tokens from localStorage as fallback for API calls.
    // HTTP-only cookies are used for middleware/SSR protection.
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_token')
      if (stored) this.token = stored
      const storedRefresh = localStorage.getItem('auth_refresh_token')
      if (storedRefresh) this.refreshToken = storedRefresh
      const storedRemember = localStorage.getItem('auth_remember_me')
      if (storedRemember) this.rememberMe = storedRemember === 'true'

      // Start auto-refresh if we have a token
      if (this.token) {
        this.startAutoRefresh()
      }
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
        // Set expiry time: 30 minutes from now
        this.tokenExpiryTime = Date.now() + this.ACCESS_TOKEN_LIFETIME
      } else {
        localStorage.removeItem('auth_token')
        this.tokenExpiryTime = null
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

  setRememberMe(remember: boolean) {
    this.rememberMe = remember
    if (typeof window !== 'undefined') {
      if (remember) {
        localStorage.setItem('auth_remember_me', 'true')
      } else {
        localStorage.removeItem('auth_remember_me')
      }
    }
  }

  getRememberMe(): boolean {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('auth_remember_me')
    return stored === 'true' || this.rememberMe
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
    this.rememberMe = false
    this.tokenExpiryTime = null
    this.stopAutoRefresh()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_remember_me')
    }
  }

  /**
   * Start auto-refresh timer that checks every minute if token needs refresh.
   * Also tracks user activity to prevent refresh when inactive.
   */
  private startAutoRefresh() {
    this.stopAutoRefresh()

    // Check every minute
    this.autoRefreshTimer = setInterval(() => {
      this.checkAndRefreshToken()
    }, 60 * 1000)

    // Track user activity
    this.setupActivityTracking()
  }

  private stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer)
      this.autoRefreshTimer = null
    }
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
      this.inactivityTimer = null
    }
  }

  private setupActivityTracking() {
    if (typeof window === 'undefined') return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

    const handleActivity = () => {
      this.lastActivity = Date.now()

      // Reset inactivity timer
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer)
      }
    }

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })
  }

  /**
   * Check if token needs refresh and perform refresh if user is active.
   */
  private async checkAndRefreshToken() {
    if (!this.token || !this.tokenExpiryTime) return

    const timeUntilExpiry = this.tokenExpiryTime - Date.now()
    const timeSinceActivity = Date.now() - this.lastActivity

    // If user has been inactive for too long, log them out
    if (timeSinceActivity > this.INACTIVITY_TIMEOUT) {
      // Only auto-logout if NOT rememberMe
      if (!this.getRememberMe()) {
        console.log('[ApiClient] User inactive for 10 minutes, logging out')
        this.clearAuth()
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=inactivity'
        }
        return
      }
    }

    // If token expires within 5 minutes, refresh it
    if (timeUntilExpiry < this.REFRESH_BEFORE_EXPIRY && timeUntilExpiry > 0) {
      console.log('[ApiClient] Token expiring soon, refreshing...')
      try {
        await this.tryRefreshToken()
      } catch {
        // Refresh failed — will be handled by request interceptor
      }
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

    // Safety timeout: clear the queue after 15 seconds to prevent memory leaks
    this.refreshQueueTimeout = setTimeout(() => {
      if (this.refreshQueue.length > 0) {
        const timeoutError = new Error('Token refresh timed out after 15s')
        this.refreshQueue.forEach(({ reject }) => reject(timeoutError))
        this.refreshQueue = []
        this.isRefreshing = false
      }
    }, 15000)

    try {
      // Backend expects refresh token in Authorization Bearer header, not in body
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
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
      if (this.refreshQueueTimeout) clearTimeout(this.refreshQueueTimeout)
      this.refreshQueue.forEach(({ reject }) => reject(error as Error))
      this.refreshQueue = []
      this.clearAuth()
      throw error
    } finally {
      if (this.refreshQueueTimeout) clearTimeout(this.refreshQueueTimeout)
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
        credentials: 'include',
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
            credentials: 'include',
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
      // Re-throw if it's already a typed ApiError (has status and code)
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        'code' in error
      ) {
        throw error
      }

      // If it has a status but not code, it's still an ApiError-like
      if (error && typeof error === 'object' && 'status' in error) {
        throw error
      }

      const networkErrorMessage =
        error instanceof Error ? error.message : 'Network error. Please check your connection.'
      const networkError: ApiError = {
        name: 'NetworkError',
        message: networkErrorMessage,
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
      this.post<RegisterResponse>('/auth/register', payload as unknown as Record<string, unknown>),

    me: () =>
      this.get<AuthUser>('/auth/me', { requiresAuth: true }),

    refresh: async (refreshToken: string) => {
      // Backend expects refresh token in Authorization Bearer header, not in body
      const response = await fetch(`${apiClient['baseURL']}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      })
      const data = await response.json().catch(() => ({}))
      return { data, status: response.status }
    },

    logout: () =>
      this.post<{ message: string }>('/auth/logout', undefined, { requiresAuth: true }),

    forgotPassword: (email: string) =>
      this.post<{ message: string }>('/auth/forgot-password', { email }),

    resetPassword: (payload: ResetPasswordPayload) =>
      this.post<{ message: string }>('/auth/reset-password', payload as unknown as Record<string, unknown>),

    verifyEmail: (payload: VerifyEmailPayload) =>
      this.post<VerifyEmailResponse>('/auth/verify-email', payload as unknown as Record<string, unknown>),

    resendVerification: (email: string) =>
      this.post<{ message: string }>('/auth/resend-verification', { email }),
  }

  // --- User Profile ---

  user = {
    getMe: () =>
      this.get<AuthUser>('/user/me', { requiresAuth: true }),

    updateMe: (data: UpdateProfilePayload) =>
      this.patch<AuthUser>('/user/me', data as unknown as Record<string, unknown>, { requiresAuth: true }),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      this.patch<{ message: string }>('/user/change-password', data as unknown as Record<string, unknown>, { requiresAuth: true }),

    deleteMe: () =>
      this.delete<void>('/user/me', { requiresAuth: true }),
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

    getCount: () =>
      this.get<{ count: number }>('/cart/count', { requiresAuth: true }),
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
      this.get<DownloadKeysResponse>(`/orders/${id}/download`, { requiresAuth: true }),
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

  // ============================================================
  // Admin API Methods
  // ============================================================

  admin = {
    dashboard: () =>
      this.get<DashboardStats>('/admin/dashboard', { requiresAuth: true }),

    // --- Products ---
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

    // --- Orders ---
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

    // --- Keys ---
    addKeys: (productId: string, keys: string[]) =>
      this.post<{ count: number }>(`/admin/products/${productId}/keys`, { keys }, { requiresAuth: true }),

    listKeys: (params?: { page?: number; limit?: number; productId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.productId) searchParams.set('productId', params.productId)
      const query = searchParams.toString()
      return this.get<PaginatedResponse<GameKey>>(`/admin/keys${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    bulkImportKeys: (productId: string, keysText: string, isCsv?: boolean) =>
      this.post<BatchImportResult>('/admin/keys/import', { productId, keysText, isCsv } as unknown as Record<string, unknown>, { requiresAuth: true }),

    // --- Users ---
    listUsers: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return this.get<PaginatedResponseMeta<AdminUser>>(`/admin/users${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    getUser: (id: string) =>
      this.get<AdminUser>(`/admin/users/${id}`, { requiresAuth: true }),

    updateUser: (id: string, data: AdminUpdateUserPayload) =>
      this.patch<AdminUser>(`/admin/users/${id}`, data as unknown as Record<string, unknown>, { requiresAuth: true }),

    deleteUser: (id: string) =>
      this.delete<void>(`/admin/users/${id}`, { requiresAuth: true }),

    // --- Fraud Logs ---
    getFraudLogs: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return this.get<PaginatedResponseMeta<FraudLog>>(`/admin/fraud-logs${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    // --- System Health ---
    getSystemHealth: () =>
      this.get<SystemHealth>('/admin/health', { requiresAuth: true }),

    // --- Demo Data ---
    generateDemoData: (productsCount?: number, keysPerProduct?: number) =>
      this.post<{ categories: number; products: number; keys: number }>('/admin/generate-demo', { productsCount, keysPerProduct } as unknown as Record<string, unknown>, { requiresAuth: true }),

    clearDemoData: (confirmationToken: string) =>
      this.post<{ message: string }>('/admin/clear-demo', { confirmationToken }, { requiresAuth: true }),
  }

  // --- Categories (Admin CRUD) ---

  categoriesAdmin = {
    list: () =>
      this.get<Category[]>('/categories'),

    create: (data: CreateCategoryPayload) =>
      this.post<Category>('/categories', data as unknown as Record<string, unknown>, { requiresAuth: true }),

    update: (id: string, data: UpdateCategoryPayload) =>
      this.patch<Category>(`/categories/${id}`, data as unknown as Record<string, unknown>, { requiresAuth: true }),

    delete: (id: string) =>
      this.delete<void>(`/categories/${id}`, { requiresAuth: true }),
  }

  // --- Keys (Admin individual management) ---

  keysAdmin = {
    getProductKeys: (productId: string, params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return this.get<GameKey[]>(`/keys/product/${productId}${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    getKeyStats: (productId: string) =>
      this.get<KeyStats>(`/keys/stats/${productId}`, { requiresAuth: true }),

    getKey: (id: string) =>
      this.get<GameKey>(`/keys/${id}`, { requiresAuth: true }),

    updateKey: (id: string, data: { keyData?: string; status?: string }) =>
      this.patch<GameKey>(`/keys/${id}`, data as unknown as Record<string, unknown>, { requiresAuth: true }),

    deleteKey: (id: string) =>
      this.delete<void>(`/keys/${id}`, { requiresAuth: true }),

    generateDemoKeys: (productId: string, quantity?: number) =>
      this.post<{ count: number }>('/keys/generate-demo', { productId, quantity }, { requiresAuth: true }),
  }

  // --- Orders (Extended) ---

  ordersAdmin = {
    deliverOrder: (id: string) =>
      this.post<Order>(`/orders/${id}/deliver`, undefined, { requiresAuth: true }),

    getRecentOrders: (limit?: number) =>
      this.get<Order[]>(`/orders/recent?limit=${limit || 10}`, { requiresAuth: true }),

    updateStatus: (id: string, status: string) =>
      this.patch<Order>(`/orders/${id}/status`, { status }, { requiresAuth: true }),
  }

  // --- Payments (Extended) ---

  paymentsAdmin = {
    refundPayment: (id: string, amount?: number) =>
      this.post<Payment>(`/payments/${id}/refund`, amount ? { amount } : undefined, { requiresAuth: true }),

    getUserPayments: (userId: string, params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return this.get<Payment[]>(`/payments/user/${userId}${query ? `?${query}` : ''}`, { requiresAuth: true })
    },
  }

  // --- Notifications ---

  notifications = {
    list: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return this.get<PaginatedResponse<Notification>>(`/notifications${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    countUnread: () =>
      this.get<{ count: number }>('/notifications/unread/count', { requiresAuth: true }),

    getById: (id: string) =>
      this.get<Notification>(`/notifications/${id}`, { requiresAuth: true }),

    markAsRead: (id: string) =>
      this.patch<Notification>(`/notifications/${id}/read`, undefined, { requiresAuth: true }),

    markAllAsRead: () =>
      this.patch<{ message: string }>('/notifications/read-all', undefined, { requiresAuth: true }),
  }

  // --- Sellers ---

  sellers = {
    create: (data: CreateSellerPayload) =>
      this.post<Seller>('/admin/sellers', data as unknown as Record<string, unknown>, { requiresAuth: true }),

    list: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return this.get<PaginatedResponseMeta<Seller>>(`/admin/sellers${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    getById: (id: string) =>
      this.get<Seller>(`/admin/sellers/${id}`, { requiresAuth: true }),

    update: (id: string, data: UpdateSellerPayload) =>
      this.patch<Seller>(`/admin/sellers/${id}`, data as unknown as Record<string, unknown>, { requiresAuth: true }),

    delete: (id: string) =>
      this.delete<void>(`/admin/sellers/${id}`, { requiresAuth: true }),
  }

  // --- Contact ---

  contact = {
    submit: (data: { name: string; email: string; subject: string; message: string }) =>
      this.post<{ message: string }>('/contact', data as unknown as Record<string, unknown>),
  }

  // --- Coupons ---

  coupons = {
    // Public: validate coupon
    validate: (payload: ValidateCouponPayload) =>
      this.post<ValidateCouponResponse>('/coupons/validate', payload as unknown as Record<string, unknown>),

    // Admin CRUD
    list: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return this.get<PaginatedResponseMeta<Coupon>>(`/coupons${query ? `?${query}` : ''}`, { requiresAuth: true })
    },

    getById: (id: string) =>
      this.get<Coupon>(`/coupons/${id}`, { requiresAuth: true }),

    create: (data: CreateCouponPayload) =>
      this.post<Coupon>('/coupons', data as unknown as Record<string, unknown>, { requiresAuth: true }),

    update: (id: string, data: UpdateCouponPayload) =>
      this.patch<Coupon>(`/coupons/${id}`, data as unknown as Record<string, unknown>, { requiresAuth: true }),

    delete: (id: string) =>
      this.delete<void>(`/coupons/${id}`, { requiresAuth: true }),
  }

  // --- Upload ---

  upload = {
    single: async (file: File, folder?: string) => {
      const formData = new FormData()
      formData.append('file', file)
      if (folder) formData.append('folder', folder)

      const token = this.getToken()
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw { name: 'ApiError', message: data.message || `HTTP ${response.status}`, status: response.status, code: data.code || 'UPLOAD_ERROR' }
      return { data, status: response.status } as ApiResponse<UploadResponse>
    },

    multiple: async (files: File[], folder?: string) => {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      if (folder) formData.append('folder', folder)

      const token = this.getToken()
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${this.baseURL}/upload/multiple`, {
        method: 'POST',
        headers,
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw { name: 'ApiError', message: data.message || `HTTP ${response.status}`, status: response.status, code: data.code || 'UPLOAD_ERROR' }
      return { data, status: response.status } as ApiResponse<UploadResponse[]>
    },

    delete: (key: string) =>
      this.delete<void>(`/upload/${key}`, { requiresAuth: true }),
  }
}

export const apiClient = new ApiClientClass()
