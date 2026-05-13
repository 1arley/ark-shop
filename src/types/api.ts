// ============================================================
// API Types — Aligned with ark-shop-back (NestJS + Prisma)
// ============================================================

// --- Auth ---

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN' | 'SUPERADMIN'
  avatarUrl?: string | null
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

export interface CreateCategoryPayload {
  name: string
  description?: string
  parentId?: string
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string
  parentId?: string
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
  total: number
  itemCount: number
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
  price: number
  product: Product
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  payment?: Payment | null
  user?: { id: string; name: string; email: string }
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
  pixCode: string | null
  pixCopyPaste: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentPayload {
  amount: number
  provider: PaymentProvider
  method: PaymentMethod
  payerCpf?: string
  payerBirthDate?: string
}

// --- Keys ---

export interface DeliveredKey {
  productName: string
  keyId: string
  deliveredAt: string
  decryptedKey: string
}

export interface DownloadKeysResponse {
  orderId: string
  status: OrderStatus
  keys: DeliveredKey[]
}

export interface GameKey {
  id: string
  productId: string
  keyData: string
  status: 'AVAILABLE' | 'RESERVED' | 'DELIVERED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  product?: { id: string; name: string }
}

export interface KeyStats {
  total: number
  available: number
  reserved: number
  delivered: number
  archived: number
}

export interface BatchImportResult {
  imported: number
  errors?: string[]
}

// --- Users (Admin) ---

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN' | 'SUPERADMIN'
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    orders: number
    payments: number
  }
}

export interface AdminUpdateUserPayload {
  name?: string
  email?: string
  role?: string
  avatarUrl?: string
}

// --- Notifications ---

export interface Notification {
  id: string
  userId: string
  type: 'EMAIL' | 'DISCORD' | 'TELEGRAM' | 'WEBHOOK'
  status: 'PENDING' | 'SENT' | 'FAILED'
  subject: string
  content: string
  metadata?: Record<string, unknown>
  sentAt: string | null
  readAt: string | null
  createdAt: string
}

// --- Sellers ---

export interface Seller {
  id: string
  userId: string
  companyName: string
  document: string
  commission: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: { id: string; name: string; email: string }
}

export interface CreateSellerPayload {
  userId: string
  companyName: string
  document: string
  commission?: number
  isActive?: boolean
}

export interface UpdateSellerPayload {
  companyName?: string
  document?: string
  commission?: number
  isActive?: boolean
}

// --- Fraud ---

export interface FraudLog {
  id: string
  userId: string
  orderId: string | null
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  checks: Record<string, unknown>
  ipAddress: string | null
  deviceFingerprint: string | null
  decision: string
  reason: string | null
  createdAt: string
}

// --- System Health ---

export interface SystemHealth {
  database: string
  products: number
  orders: number
  payments: number
  timestamp: string
}

// --- Upload ---

export interface UploadResponse {
  url: string
  key: string
  filename: string
}

// --- Admin Dashboard (Expanded) ---

// --- User Profile (for update) ---

export interface UpdateProfilePayload {
  name?: string
  email?: string
  avatarUrl?: string
}

// --- Reset Password ---

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
}

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
  users: {
    total: number
    activeToday: number
  }
  payments: {
    total: number
    pending: number
    approved: number
    rejected: number
    refunded: number
  }
  recentOrders: Order[]
  topProducts: Product[]
}

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponseMeta<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// --- Generic API Error ---

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
}
