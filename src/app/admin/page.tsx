'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp, DollarSign, Clock, Package, KeyRound, ShoppingBag,
  Users, Wallet, Loader2, Plus, Trash2,
  Sparkles, AlertTriangle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api'
import { formatPrice } from '@/lib/utils'
import type { DashboardStats } from '@/types/api'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearToken, setClearToken] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await apiClient.admin.dashboard()
      setStats(res.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchStats() }, [])

  const handleGenerateDemo = async () => {
    setGenerating(true)
    setResult(null)
    try {
      const res = await apiClient.admin.generateDemoData(5, 10)
      setResult(`Demo data generated: ${res.data.categories} categories, ${res.data.products} products, ${res.data.keys} keys`)
      await fetchStats()
    } catch (e: unknown) { setResult(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`) }
    setGenerating(false)
  }

  const handleClearDemo = async () => {
    if (!clearToken) return
    setClearing(true)
    setResult(null)
    try {
      const res = await apiClient.admin.clearDemoData(clearToken)
      setResult(res.data.message)
      await fetchStats()
    } catch (e: unknown) { setResult(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`) }
    setClearing(false)
    setShowClearConfirm(false)
    setClearToken('')
  }

  if (loading) {
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='w-10 h-10 text-amber-400 animate-spin' />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className='text-center py-20 text-neutral-400'>
        Failed to load dashboard data.
      </div>
    )
  }

  const revenueCards = [
    { label: 'Total Revenue', value: `R$ ${formatPrice(stats.revenue.total)}`, icon: TrendingUp, change: null },
    { label: 'Today', value: `R$ ${formatPrice(stats.revenue.today)}`, icon: DollarSign, change: null },
    { label: 'This Week', value: `R$ ${formatPrice(stats.revenue.thisWeek)}`, icon: Clock, change: null },
    { label: 'This Month', value: `R$ ${formatPrice(stats.revenue.thisMonth)}`, icon: TrendingUp, change: null },
  ]

  const overviewCards = [
    {
      title: 'Products', icon: Package, color: 'text-violet-400', bg: 'bg-violet-500/10',
      link: '/admin/products', stats: [
        { label: 'Total', value: stats.products.total, color: 'text-white' },
        { label: 'Active', value: stats.products.active, color: 'text-emerald-400' },
        { label: 'Low Stock', value: stats.products.lowStock, color: 'text-amber-400' },
        { label: 'Inactive', value: stats.products.inactive, color: 'text-neutral-500' },
      ]
    },
    {
      title: 'Keys', icon: KeyRound, color: 'text-sky-400', bg: 'bg-sky-500/10',
      link: '/admin/keys', stats: [
        { label: 'Total', value: stats.keys.total, color: 'text-white' },
        { label: 'Available', value: stats.keys.available, color: 'text-emerald-400' },
        { label: 'Reserved', value: stats.keys.reserved, color: 'text-amber-400' },
        { label: 'Delivered', value: stats.keys.delivered, color: 'text-sky-400' },
      ]
    },
    {
      title: 'Orders', icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-500/10',
      link: '/admin/orders', stats: [
        { label: 'Total', value: stats.orders.total, color: 'text-white' },
        { label: 'Pending', value: stats.orders.pending, color: 'text-amber-400' },
        { label: 'Completed', value: stats.orders.completed, color: 'text-emerald-400' },
        { label: 'Cancelled', value: stats.orders.cancelled, color: 'text-red-400' },
      ]
    },
    {
      title: 'Payments', icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10',
      link: null, stats: [
        { label: 'Total', value: stats.payments.total, color: 'text-white' },
        { label: 'Approved', value: stats.payments.approved, color: 'text-emerald-400' },
        { label: 'Pending', value: stats.payments.pending, color: 'text-amber-400' },
        { label: 'Refunded', value: stats.payments.refunded, color: 'text-red-400' },
      ]
    },
  ]

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      {/* Header */}
      <motion.div variants={itemAnim} className='mb-8'>
        <h1 className='text-2xl font-bold text-white'>Admin Dashboard</h1>
        <p className='text-neutral-400 mt-1'>Store overview and quick actions</p>
      </motion.div>

      {/* Users summary */}
      <motion.div variants={itemAnim} className='flex items-center gap-4 mb-6'>
        <div className='flex items-center gap-2 text-sm text-neutral-400 bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800'>
          <Users className='w-4 h-4' />
          <span>{stats.users.total} total users</span>
        </div>
      </motion.div>

      {/* Revenue */}
      <motion.div variants={itemAnim} className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {revenueCards.map((item) => (
          <Card key={item.label} className='bg-neutral-900/50 border-neutral-800'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-xs text-neutral-500 mb-1'>{item.label}</div>
                  <div className='text-xl font-bold text-white'>{item.value}</div>
                </div>
                <item.icon className='w-8 h-8 text-amber-500/40' />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemAnim} className='grid md:grid-cols-2 gap-6 mb-8'>
        {overviewCards.map((card) => (
          <Card key={card.title} className='bg-neutral-900/50 border-neutral-800'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-sm font-semibold text-white flex items-center gap-2'>
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  {card.title}
                </h3>
                {card.link && (
                  <Link href={card.link}>
                    <Button variant='outline' size='sm' className='border-neutral-700 text-neutral-300 hover:bg-neutral-800'>
                      Manage
                    </Button>
                  </Link>
                )}
              </div>
              <div className='grid grid-cols-4 gap-2'>
                {card.stats.map((s) => (
                  <div key={s.label} className='text-center p-2 bg-neutral-800/50 rounded-lg'>
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    <div className='text-xs text-neutral-500'>{s.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Demo Data Tools */}
      <motion.div variants={itemAnim} className='mb-8'>
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-5'>
            <h3 className='text-sm font-semibold text-white flex items-center gap-2 mb-4'>
              <Sparkles className='w-4 h-4 text-amber-400' />
              Demo Data Tools
            </h3>
            <div className='flex flex-wrap gap-3'>
              <Button
                onClick={handleGenerateDemo}
                disabled={generating}
                className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
              >
                {generating ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Plus className='w-4 h-4 mr-2' />}
                Generate Demo Data
              </Button>
              <Button
                onClick={() => setShowClearConfirm(!showClearConfirm)}
                className='bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Clear All Data
              </Button>
            </div>
            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className='mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg'
              >
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
                  <div className='flex-1'>
                    <p className='text-sm text-red-300 font-medium mb-2'>DANGER: This will delete ALL data from the database!</p>
                    <input
                      type='text'
                      value={clearToken}
                      onChange={(e) => setClearToken(e.target.value)}
                      placeholder='Enter confirmation token from CLEAR_DEMO_TOKEN env'
                      className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 mb-2'
                    />
                    <Button
                      onClick={handleClearDemo}
                      disabled={clearing || !clearToken}
                      className='bg-red-600 hover:bg-red-700 text-white text-sm'
                    >
                      {clearing ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : null}
                      Confirm Clear All Data
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            {result && (
              <div className='mt-3 text-sm text-neutral-400 bg-neutral-800/50 rounded-lg p-3'>
                {result}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Orders */}
      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <motion.div variants={itemAnim}>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-white'>Recent Orders</h2>
            <Link href='/admin/orders'>
              <Button variant='outline' size='sm' className='border-neutral-700 text-neutral-300'>
                View All
              </Button>
            </Link>
          </div>
          <div className='space-y-2'>
            {stats.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className='flex items-center justify-between bg-neutral-900/50 border border-neutral-800 rounded-lg p-4'>
                <div className='flex items-center gap-4'>
                  <span className='font-mono text-xs text-amber-400'>{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className='text-sm text-neutral-400'>
                    {order.user?.name || order.userId?.slice(0, 8) || 'Unknown'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${order.status === 'DELIVERED' ? 'border-emerald-500 text-emerald-400' :
                    order.status === 'CANCELLED' ? 'border-red-500 text-red-400' :
                      'border-amber-500 text-amber-400'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <span className='text-sm font-medium text-white'>
                  R$ {formatPrice(order.total)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
