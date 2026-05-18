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
    BarChart3,
    Key,
    ShoppingBag,
    Edit2,
    Plus,
    TrendingUp,
    Clock,
    DollarSign,
    Shield,
    Users,
    Store,
    Bell,
    Activity,
    Tags,
    Tag,
    Settings,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SectionHero from '@/components/layout/SectionHero'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/services/api'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus, DashboardStats , DeliveredKey } from '@/types/api'

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

const CLIPBOARD_FEEDBACK_DURATION = 2000

export default function DashboardPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const [orderKeys, setOrderKeys] = useState<Record<string, DeliveredKey[]>>({})
    const [loadingKeys, setLoadingKeys] = useState<string | null>(null)

    // Admin state
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
    const [adminStats, setAdminStats] = useState<DashboardStats | null>(null)
    const [loadingAdminStats, setLoadingAdminStats] = useState(false)
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

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
                if (isAdmin) {
                    const response = await apiClient.admin.listOrders({ limit: 50 })
                    setOrders(response.data.data || [])
                } else {
                    const response = await apiClient.orders.list({ limit: 20 })
                    const data = response.data
                    setOrders(Array.isArray(data) ? data : (data.data || []))
                }
            } catch (err) {
                console.error('[Dashboard] Failed to load orders:', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadOrders()
    }, [isAuthenticated, isAdmin])

    // Fetch admin stats
    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return
        async function loadAdminStats() {
            setLoadingAdminStats(true)
            try {
                const res = await apiClient.admin.dashboard()
                setAdminStats(res.data)
            } catch (err) { console.error('Failed to load admin stats:', err) }
            setLoadingAdminStats(false)
        }
        loadAdminStats()
    }, [isAuthenticated, isAdmin])

    const handleDownloadKeys = async (orderId: string) => {
        if (orderKeys[orderId]) return
        setLoadingKeys(orderId)
        try {
            const response = await apiClient.orders.downloadKeys(orderId)
            setOrderKeys((prev) => ({ ...prev, [orderId]: response.data?.keys || [] }))
        } catch (err) {
            console.error('Failed to download keys:', err)
        } finally {
            setLoadingKeys(null)
        }
    }

    const copyToClipboard = (key: string, itemId: string) => {
        navigator.clipboard.writeText(key)
        setCopiedKey(itemId)
        setTimeout(() => setCopiedKey(null), CLIPBOARD_FEEDBACK_DURATION)
    }

    const handleToggleOrder = async (orderId: string) => {
        if (selectedOrder === orderId) {
            setSelectedOrder(null)
        } else {
            setSelectedOrder(orderId)
            const order = orders.find((o) => o.id === orderId)
            if (order && order.status === 'DELIVERED') {
                await handleDownloadKeys(orderId)
            }
        }
    }

    const updateOrderStatus = async (orderId: string, status: string) => {
        setUpdatingOrder(orderId)
        try {
            await apiClient.admin.updateOrderStatus(orderId, status)
            const response = await apiClient.admin.listOrders({ limit: 50 })
            setOrders(response.data.data || [])
        } catch (err) { console.error('Failed to update order status:', err) }
        setUpdatingOrder(null)
    }

    const handleCancelOrder = async (orderId: string) => {
        setUpdatingOrder(orderId)
        try {
            await apiClient.orders.cancel(orderId)
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o))
        } catch (err) { console.error('Failed to cancel order:', err) }
        setUpdatingOrder(null)
    }

    const stats = [
        { label: 'Total Orders', value: String(orders.length), icon: Package },
        {
            label: 'Total Spent',
            value: `R$ ${formatPrice(orders.reduce((sum, o) => sum + Number(o.total), 0))}`,
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
            <SectionHero
              title={`Welcome back, ${user?.name || 'User'}!`}
              subtitle={isAdmin ? 'Manage your store — products, keys, orders and analytics' : 'Manage your orders and access your digital products'}
              badge={isAdmin ? <Badge className='bg-violet-600 text-white border-0 text-xs'>ADMIN</Badge> : undefined}
            />

            {/* Dashboard Content */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    {/* Admin Stats Section */}
                    {isAdmin && adminStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className='mb-12'
                        >
                            <h2 className='text-xl font-semibold text-white mb-6 flex items-center gap-2'>
                                <BarChart3 className='w-5 h-5 text-violet-400' />
                                Store Overview
                            </h2>

                            {/* Revenue */}
                            <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                                {[
                                    { label: 'Total Revenue', value: `R$ ${formatPrice(adminStats.revenue.total)}`, icon: TrendingUp },
                                    { label: 'Today', value: `R$ ${formatPrice(adminStats.revenue.today)}`, icon: DollarSign },
                                    { label: 'This Week', value: `R$ ${formatPrice(adminStats.revenue.thisWeek)}`, icon: Clock },
                                    { label: 'This Month', value: `R$ ${formatPrice(adminStats.revenue.thisMonth)}`, icon: TrendingUp },
                                ].map((item) => (
                                    <Card key={item.label} className='bg-neutral-900/50 border-neutral-800'>
                                        <CardContent className='p-5'>
                                            <div className='flex items-center justify-between'>
                                                <div>
                                                    <div className='text-xs text-neutral-500 mb-1'>{item.label}</div>
                                                    <div className='text-xl font-bold text-white'>{item.value}</div>
                                                </div>
                                                <item.icon className='w-8 h-8 text-emerald-500/50' />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Products, Keys, Orders Summary + Quick Actions */}
                            <div className='grid md:grid-cols-3 gap-6'>
                                <Card className='bg-neutral-900/50 border-neutral-800'>
                                    <CardContent className='p-5'>
                                        <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                                            <Package className='w-4 h-4 text-violet-400' />
                                            Products
                                        </h3>
                                        <div className='grid grid-cols-2 gap-3 mb-4'>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-white'>{adminStats.products.total}</div>
                                                <div className='text-xs text-neutral-500'>Total</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-emerald-400'>{adminStats.products.active}</div>
                                                <div className='text-xs text-neutral-500'>Active</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-amber-400'>{adminStats.products.lowStock}</div>
                                                <div className='text-xs text-neutral-500'>Low Stock</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-neutral-400'>{adminStats.products.inactive}</div>
                                                <div className='text-xs text-neutral-500'>Inactive</div>
                                            </div>
                                        </div>
                                        <Link href='/admin/products'>
                                            <Button variant='outline' size='sm' className='w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800'>
                                                <Edit2 className='w-3.5 h-3.5 mr-2' />
                                                Manage Products
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className='bg-neutral-900/50 border-neutral-800'>
                                    <CardContent className='p-5'>
                                        <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                                            <Key className='w-4 h-4 text-sky-400' />
                                            Keys
                                        </h3>
                                        <div className='grid grid-cols-2 gap-3 mb-4'>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-white'>{adminStats.keys.total}</div>
                                                <div className='text-xs text-neutral-500'>Total</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-emerald-400'>{adminStats.keys.available}</div>
                                                <div className='text-xs text-neutral-500'>Available</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-amber-400'>{adminStats.keys.reserved}</div>
                                                <div className='text-xs text-neutral-500'>Reserved</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-sky-400'>{adminStats.keys.delivered}</div>
                                                <div className='text-xs text-neutral-500'>Delivered</div>
                                            </div>
                                        </div>
                                        <Link href='/admin/keys'>
                                            <Button variant='outline' size='sm' className='w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800'>
                                                <Plus className='w-3.5 h-3.5 mr-2' />
                                                Add Keys to Product
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className='bg-neutral-900/50 border-neutral-800'>
                                    <CardContent className='p-5'>
                                        <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                                            <ShoppingBag className='w-4 h-4 text-amber-400' />
                                            Orders
                                        </h3>
                                        <div className='grid grid-cols-2 gap-3 mb-4'>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-white'>{adminStats.orders.total}</div>
                                                <div className='text-xs text-neutral-500'>Total</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-amber-400'>{adminStats.orders.pending}</div>
                                                <div className='text-xs text-neutral-500'>Pending</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-emerald-400'>{adminStats.orders.completed}</div>
                                                <div className='text-xs text-neutral-500'>Completed</div>
                                            </div>
                                            <div className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                                                <div className='text-lg font-bold text-red-400'>{adminStats.orders.cancelled}</div>
                                                <div className='text-xs text-neutral-500'>Cancelled</div>
                                            </div>
                                        </div>
                                        {/* Orders are already visible below — no extra link needed */}
                                        <p className='text-xs text-neutral-600 text-center'>
                                            All orders listed below with status management
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {loadingAdminStats && isAdmin && (
                        <div className='flex justify-center py-8 mb-8'>
                            <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
                        </div>
                    )}

                    {/* User Stats */}
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

                    {/* Admin Quick Links */}
                    {isAdmin && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className='mb-12'
                        >
                            <h2 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
                                <Settings className='w-5 h-5 text-amber-400' />
                                Admin Panel
                            </h2>
                            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3'>
                                {[
                                    { href: '/admin', label: 'Dashboard', icon: BarChart3, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                                    { href: '/admin/users', label: 'Users', icon: Users, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
                                    { href: '/admin/categories', label: 'Categories', icon: Tags, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                                    { href: '/admin/keys', label: 'Keys', icon: Key, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
                                    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                                    { href: '/admin/sellers', label: 'Sellers', icon: Store, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
                                    { href: '/admin/coupons', label: 'Coupons', icon: Tag, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                                    { href: '/admin/notifications', label: 'Notifications', icon: Bell, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
                                    { href: '/admin/fraud', label: 'Fraud', icon: Shield, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                                    { href: '/admin/health', label: 'Health', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                                ].map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <Card className='bg-neutral-900/50 border-neutral-800 hover:bg-neutral-800/50 transition-all group cursor-pointer h-full'>
                                            <CardContent className='p-4'>
                                                <div className='flex flex-col items-center gap-2 text-center'>
                                                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center border`}>
                                                        <item.icon className='w-5 h-5' />
                                                    </div>
                                                    <span className='text-xs font-medium text-neutral-400 group-hover:text-white transition-colors'>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}

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
                                    <Button asChild className='bg-white text-neutral-950 hover:bg-neutral-200'>
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
                            {isAdmin ? 'All Orders' : 'Recent Orders'}
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
                                                                <div className='text-xs text-neutral-500'>
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <Badge variant='outline' className={statusConfig.className}>
                                                                {statusConfig.label}
                                                            </Badge>
                                                            {/* Admin: show user info */}
                                                            {isAdmin && order.userId && (
                                                                <span className='text-xs text-neutral-600'>
                                                                    User: {order.userId.slice(0, 8)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className='flex items-center gap-4'>
                                                            <div className='text-right'>
                                                                <div className='text-xl font-bold text-white'>
                                                                    R$ {formatPrice(order.total)}
                                                                </div>
                                                                <div className='text-sm text-neutral-400'>
                                                                    {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                                                                </div>
                                                            </div>
                                                            {/* Admin: status management */}
                                                            {isAdmin && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                                                                <select
                                                                    value=''
                                                                    onChange={(e) => {
                                                                        e.stopPropagation()
                                                                        if (e.target.value) updateOrderStatus(order.id, e.target.value)
                                                                    }}
                                                                    disabled={updatingOrder === order.id}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className='bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-xs text-white'
                                                                >
                                                                    <option value=''>Update status</option>
                                                                    {order.status === 'PENDING' && <option value='AWAITING_PAYMENT'>→ Awaiting Payment</option>}
                                                                    {(order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT') && <option value='PAID'>→ Paid</option>}
                                                                    {order.status === 'PAID' && <option value='PROCESSING'>→ Processing</option>}
                                                                    {(order.status === 'PAID' || order.status === 'PROCESSING') && <option value='DELIVERED'>→ Delivered</option>}
                                                                    <option value='CANCELLED'>→ Cancelled</option>
                                                                </select>
                                                            )}

                                                            {/* User: cancel button for cancellable orders */}
                                                            {!isAdmin && (order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT') && (
                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        if (confirm('Are you sure you want to cancel this order?')) {
                                                                            handleCancelOrder(order.id)
                                                                        }
                                                                    }}
                                                                    disabled={updatingOrder === order.id}
                                                                    className='border-red-500/30 text-red-400 hover:bg-red-500/10'
                                                                >
                                                                    {updatingOrder === order.id
                                                                        ? <Loader2 className='w-3.5 h-3.5 animate-spin' />
                                                                        : <X className='w-3.5 h-3.5' />
                                                                    }
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Details */}
                                                {selectedOrder === order.id && (
                                                    <div className='border-t border-neutral-800 p-6'>
                                                        <div className='space-y-4'>
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
                                                                            Qty: {item.quantity} × R$ {formatPrice(item.price)}
                                                                        </div>
                                                                    </div>

                                                                    {/* Keys */}
                                                                    {orderKeys[order.id] && (
                                                                        <div className='flex items-center gap-3'>
                                                                            {orderKeys[order.id]
                                                                                .filter((k) => k.productName === item.product?.name)
                                                                                .map((keyItem, ki) => (
                                                                                    <div key={ki} className='flex items-center gap-2'>
                                                                                        <span className='font-mono text-sm text-neutral-300'>
                                                                                            {keyItem.decryptedKey}
                                                                                        </span>
                                                                                        <Button
                                                                                                                            size='sm'
                                                                                                                            variant='outline'
                                                                                                                            className='border-neutral-700 hover:bg-neutral-800'
                                                                                                                            onClick={(e) => {
                                                                                                                                e.stopPropagation()
                                                                                                                                copyToClipboard(keyItem.decryptedKey, `${order.id}-${ki}`)
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
