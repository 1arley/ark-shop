'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Package,
    CreditCard,
    Eye,
    Download,
    Copy,
    CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Order {
    id: string
    date: string
    status: 'delivered' | 'processing' | 'pending'
    total: number
    items: {
        title: string
        platform: string
        key: string
        quantity: number
    }[]
}

export default function DashboardPage() {
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    const orders: Order[] = [
        {
            id: 'ARK-2025-78945',
            date: '2025-05-08',
            status: 'delivered',
            total: 119.99,
            items: [
                {
                    title: 'Steam Gift Card $50',
                    platform: 'Steam',
                    key: 'XXXX-XXXX-XXXX-XXXX',
                    quantity: 1,
                },
                {
                    title: 'Microsoft 365 Personal',
                    platform: 'Microsoft',
                    key: 'XXXX-XXXX-XXXX-XXXX',
                    quantity: 1,
                },
            ],
        },
        {
            id: 'ARK-2025-67834',
            date: '2025-04-25',
            status: 'delivered',
            total: 39.99,
            items: [
                {
                    title: 'Elden Ring - Steam Key',
                    platform: 'Steam',
                    key: 'XXXX-XXXX-XXXX-XXXX',
                    quantity: 1,
                },
            ],
        },
        {
            id: 'ARK-2025-56723',
            date: '2025-04-10',
            status: 'delivered',
            total: 139.99,
            items: [
                {
                    title: 'Windows 11 Pro License',
                    platform: 'Microsoft',
                    key: 'XXXX-XXXX-XXXX-XXXX',
                    quantity: 1,
                },
            ],
        },
    ]

    const copyToClipboard = (key: string, itemId: string) => {
        // In a real app, this would copy the actual key
        navigator.clipboard.writeText('DEMO-KEY-12345')
        setCopiedKey(itemId)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const stats = [
        { label: 'Total Orders', value: '12', icon: Package },
        { label: 'Spent This Year', value: '$847.89', icon: CreditCard },
        { label: 'Active Licenses', value: '8', icon: CheckCircle2 },
    ]

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
                            Welcome back, User!
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

                        <div className='space-y-4'>
                            {orders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className='bg-neutral-900/50 border-neutral-800 overflow-hidden'>
                                        <div
                                            className='p-6 cursor-pointer'
                                            onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                                        >
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-6'>
                                                    <div>
                                                        <div className='font-mono text-sm text-violet-400 mb-1'>{order.id}</div>
                                                        <div className='text-xs text-neutral-400'>{order.date}</div>
                                                    </div>
                                                    <Badge
                                                        variant='outline'
                                                        className={
                                                            order.status === 'delivered'
                                                                ? 'border-emerald-500 text-emerald-400'
                                                                : order.status === 'processing'
                                                                ? 'border-amber-500 text-amber-400'
                                                                : 'border-neutral-500 text-neutral-400'
                                                        }
                                                    >
                                                        {order.status === 'delivered' ? 'Delivered' : order.status === 'processing' ? 'Processing' : 'Pending'}
                                                    </Badge>
                                                </div>
                                                <div className='text-right'>
                                                    <div className='text-xl font-bold text-white'>
                                                        ${order.total.toFixed(2)}
                                                    </div>
                                                    <div className='text-sm text-neutral-400'>
                                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        {selectedOrder === order.id && (
                                            <div className='border-t border-neutral-800 p-6'>
                                                <div className='space-y-4'>
                                                    {order.items.map((item, itemIndex) => (
                                                        <div
                                                            key={itemIndex}
                                                            className='flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg'
                                                        >
                                                            <div className='flex-1'>
                                                                <div className='text-xs text-violet-400 mb-1'>{item.platform}</div>
                                                                <div className='font-medium text-white'>{item.title}</div>
                                                            </div>
                                                            <div className='flex items-center gap-3'>
                                                                <div className='font-mono text-sm text-neutral-300'>
                                                                    {item.key}
                                                                </div>
                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    className='border-neutral-700 hover:bg-neutral-800'
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        copyToClipboard(item.key, `${order.id}-${itemIndex}`)
                                                                    }}
                                                                >
                                                                    {copiedKey === `${order.id}-${itemIndex}` ? (
                                                                        <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                                                                    ) : (
                                                                        <Copy className='w-4 h-4' />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    className='border-neutral-700 hover:bg-neutral-800'
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Download className='w-4 h-4' />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className='flex gap-3 mt-6'>
                                                    <Button className='bg-neutral-200 text-neutral-950 hover:bg-neutral-300 flex-1'>
                                                        <Eye className='w-4 h-4 mr-2' />
                                                        View Receipt
                                                    </Button>
                                                    <Button
                                                        variant='outline'
                                                        className='border-neutral-700 hover:bg-neutral-800 flex-1'
                                                    >
                                                        <Download className='w-4 h-4 mr-2' />
                                                        Download Invoice
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}