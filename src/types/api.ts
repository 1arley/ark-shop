// ============================================================
// API Types — Aligned with ark-shop-back (NestJS + Prisma)
// ============================================================

// --- Auth ---

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN' | 'SUPERADMIN'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
}

// --- Products ---

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  isActive: boolean
  imageUrl: string | null
  categoryId: string | null
  category: Category | null
  createdAt: string
  updatedAt: string
}

export interface ProductListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  categoryId?: string
}

// --- Categories ---

export interface Category {
  id: string
  name: string
  description: string | null
  parentId: string | null
  children?: Category[]
  _count?: {
    products: number
  }
}

// --- Cart ---

export interface ApiCartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: Product
}

export interface ApiCart {
  id: string
  userId: string
  items: ApiCartItem[]
  createdAt: string
  updatedAt: string
}

// --- Orders ---

export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  product: Product
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  payments?: Payment[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  items: {
    productId: string
    quantity: number
  }[]
}

// --- Payments ---

export type PaymentProvider = 'MERCADO_PAGO'
export type PaymentMethod = 'PIX'
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED'

export interface Payment {
  id: string
  orderId: string
  amount: number
  provider: PaymentProvider
  method: PaymentMethod
  status: PaymentStatus
  externalId: string | null
  pixQrCode: string | null
  pixCopyPaste: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentPayload {
  amount: number
  provider: PaymentProvider
  method: PaymentMethod
}

// --- Keys ---

export interface DeliveredKey {
  productName: string
  key: string
}

// --- Admin Dashboard ---

export interface DashboardStats {
  revenue: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    completed: number
    cancelled: number
  }
  products: {
    total: number
    active: number
    inactive: number
    lowStock: number
  }
  keys: {
    total: number
    available: number
    reserved: number
    delivered: number
  }
}

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// --- Generic API Error ---

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
}
