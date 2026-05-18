'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  Download,
  Copy,
  CheckCircle2,
  CreditCard,
  Package,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { apiClient } from '@/services/api'
import { formatPrice } from '@/lib/utils'
import type { Order, DeliveredKey, Payment } from '@/types/api'

const CLIPBOARD_FEEDBACK_DURATION = 2000

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AdminOrderDetailContent() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [keys, setKeys] = useState<DeliveredKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const orderRes = await apiClient.orders.getById(orderId)
        setOrder(orderRes.data)

        try {
          const paymentRes = await apiClient.payments.getByOrder(orderId)
          setPayment(paymentRes.data)
        } catch {
          // No payment
        }
      } catch {
        // Order not found
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [orderId])

  const handleDownloadKeys = async () => {
    setLoadingKeys(true)
    try {
      const response = await apiClient.orders.downloadKeys(orderId)
      setKeys(response.data?.keys || [])
    } catch {
      // Failed
    } finally {
      setLoadingKeys(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), CLIPBOARD_FEEDBACK_DURATION)
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      await apiClient.admin.updateOrderStatus(orderId, newStatus)
      const res = await apiClient.orders.getById(orderId)
      setOrder(res.data)
    } catch {
      alert('Failed to update status')
    }
    setUpdatingStatus(false)
  }

  if (isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
      </div>
    )
  }

  if (!order) {
    return (
      <EmptyState
        icon='alert'
        title='Order not found'
        description='The order you are looking for does not exist.'
        actionLabel='Back to Orders'
        actionHref='/admin/orders'
      />
    )
  }

  const statusOptions = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'REFUNDED']

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={() => router.back()} className='text-neutral-400 hover:text-white'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
          <div>
            <h2 className='text-xl font-semibold text-white'>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className='text-sm text-neutral-400'>
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <StatusBadge status={order.status} variant='order' size='md' />
          <select
            value=''
            onChange={(e) => { if (e.target.value) handleStatusChange(e.target.value) }}
            disabled={updatingStatus}
            className='bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white'
          >
            <option value=''>Update Status</option>
            {statusOptions.filter(s => s !== order.status).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Info */}
      {order.user && (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-5'>
            <h3 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
              <User className='w-4 h-4 text-violet-400' />
              Customer
            </h3>
            <div className='grid sm:grid-cols-3 gap-4'>
              <div>
                <span className='text-xs text-neutral-500'>Name</span>
                <p className='text-sm text-white'>{order.user.name}</p>
              </div>
              <div>
                <span className='text-xs text-neutral-500'>Email</span>
                <p className='text-sm text-white'>{order.user.email}</p>
              </div>
              <div>
                <span className='text-xs text-neutral-500'>User ID</span>
                <p className='text-sm text-white font-mono'>{order.user.id.slice(0, 8)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card className='bg-neutral-900/50 border-neutral-800'>
        <CardContent className='p-5'>
          <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
            <Package className='w-4 h-4 text-violet-400' />
            Items
          </h3>
          <div className='space-y-3'>
            {order.items?.map((item) => (
              <div key={item.id} className='flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg'>
                <div>
                  <span className='text-xs text-violet-400'>{item.product?.category?.name || 'Digital'}</span>
                  <p className='text-sm text-white'>{item.product?.name || 'Product'}</p>
                  <p className='text-xs text-neutral-500'>Qty: {item.quantity} × R$ {formatPrice(item.price)}</p>
                </div>
                <span className='text-sm font-semibold text-white'>R$ {formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className='mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between'>
            <span className='text-neutral-400'>Total</span>
            <span className='text-xl font-bold text-white'>R$ {formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      {payment && (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-5'>
            <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
              <CreditCard className='w-4 h-4 text-emerald-400' />
              Payment
            </h3>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div>
                <span className='text-xs text-neutral-500'>Status</span>
                <div className='mt-1'><StatusBadge status={payment.status} variant='payment' /></div>
              </div>
              <div>
                <span className='text-xs text-neutral-500'>Provider</span>
                <p className='text-sm text-white'>{payment.provider}</p>
              </div>
              <div>
                <span className='text-xs text-neutral-500'>Amount</span>
                <p className='text-sm text-white'>R$ {formatPrice(payment.amount)}</p>
              </div>
              <div>
                <span className='text-xs text-neutral-500'>Created</span>
                <p className='text-sm text-white'>{formatDate(payment.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys */}
      {order.status === 'DELIVERED' && (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-sm font-semibold text-white flex items-center gap-2'>
                <Download className='w-4 h-4 text-sky-400' />
                Digital Keys
              </h3>
              {!keys.length && (
                <Button size='sm' onClick={handleDownloadKeys} disabled={loadingKeys} className='bg-violet-600 hover:bg-violet-500'>
                  {loadingKeys ? <Loader2 className='w-4 h-4 animate-spin mr-2' /> : <Download className='w-4 h-4 mr-2' />}
                  Load Keys
                </Button>
              )}
            </div>
            {keys.length > 0 && (
              <div className='space-y-2'>
                {keys.map((key) => (
                  <div key={key.keyId} className='flex items-center gap-2 p-3 bg-neutral-800/50 rounded-lg'>
                    <span className='text-xs text-violet-400 flex-shrink-0'>{key.productName}</span>
                    <code className='flex-1 text-sm text-white font-mono truncate'>{key.decryptedKey}</code>
                    <Button size='sm' variant='outline' className='border-neutral-700 text-neutral-300 flex-shrink-0' onClick={() => copyToClipboard(key.decryptedKey, key.keyId)}>
                      {copiedKey === key.keyId ? <CheckCircle2 className='w-4 h-4 text-emerald-400' /> : <Copy className='w-4 h-4' />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense fallback={
      <div className='flex justify-center py-16'>
        <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
      </div>
    }>
      <AdminOrderDetailContent />
    </Suspense>
  )
}
