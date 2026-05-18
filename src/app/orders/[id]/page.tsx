'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Download,
  Copy,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Clock,
  Package,
  AlertCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/hooks/use-auth'
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

function OrderDetailContent() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [keys, setKeys] = useState<DeliveredKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (!isAuthenticated || !orderId) return

    async function loadData() {
      setIsLoading(true)
      try {
        const orderRes = await apiClient.orders.getById(orderId)
        setOrder(orderRes.data)

        // Try to fetch payment
        try {
          const paymentRes = await apiClient.payments.getByOrder(orderId)
          setPayment(paymentRes.data)
        } catch {
          // No payment found
        }
      } catch {
        // Order not found
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, orderId])

  const handleDownloadKeys = async () => {
    if (!orderId) return
    setLoadingKeys(true)
    try {
      const response = await apiClient.orders.downloadKeys(orderId)
      setKeys(response.data?.keys || [])
    } catch {
      // Failed to download keys
    } finally {
      setLoadingKeys(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), CLIPBOARD_FEEDBACK_DURATION)
  }

  const handleCancelOrder = async () => {
    if (!orderId) return
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await apiClient.orders.cancel(orderId)
      setOrder(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
    } catch {
      alert('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className='min-h-screen bg-neutral-950'>
        <Header />
        <div className='flex justify-center items-center py-32'>
          <Loader2 className='w-12 h-12 text-violet-400 animate-spin' />
        </div>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className='min-h-screen bg-neutral-950'>
        <Header />
        <EmptyState
          icon='alert'
          title='Order not found'
          description='The order you are looking for does not exist.'
          actionLabel='Back to Orders'
          actionHref='/orders'
        />
        <Footer />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      {/* Breadcrumb */}
      <div className='pt-24 pb-4 bg-neutral-950'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <nav className='flex items-center gap-2 text-sm'>
            <Link href='/' className='text-neutral-500 hover:text-neutral-300 transition-colors'>
              Home
            </Link>
            <ChevronRight className='w-4 h-4 text-neutral-600' />
            <Link href='/orders' className='text-neutral-500 hover:text-neutral-300 transition-colors'>
              My Orders
            </Link>
            <ChevronRight className='w-4 h-4 text-neutral-600' />
            <span className='text-neutral-300'>#{order.id.slice(0, 8).toUpperCase()}</span>
          </nav>
        </div>
      </div>

      <section className='py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Back button */}
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='text-neutral-400 hover:text-white mb-6'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Orders
          </Button>

          {/* Order Header */}
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
            <div>
              <h1 className='text-2xl font-semibold text-white mb-2'>
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className='text-neutral-400 text-sm'>
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <StatusBadge status={order.status} variant='order' size='md' />
          </div>

          {/* Order Items */}
          <Card className='bg-neutral-900/50 border-neutral-800 mb-6'>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Package className='w-5 h-5 text-violet-400' />
                Items
              </h2>
              <div className='space-y-4'>
                {order.items?.map((item) => (
                  <div key={item.id} className='flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg'>
                    <div className='flex-1'>
                      <div className='text-xs text-violet-400 mb-1'>
                        {item.product?.category?.name || 'Digital'}
                      </div>
                      <div className='font-medium text-white'>
                        {item.product?.name || 'Product'}
                      </div>
                      <div className='text-xs text-neutral-500 mt-1'>
                        Qty: {item.quantity} × R$ {formatPrice(item.price)}
                      </div>
                    </div>
                    <div className='text-lg font-semibold text-white'>
                      R$ {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className='mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between'>
                <span className='text-neutral-400'>Total</span>
                <span className='text-2xl font-bold text-white'>
                  R$ {formatPrice(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {payment && (
            <Card className='bg-neutral-900/50 border-neutral-800 mb-6'>
              <CardContent className='p-6'>
                <h2 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                  <CreditCard className='w-5 h-5 text-emerald-400' />
                  Payment
                </h2>

                <div className='grid sm:grid-cols-2 gap-4 mb-4'>
                  <div>
                    <span className='text-xs text-neutral-500'>Status</span>
                    <div className='mt-1'>
                      <StatusBadge status={payment.status} variant='payment' size='md' />
                    </div>
                  </div>
                  <div>
                    <span className='text-xs text-neutral-500'>Provider</span>
                    <div className='mt-1 text-white font-medium'>{payment.provider}</div>
                  </div>
                  <div>
                    <span className='text-xs text-neutral-500'>Method</span>
                    <div className='mt-1 text-white font-medium'>{payment.method}</div>
                  </div>
                  <div>
                    <span className='text-xs text-neutral-500'>Amount</span>
                    <div className='mt-1 text-white font-medium'>R$ {formatPrice(payment.amount)}</div>
                  </div>
                </div>

                {/* PIX Payment Details */}
                {payment.method === 'PIX' && payment.status === 'PENDING' && payment.pixQrCode && (
                  <div className='mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
                    <div className='flex items-center gap-2 mb-3'>
                      <Clock className='w-4 h-4 text-amber-400' />
                      <span className='text-sm font-medium text-amber-400'>Payment Pending</span>
                    </div>
                    {payment.pixQrCode && (
                      <div className='bg-white p-4 rounded-lg inline-block mb-3'>
                        {/* QR Code placeholder - in production, use a QR code library */}
                        <div className='w-48 h-48 bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs text-center'>
                          QR Code
                        </div>
                      </div>
                    )}
                    {payment.pixCopyPaste && (
                      <div className='mt-3'>
                        <label className='text-xs text-neutral-400 mb-1 block'>PIX Copy & Paste</label>
                        <div className='flex items-center gap-2'>
                          <code className='flex-1 bg-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono truncate'>
                            {payment.pixCopyPaste}
                          </code>
                          <Button
                            size='sm'
                            variant='outline'
                            className='border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex-shrink-0'
                            onClick={() => copyToClipboard(payment.pixCopyPaste!, 'pix')}
                          >
                            {copiedKey === 'pix' ? (
                              <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                            ) : (
                              <Copy className='w-4 h-4' />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {payment.expiresAt && (
                      <p className='text-xs text-neutral-500 mt-2'>
                        Expires: {formatDate(payment.expiresAt)}
                      </p>
                    )}
                  </div>
                )}

                {payment.status === 'APPROVED' && (
                  <div className='mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-emerald-400 flex-shrink-0' />
                    <div>
                      <p className='text-sm font-medium text-emerald-400'>Payment Approved</p>
                      <p className='text-xs text-neutral-400'>Your payment has been confirmed.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Keys Section */}
          {order.status === 'DELIVERED' && (
            <Card className='bg-neutral-900/50 border-neutral-800 mb-6'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold text-white flex items-center gap-2'>
                    <Download className='w-5 h-5 text-sky-400' />
                    Digital Keys
                  </h2>
                  {!keys.length && (
                    <Button
                      size='sm'
                      onClick={handleDownloadKeys}
                      disabled={loadingKeys}
                      className='bg-violet-600 hover:bg-violet-500'
                    >
                      {loadingKeys ? (
                        <Loader2 className='w-4 h-4 animate-spin mr-2' />
                      ) : (
                        <Download className='w-4 h-4 mr-2' />
                      )}
                      Load Keys
                    </Button>
                  )}
                </div>

                {keys.length > 0 ? (
                  <div className='space-y-3'>
                    {keys.map((key) => (
                      <div key={key.keyId} className='p-4 bg-neutral-800/50 rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                          <span className='text-xs text-violet-400'>{key.productName}</span>
                          <span className='text-xs text-neutral-500'>{formatDate(key.deliveredAt)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <code className='flex-1 bg-neutral-900 rounded-lg px-3 py-2 text-sm text-white font-mono'>
                            {key.decryptedKey}
                          </code>
                          <Button
                            size='sm'
                            variant='outline'
                            className='border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex-shrink-0'
                            onClick={() => copyToClipboard(key.decryptedKey, key.keyId)}
                          >
                            {copiedKey === key.keyId ? (
                              <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                            ) : (
                              <Copy className='w-4 h-4' />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : loadingKeys ? (
                  <div className='flex justify-center py-8'>
                    <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Awaiting Payment Warning */}
          {order.status === 'AWAITING_PAYMENT' && !payment && (
            <Card className='bg-amber-500/5 border-amber-500/20 mb-6'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-3'>
                  <AlertCircle className='w-6 h-6 text-amber-400 flex-shrink-0' />
                  <div>
                    <h3 className='text-sm font-medium text-amber-400'>Payment Pending</h3>
                    <p className='text-xs text-neutral-400 mt-1'>
                      Complete your payment to receive your digital keys.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancel Order */}
          {(order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT') && (
            <div className='flex justify-end'>
              <Button
                variant='outline'
                onClick={handleCancelOrder}
                disabled={cancelling}
                className='border-red-500/30 text-red-400 hover:bg-red-500/10'
              >
                {cancelling ? (
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                ) : (
                  <X className='w-4 h-4 mr-2' />
                )}
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-neutral-950'>
        <Header />
        <div className='flex justify-center items-center py-32'>
          <Loader2 className='w-12 h-12 text-violet-400 animate-spin' />
        </div>
        <Footer />
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  )
}
