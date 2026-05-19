'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  Mail,
  ArrowLeft,
  Loader2,
  Edit2,
  Save,
  Trash2,
  ShoppingBag,
  CreditCard,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { apiClient } from '@/services/api'
import { formatPrice } from '@/lib/utils'
import type { AdminUser, AdminUpdateUserPayload, Order, Payment } from '@/types/api'

function UserDetailContent() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<AdminUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<AdminUpdateUserPayload>({
    name: '',
    email: '',
    role: 'USER',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const userRes = await apiClient.admin.getUser(userId)
        setUser(userRes.data)
        setEditForm({
          name: userRes.data.name,
          email: userRes.data.email,
          role: userRes.data.role,
        })

        // Load user's orders
        try {
          const ordersRes = await apiClient.admin.listOrders({ limit: 50 })
          const userOrders = (ordersRes.data.data || []).filter((o: Order) => o.userId === userId)
          setOrders(userOrders)
        } catch {
          // No orders
        }

        // Load user's payments
        try {
          const paymentsRes = await apiClient.paymentsAdmin.getUserPayments(userId, { limit: 50 })
          setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : [])
        } catch {
          // No payments
        }
      } catch {
        setError('Failed to load user')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await apiClient.admin.updateUser(userId, editForm)
      setUser(res.data)
      setSuccess('User updated successfully!')
      setEditing(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.admin.deleteUser(userId)
      router.push('/admin/users')
    } catch {
      setError('Failed to delete user')
      setShowDeleteDialog(false)
    }
    setDeleting(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <EmptyState
        icon="alert"
        title="User not found"
        description="The user you are looking for does not exist."
        actionLabel="Back to Users"
        actionHref="/admin/users"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User className="w-6 h-6 text-neutral-500" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <p className="text-sm text-neutral-400">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="border-neutral-700 text-neutral-300"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-500"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* User Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">User Information</h3>
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value as 'USER' | 'ADMIN' | 'SUPERADMIN',
                      })
                    }
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-neutral-500" />
                  <div>
                    <span className="text-xs text-neutral-500">Name</span>
                    <p className="text-sm text-white">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <div>
                    <span className="text-xs text-neutral-500">Email</span>
                    <p className="text-sm text-white">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-neutral-500" />
                  <div>
                    <span className="text-xs text-neutral-500">Role</span>
                    <p className="text-sm text-white">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <div>
                    <span className="text-xs text-neutral-500">Member since</span>
                    <p className="text-sm text-white">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">
                  {user._count?.orders || orders.length}
                </div>
                <div className="text-xs text-neutral-500">Orders</div>
              </div>
              <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
                <CreditCard className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{user._count?.payments || 0}</div>
                <div className="text-xs text-neutral-500">Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      {orders.length > 0 && (
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors">
                    <div>
                      <span className="text-xs text-violet-400 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <p className="text-sm text-white mt-1">R$ {formatPrice(order.total)}</p>
                    </div>
                    <StatusBadge status={order.status} variant="order" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments */}
      {payments.length > 0 && (
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Payment History
            </h3>
            <div className="space-y-3">
              {payments.slice(0, 10).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
                >
                  <div>
                    <span className="text-xs text-neutral-500 font-mono">
                      #{payment.id.slice(0, 8).toUpperCase()}
                    </span>
                    <p className="text-sm text-white mt-1">R$ {formatPrice(payment.amount)}</p>
                    <p className="text-xs text-neutral-500">
                      {payment.provider} · {payment.method}
                    </p>
                  </div>
                  <StatusBadge status={payment.status} variant="payment" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete User"
        description={`Are you sure you want to delete ${user.name}? This action cannot be undone.`}
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deleting}
      />
    </div>
  )
}

export default function UserDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      }
    >
      <UserDetailContent />
    </Suspense>
  )
}
