'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function CheckoutPage() {
    const router = useRouter()
    const { items: cartItems, total, clearCart } = useCart()
    const { isAuthenticated } = useAuth()

    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [order, setOrder] = useState<Order | null>(null)
    const [payment, setPayment] = useState<Payment | null>(null)
    const [completed, setCompleted] = useState(false)
    const [copied, setCopied] = useState(false)
    const [pollingPayment, setPollingPayment] = useState(false)
    const [payerCpf, setPayerCpf] = useState('')
    const [payerBirthDate, setPayerBirthDate] = useState('')

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
            } catch {
                // continue polling
            }
        }, 5000) // Poll every 5 seconds

        return () => clearInterval(interval)
    }, [payment, completed, pollingPayment, clearCart])

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
            })
            const createdOrder = orderResponse.data
            setOrder(createdOrder)

            // 2. Create PIX payment
            const paymentResponse = await apiClient.payments.create(createdOrder.id, {
                amount: Number(createdOrder.total),
                provider: 'MERCADO_PAGO',
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
        const pixText = payment?.pixCode || payment?.pixQrCode || ''
        if (!pixText) return
        try {
            await navigator.clipboard.writeText(pixText)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        } catch {
            // fallback
        }
    }

    const subtotal = mounted ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0

    // --- Completed State ---
    if (completed && order) {
        return (
            <div className='min-h-screen bg-neutral-950'>
                <Header />
                <section className='relative pt-28 pb-16'>
                    <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className='text-center'
                        >
                            <div className='w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30'>
                                <CheckCircle2 className='w-12 h-12 text-emerald-500' />
                            </div>
                            <h1 className='text-3xl font-semibold text-white mb-4'>
                                Payment Confirmed!
                            </h1>
                            <p className='text-neutral-400 mb-8'>
                                Your digital keys will be delivered shortly.
                            </p>

                            <Card className='bg-neutral-900/50 border-neutral-800 mb-8'>
                                <CardContent className='p-6'>
                                    <div className='space-y-4'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-neutral-400'>Order ID</span>
                                            <span className='text-white font-mono text-sm'>{order.id.slice(0, 8).toUpperCase()}</span>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-neutral-400'>Delivery Method</span>
                                            <span className='text-emerald-400'>Email + Dashboard</span>
                                        </div>
                                        <div className='border-t border-neutral-800 pt-4'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-neutral-400'>Total Paid</span>
                                                <span className='text-2xl font-bold text-white'>R$ {formatPrice(order.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                                <Button asChild size='lg' className='bg-white text-neutral-950 hover:bg-neutral-200 h-12'>
                                    <Link href='/dashboard'>View in Dashboard</Link>
                                </Button>
                                <Button asChild
                                    size='lg'
                                    variant='outline'
                                    className='border-neutral-700 hover:bg-neutral-800 h-12 text-neutral-300'
                                >
                                    <Link href='/products'>Continue Shopping</Link>
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
            <div className='min-h-screen bg-neutral-950'>
                <Header />
                <section className='relative pt-28 pb-16'>
                    <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className='text-center'
                        >
                            <div className='w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-500/30'>
                                <QrCode className='w-12 h-12 text-violet-400' />
                            </div>
                            <h1 className='text-3xl font-semibold text-white mb-2'>
                                Pay with PIX
                            </h1>
                            <p className='text-neutral-400 mb-8'>
                                Scan the QR code or copy the PIX code below
                            </p>

                            {error && (
                                <div className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-6 flex items-center gap-3'>
                                    <AlertCircle className='w-5 h-5 flex-shrink-0' />
                                    {error}
                                </div>
                            )}

                            <Card className='bg-neutral-900/50 border-neutral-800 mb-6'>
                                <CardContent className='p-8'>
                                    {/* QR Code */}
                                    {payment.pixQrCode && (
                                        <div className='mb-6'>
                                            <div className='bg-white p-4 rounded-xl inline-block mb-4'>
                                                <img
                                                    src={`data:image/png;base64,${payment.pixQrCode}`}
                                                    alt='PIX QR Code'
                                                    className='w-48 h-48'
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* PIX Copy-Paste */}
                                    {(payment.pixCode || payment.pixQrCode) && (
                                        <div className='space-y-3'>
                                            <p className='text-sm text-neutral-400'>Or copy the PIX code:</p>
                                            <div className='flex gap-2'>
                                                <div className='flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-left'>
                                                    <p className='text-xs text-neutral-300 font-mono break-all line-clamp-2'>
                                                        {payment.pixCode || payment.pixQrCode}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant='outline'
                                                    className='border-neutral-700 hover:bg-neutral-800 flex-shrink-0'
                                                    onClick={handleCopyPixCode}
                                                >
                                                    {copied ? (
                                                        <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                                                    ) : (
                                                        <Copy className='w-4 h-4' />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Amount */}
                                    <div className='mt-6 pt-6 border-t border-neutral-800'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-neutral-400'>Amount</span>
                                            <span className='text-2xl font-bold text-white'>
                                                R$ {formatPrice(payment.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Waiting indicator */}
                            <div className='flex items-center justify-center gap-3 text-neutral-400 mb-4'>
                                <Loader2 className='w-5 h-5 animate-spin' />
                                <span>Waiting for payment confirmation...</span>
                            </div>

                            <p className='text-xs text-neutral-500'>
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
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Header */}
            <section className='relative pt-28 pb-12 bg-neutral-900 border-b border-neutral-800'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='text-center'
                    >
                        <h1 className='text-3xl md:text-4xl font-semibold text-white mb-2'>
                            Checkout
                        </h1>
                        <p className='text-neutral-400'>Complete your purchase with PIX</p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid lg:grid-cols-3 gap-8'>
                        {/* Payment Info */}
                        <div className='lg:col-span-2 space-y-6'>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className='bg-neutral-900/50 border-neutral-800'>
                                    <CardContent className='p-6'>
                                        <h3 className='text-lg font-semibold text-white mb-4'>
                                            Payment Method
                                        </h3>

                                        <div className='p-4 rounded-lg border-2 border-violet-500 bg-violet-500/10'>
                                            <div className='flex items-center gap-3 mb-2'>
                                                <QrCode className='w-5 h-5 text-violet-400' />
                                                <span className='text-white font-medium'>PIX (Mercado Pago)</span>
                                            </div>
                                            <span className='text-xs text-neutral-400'>
                                                Instant payment — your keys will be delivered immediately after confirmation
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {error && (
                                <div className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-3'>
                                    <AlertCircle className='w-5 h-5 flex-shrink-0' />
                                    {error}
                                </div>
                            )}

                            {/* Security Notice */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className='flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30'>
                                    <Shield className='w-6 h-6 text-emerald-500' />
                                    <div>
                                        <div className='font-medium text-emerald-400'>Secure Checkout</div>
                                        <div className='text-sm text-emerald-400/80'>All transactions are encrypted and secure</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className='lg:col-span-1'
                        >
                            <Card className='bg-neutral-900/50 border-neutral-800 sticky top-24'>
                                <CardContent className='p-6'>
                                    <h3 className='text-lg font-semibold text-white mb-4'>
                                        Order Summary
                                    </h3>

                                    {/* Items */}
                                    <div className='space-y-4 mb-6'>
                                        {cartItems.map((item) => (
                                            <div key={item.id} className='flex gap-4'>
                                                <div className='w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0'>
                                                    <Package className='w-8 h-8 text-neutral-600' />
                                                </div>
                                                <div className='flex-1'>
                                                    <div className='text-xs text-violet-400 mb-1'>{item.platform}</div>
                                                    <h4 className='text-sm text-white font-medium line-clamp-2'>{item.name}</h4>
                                                    <div className='text-xs text-neutral-500 mt-1'>Qty: {item.quantity}</div>
                                                </div>
                                                <div className='text-right'>
                                                    <div className='text-white font-medium'>R$ {formatPrice(item.price * item.quantity)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Payer Info */}
                                    <div className='border-t border-neutral-800 pt-4 mb-6 space-y-3'>
                                        <h4 className='text-sm font-medium text-white'>Payer Information</h4>
                                        <div>
                                            <label className='block text-xs text-neutral-500 mb-1'>CPF</label>
                                            <input
                                                type='text'
                                                value={payerCpf}
                                                onChange={(e) => setPayerCpf(e.target.value)}
                                                placeholder='000.000.000-00'
                                                maxLength={14}
                                                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-xs text-neutral-500 mb-1'>Birth Date</label>
                                            <input
                                                type='date'
                                                value={payerBirthDate}
                                                onChange={(e) => setPayerBirthDate(e.target.value)}
                                                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none'
                                            />
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className='space-y-3 mb-6'>
                                        <div className='flex justify-between text-neutral-400'>
                                            <span>Subtotal</span>
                                            <span>R$ {formatPrice(subtotal)}</span>
                                        </div>
                                        <div className='flex justify-between text-neutral-400'>
                                            <span>Delivery</span>
                                            <span className='text-emerald-400'>Free</span>
                                        </div>
                                        <div className='border-t border-neutral-800 pt-3 flex justify-between'>
                                            <span className='font-semibold text-white'>Total</span>
                                            <span className='text-2xl font-bold text-white'>R$ {mounted ? formatPrice(total) : '0.00'}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleCreateOrder}
                                        disabled={processing || cartItems.length === 0}
                                        className='w-full bg-white text-neutral-950 hover:bg-neutral-200 h-12 font-semibold'
                                    >
                                        {processing ? (
                                            <span className='flex items-center gap-2'>
                                                <Loader2 className='w-4 h-4 animate-spin' />
                                                Creating order...
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-2'>
                                                <QrCode className='w-4 h-4' />
                                                Pay with PIX
                                            </span>
                                        )}
                                    </Button>

                                    <div className='flex items-center justify-center gap-2 mt-4 text-xs text-neutral-500'>
                                        <Shield className='w-3 h-3' />
                                        <span>Encrypted Payment via Mercado Pago</span>
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