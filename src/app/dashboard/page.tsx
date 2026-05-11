'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Package,
    CreditCard,
    Download,
    Copy,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/services/api'
import type { Order, OrderStatus } from '@/types/api'

function getStatusConfig(status: OrderStatus) {
    switch (status) {
        case 'DELIVERED':
            return { label: 'Delivered', className: 'border-emerald-500 text-emerald-400' }
        case 'PAID':
            return { label: 'Paid', className: 'border-emerald-500 text-emerald-400' }
        case 'PROCESSING':
            return { label: 'Processing', className: 'border-amber-500 text-amber-400' }
        case 'AWAITING_PAYMENT':
            return { label: 'Awaiting Payment', className: 'border-amber-500 text-amber-400' }
        case 'PENDING':
            return { label: 'Pending', className: 'border-neutral-500 text-neutral-400' }
        case 'CANCELLED':
            return { label: 'Cancelled', className: 'border-red-500 text-red-400' }
        case 'REFUNDED':
            return { label: 'Refunded', className: 'border-blue-500 text-blue-400' }
        default:
            return { label: status, className: 'border-neutral-500 text-neutral-400' }
    }
}

export default function DashboardPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const [orderKeys, setOrderKeys] = useState<Record<string, { productName: string; key: string }[]>>({})
    const [loadingKeys, setLoadingKeys] = useState<string | null>(null)

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/dashboard')
        }
    }, [isAuthenticated, authLoading, router])

    // Fetch orders
    useEffect(() => {
        if (!isAuthenticated) return

        async function loadOrders() {
            try {
                setIsLoading(true)
                const response = await apiClient.orders.list({ limit: 20 })
                const data = response.data
                if (Array.isArray(data)) {
                    setOrders(data)
                } else {
                    setOrders(data.data || [])
                }
            } catch {
                // keep empty
            } finally {
                setIsLoading(false)
            }
        }
        loadOrders()
    }, [isAuthenticated])

    const handleDownloadKeys = async (orderId: string) => {
        if (orderKeys[orderId]) return // Already loaded
        setLoadingKeys(orderId)
        try {
            const response = await apiClient.orders.downloadKeys(orderId)
            setOrderKeys((prev) => ({ ...prev, [orderId]: response.data }))
        } catch {
            // show error inline
        } finally {
            setLoadingKeys(null)
        }
    }

    const copyToClipboard = (key: string, itemId: string) => {
        navigator.clipboard.writeText(key)
        setCopiedKey(itemId)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const handleToggleOrder = async (orderId: string) => {
        if (selectedOrder === orderId) {
            setSelectedOrder(null)
        } else {
            setSelectedOrder(orderId)
            // Auto-load keys for delivered orders
            const order = orders.find((o) => o.id === orderId)
            if (order && order.status === 'DELIVERED') {
                await handleDownloadKeys(orderId)
            }
        }
    }

    const stats = [
        { label: 'Total Orders', value: String(orders.length), icon: Package },
        {
            label: 'Total Spent',
            value: `R$ ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}`,
            icon: CreditCard,
        },
        {
            label: 'Delivered',
            value: String(orders.filter((o) => o.status === 'DELIVERED').length),
            icon: CheckCircle2,
        },
    ]

    if (authLoading) {
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

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Hero Section */}
            <section className='relative pt-24 pb-12 bg-neutral-900'>
                <div className='absolute inset-0'>
                    <div className='absolute top-20 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
                </div>

                <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className='text-4xl md:text-5xl font-semibold text-white mb-2'>
                            Welcome back, {user?.name || 'User'}!
                        </h1>
                        <p className='text-neutral-400 text-lg'>
                            Manage your orders and access your digital products
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Dashboard Content */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    {/* Stats */}
                    <div className='grid md:grid-cols-3 gap-6 mb-12'>
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className='bg-neutral-900/50 border-neutral-800'>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center gap-4'>
                                            <div className='w-12 h-12 bg-violet-600/20 rounded-lg flex items-center justify-center'>
                                                <stat.icon className='w-6 h-6 text-violet-400' />
                                            </div>
                                            <div>
                                                <div className='text-2xl font-bold text-white'>{stat.value}</div>
                                                <div className='text-sm text-neutral-400'>{stat.label}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className='grid md:grid-cols-2 gap-6 mb-12'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className='bg-neutral-900/50 border-neutral-800'>
                                <CardContent className='p-6'>
                                    <h3 className='text-lg font-semibold text-white mb-2'>
                                        Need Help?
                                    </h3>
                                    <p className='text-neutral-400 mb-4'>
                                        Our support team is available 24/7 to assist you
                                    </p>
                                    <Button className='bg-white text-neutral-950 hover:bg-neutral-200'>
                                        <a href='/contact'>Contact Support</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className='bg-neutral-900/50 border-neutral-800'>
                                <CardContent className='p-6'>
                                    <h3 className='text-lg font-semibold text-white mb-2'>
                                        Continue Shopping
                                    </h3>
                                    <p className='text-neutral-400 mb-4'>
                                        Explore our extensive collection of digital products
                                    </p>
                                    <Button variant='outline' className='border-neutral-700 hover:bg-neutral-800'>
                                        <Link href='/products'>Browse Products</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Orders */}
                    <div>
                        <h2 className='text-2xl font-semibold text-white mb-6'>
                            Recent Orders
                        </h2>

                        {isLoading ? (
                            <div className='flex justify-center py-12'>
                                <Loader2 className='w-10 h-10 text-violet-400 animate-spin' />
                            </div>
                        ) : orders.length === 0 ? (
                            <Card className='bg-neutral-900/50 border-neutral-800'>
                                <CardContent className='p-12 text-center'>
                                    <Package className='w-16 h-16 text-neutral-600 mx-auto mb-4' />
                                    <h3 className='text-xl font-medium text-white mb-2'>No orders yet</h3>
                                    <p className='text-neutral-400 mb-6'>Start shopping to see your orders here</p>
                                    <Button className='bg-white text-neutral-950 hover:bg-neutral-200'>
                                        <Link href='/products'>Browse Products</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className='space-y-4'>
                                {orders.map((order, index) => {
                                    const statusConfig = getStatusConfig(order.status)
                                    return (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className='bg-neutral-900/50 border-neutral-800 overflow-hidden'>
                                                <div
                                                    className='p-6 cursor-pointer'
                                                    onClick={() => handleToggleOrder(order.id)}
                                                >
                                                    <div className='flex items-center justify-between'>
                                                        <div className='flex items-center gap-6'>
                                                            <div>
                                                                <div className='font-mono text-sm text-violet-400 mb-1'>
                                                                    {order.id.slice(0, 8).toUpperCase()}
                                                                </div>
                                                                <div className='text-xs text-neutral-400'>
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <Badge variant='outline' className={statusConfig.className}>
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </div>
                                                        <div className='text-right'>
                                                            <div className='text-xl font-bold text-white'>
                                                                R$ {order.totalAmount.toFixed(2)}
                                                            </div>
                                                            <div className='text-sm text-neutral-400'>
                                                                {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Details */}
                                                {selectedOrder === order.id && (
                                                    <div className='border-t border-neutral-800 p-6'>
                                                        <div className='space-y-4'>
                                                            {/* Order items */}
                                                            {order.items?.map((item, itemIndex) => (
                                                                <div
                                                                    key={item.id}
                                                                    className='flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg'
                                                                >
                                                                    <div className='flex-1'>
                                                                        <div className='text-xs text-violet-400 mb-1'>
                                                                            {item.product?.category?.name || 'Digital'}
                                                                        </div>
                                                                        <div className='font-medium text-white'>
                                                                            {item.product?.name || `Product ${itemIndex + 1}`}
                                                                        </div>
                                                                        <div className='text-xs text-neutral-500 mt-1'>
                                                                            Qty: {item.quantity} × R$ {item.unitPrice.toFixed(2)}
                                                                        </div>
                                                                    </div>

                                                                    {/* Keys for this product */}
                                                                    {orderKeys[order.id] && (
                                                                        <div className='flex items-center gap-3'>
                                                                            {orderKeys[order.id]
                                                                                .filter((k) => k.productName === item.product?.name)
                                                                                .map((keyItem, ki) => (
                                                                                    <div key={ki} className='flex items-center gap-2'>
                                                                                        <span className='font-mono text-sm text-neutral-300'>
                                                                                            {keyItem.key}
                                                                                        </span>
                                                                                        <Button
                                                                                            size='sm'
                                                                                            variant='outline'
                                                                                            className='border-neutral-700 hover:bg-neutral-800'
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation()
                                                                                                copyToClipboard(keyItem.key, `${order.id}-${ki}`)
                                                                                            }}
                                                                                        >
                                                                                            {copiedKey === `${order.id}-${ki}` ? (
                                                                                                <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                                                                                            ) : (
                                                                                                <Copy className='w-4 h-4' />
                                                                                            )}
                                                                                        </Button>
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}

                                                            {/* Load keys button for delivered orders */}
                                                            {order.status === 'DELIVERED' && !orderKeys[order.id] && (
                                                                <Button
                                                                    variant='outline'
                                                                    className='border-neutral-700 hover:bg-neutral-800 w-full'
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDownloadKeys(order.id)
                                                                    }}
                                                                    disabled={loadingKeys === order.id}
                                                                >
                                                                    {loadingKeys === order.id ? (
                                                                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                                                    ) : (
                                                                        <Download className='w-4 h-4 mr-2' />
                                                                    )}
                                                                    Download Keys
                                                                </Button>
                                                            )}

                                                            {order.status === 'AWAITING_PAYMENT' && (
                                                                <div className='flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm'>
                                                                    <AlertCircle className='w-5 h-5 flex-shrink-0' />
                                                                    Payment pending. Complete your PIX payment to receive your keys.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}