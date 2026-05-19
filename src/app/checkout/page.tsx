'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle2,
  Shield,
  Package,
  Loader2,
  Copy,
  QrCode,
  AlertCircle,
  Clock,
  Tag,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/services/api'
import { formatPrice, extractApiError } from '@/lib/utils'
import type { Order, Payment } from '@/types/api'

const PIX_COPY_FEEDBACK_DURATION = 3000
const PAYMENT_POLL_INTERVAL = 5000

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items: cartItems, total, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [completed, setCompleted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pollingPayment, setPollingPayment] = useState(false)
  const [payerCpf, setPayerCpf] = useState('')
  const [payerBirthDate, setPayerBirthDate] = useState('')
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    type: string
    value: number
  } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null)

  // Countdown timer for PIX expiration (uses real expiresAt from backend)
  useEffect(() => {
    if (!payment?.expiresAt) return

    const expiresAt = new Date(payment.expiresAt).getTime()

    const updateTimer = () => {
      const remaining = expiresAt - Date.now()
      setTimeLeft(Math.max(0, remaining))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [payment?.expiresAt])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
    }
  }, [isAuthenticated, router])

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0 && !order) {
      router.push('/cart')
    }
  }, [cartItems.length, order, router])

  // Poll payment status
  useEffect(() => {
    if (!payment || completed || !pollingPayment) return

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.payments.getByOrder(payment.orderId)
        const updatedPayment = response.data
        if (updatedPayment.status === 'APPROVED') {
          setPayment(updatedPayment)
          setCompleted(true)
          setPollingPayment(false)
          clearCart()
        } else if (updatedPayment.status === 'REJECTED' || updatedPayment.status === 'CANCELLED') {
          setPayment(updatedPayment)
          setPollingPayment(false)
          setError('Payment was rejected. Please try again.')
        }
      } catch (err) {
        console.error('[Checkout] Payment polling error:', err)
      }
    }, PAYMENT_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [payment, completed, pollingPayment, clearCart])

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponError(null)
    setCouponSuccess(null)

    try {
      const response = await apiClient.coupons.validate({
        code: couponCode.toUpperCase().trim(),
        subtotal,
      })
      const result = response.data

      if (result.valid) {
        setAppliedCoupon({
          code: result.coupon.code,
          discountAmount: result.discountAmount,
          type: result.coupon.type,
          value: result.coupon.value,
        })
        setCouponSuccess(
          result.message || `Coupon applied! Discount: R$ ${formatPrice(result.discountAmount)}`,
        )
        setCouponCode('')
      } else {
        setCouponError(result.message || 'Invalid coupon')
      }
    } catch (err) {
      setCouponError(extractApiError(err, 'Failed to validate coupon'))
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
    setCouponSuccess(null)
  }

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) return

    setProcessing(true)
    setError(null)

    try {
      // 1. Create order
      const orderResponse = await apiClient.orders.create({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.code || undefined,
      })
      const createdOrder = orderResponse.data
      setOrder(createdOrder)

      // 2. Create PIX payment — always trust server-calculated total
      const paymentResponse = await apiClient.payments.create(createdOrder.id, {
        amount: Number(createdOrder.total),
        provider: 'ASAAS',
        method: 'PIX',
        payerCpf: payerCpf.replace(/\D/g, '') || undefined,
        payerBirthDate: payerBirthDate || undefined,
      })
      setPayment(paymentResponse.data)
      setPollingPayment(true)
    } catch (err) {
      setError(extractApiError(err, 'Failed to create order'))
    } finally {
      setProcessing(false)
    }
  }

  const handleCopyPixCode = async () => {
    const pixText = payment?.pixCode || payment?.pixCopyPaste || ''
    if (!pixText) return
    try {
      await navigator.clipboard.writeText(pixText)
      setCopied(true)
      setTimeout(() => setCopied(false), PIX_COPY_FEEDBACK_DURATION)
    } catch (err) {
      console.error('[Checkout] Failed to copy PIX code:', err)
    }
  }

  const subtotal = mounted
    ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : 0

  // --- Completed State ---
  if (completed && order) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <section className="relative pt-28 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-semibold text-white mb-4">Payment Confirmed!</h1>
              <p className="text-neutral-400 mb-8">Your digital keys will be delivered shortly.</p>

              <Card className="bg-neutral-900/50 border-neutral-800 mb-8">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Order ID</span>
                      <span className="text-white font-mono text-sm">
                        {order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    {order.couponCode && (
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Coupon</span>
                        <span className="text-emerald-400 font-mono text-sm">
                          {order.couponCode}
                        </span>
                      </div>
                    )}
                    {order.discount && order.discount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Discount</span>
                        <span className="text-emerald-400">- R$ {formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Delivery Method</span>
                      <span className="text-emerald-400">Email + Dashboard</span>
                    </div>
                    <div className="border-t border-neutral-800 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Total Paid</span>
                        <span className="text-2xl font-bold text-white">
                          R$ {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-neutral-950 hover:bg-neutral-200 h-12"
                >
                  <Link href="/dashboard">View in Dashboard</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-neutral-700 hover:bg-neutral-800 h-12 text-neutral-300"
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  // --- PIX Payment Pending State ---
  if (payment && !completed) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <section className="relative pt-28 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-500/30">
                <QrCode className="w-12 h-12 text-violet-400" />
              </div>
              <h1 className="text-3xl font-semibold text-white mb-2">Pay with PIX</h1>
              <p className="text-neutral-400 mb-8">Scan the QR code or copy the PIX code below</p>

              {/* Countdown Timer */}
              {timeLeft !== null && timeLeft > 0 && (
                <div className="mb-6 inline-flex items-center gap-2 bg-neutral-900/80 border border-neutral-700 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-neutral-300">
                    Expires in{' '}
                    <span className="text-white font-mono font-medium">
                      {formatCountdown(timeLeft)}
                    </span>
                  </span>
                </div>
              )}
              {timeLeft !== null && timeLeft === 0 && (
                <div className="mb-6 inline-flex items-center gap-2 bg-red-900/20 border border-red-800 rounded-full px-4 py-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">PIX code expired</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Card className="bg-neutral-900/50 border-neutral-800 mb-6">
                <CardContent className="p-8">
                  {/* QR Code */}
                  {payment.pixQrCode && (
                    <div className="mb-6">
                      <div className="bg-white p-4 rounded-xl inline-block mb-4">
                        <Image src={payment.pixQrCode} alt="PIX QR Code" width={192} height={192} />
                      </div>
                    </div>
                  )}

                  {/* PIX Copy-Paste */}
                  {(payment.pixCode || payment.pixCopyPaste) && (
                    <div className="space-y-3">
                      <p className="text-sm text-neutral-400">Or copy the PIX code:</p>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-left">
                          <p className="text-xs text-neutral-300 font-mono break-all line-clamp-2">
                            {payment.pixCode || payment.pixCopyPaste}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-neutral-700 hover:bg-neutral-800 flex-shrink-0"
                          onClick={handleCopyPixCode}
                        >
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="mt-6 pt-6 border-t border-neutral-800">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Amount</span>
                      <span className="text-2xl font-bold text-white">
                        R$ {formatPrice(payment.amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-3 text-neutral-400 mb-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Waiting for payment confirmation...</span>
              </div>

              <p className="text-xs text-neutral-500">
                The page will update automatically once payment is confirmed
              </p>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  // --- Checkout Form (Pre-payment) ---
  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Header */}
      <section className="relative pt-28 pb-12 bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">Checkout</h1>
            <p className="text-neutral-400">Complete your purchase with PIX</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-neutral-900/50 border-neutral-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>

                    <div className="p-4 rounded-lg border-2 border-violet-500 bg-violet-500/10">
                      <div className="flex items-center gap-3 mb-2">
                        <QrCode className="w-5 h-5 text-violet-400" />
                        <span className="text-white font-medium">PIX (ASAAS)</span>
                      </div>
                      <span className="text-xs text-neutral-400">
                        Instant payment — your keys will be delivered immediately after confirmation
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <Shield className="w-6 h-6 text-emerald-500" />
                  <div>
                    <div className="font-medium text-emerald-400">Secure Checkout</div>
                    <div className="text-sm text-emerald-400/80">
                      All transactions are encrypted and secure
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <Card className="bg-neutral-900/50 border-neutral-800 sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-neutral-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-violet-400 mb-1">{item.platform}</div>
                          <h4 className="text-sm text-white font-medium line-clamp-2">
                            {item.name}
                          </h4>
                          <div className="text-xs text-neutral-500 mt-1">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">
                            R$ {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payer Info */}
                  <div className="border-t border-neutral-800 pt-4 mb-6 space-y-3">
                    <h4 className="text-sm font-medium text-white">Payer Information</h4>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">CPF</label>
                      <input
                        type="text"
                        value={payerCpf}
                        onChange={(e) => setPayerCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Birth Date</label>
                      <input
                        type="date"
                        value={payerBirthDate}
                        onChange={(e) => setPayerBirthDate(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="border-t border-neutral-800 pt-4 mb-6">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-violet-400" />
                      Coupon
                    </h4>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-emerald-400 font-mono">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-xs text-neutral-400">
                            (
                            {appliedCoupon.type === 'PERCENTAGE'
                              ? `${appliedCoupon.value}%`
                              : `R$ ${formatPrice(appliedCoupon.value)}`}
                            )
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase())
                            setCouponError(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleValidateCoupon()
                          }}
                          placeholder="Enter code"
                          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none font-mono uppercase"
                          disabled={validatingCoupon}
                        />
                        <Button
                          size="sm"
                          onClick={handleValidateCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="bg-violet-600 hover:bg-violet-500 flex-shrink-0"
                        >
                          {validatingCoupon ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {couponError}
                      </p>
                    )}
                    {couponSuccess && !appliedCoupon && (
                      <p className="text-xs text-emerald-400 mt-2">{couponSuccess}</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal</span>
                      <span>R$ {formatPrice(subtotal)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>- R$ {formatPrice(appliedCoupon.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-400">
                      <span>Delivery</span>
                      <span className="text-emerald-400">Free</span>
                    </div>
                    <div className="border-t border-neutral-800 pt-3 flex justify-between">
                      <span className="font-semibold text-white">Total</span>
                      <span className="text-2xl font-bold text-white">
                        R${' '}
                        {mounted
                          ? formatPrice(
                              appliedCoupon ? subtotal - appliedCoupon.discountAmount : total,
                            )
                          : '0.00'}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateOrder}
                    disabled={processing || cartItems.length === 0}
                    className="w-full bg-white text-neutral-950 hover:bg-neutral-200 h-12 font-semibold"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating order...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Pay with PIX
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-500">
                    <Shield className="w-3 h-3" />
                    <span>Encrypted Payment via ASAAS</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
