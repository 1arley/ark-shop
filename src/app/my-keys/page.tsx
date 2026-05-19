'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, KeyRound, Copy, CheckCircle2, Download, Package, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/services/api'
import type { Order, DeliveredKey } from '@/types/api'

interface OrderWithKeys extends Order {
  keys?: DeliveredKey[]
}

export default function MyKeysPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderWithKeys[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingKeysId, setLoadingKeysId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/my-keys')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (!isAuthenticated) return

    async function loadDeliveredOrders() {
      try {
        setLoading(true)
        const res = await apiClient.orders.list({ limit: 50 })
        const data = res.data
        const allOrders: Order[] = Array.isArray(data) ? data : (data.data || [])
        setOrders(allOrders.filter(o => o.status === 'DELIVERED'))
      } catch { setOrders([]) } finally { setLoading(false) }
    }
    loadDeliveredOrders()
  }, [isAuthenticated])

  const handleLoadKeys = async (orderId: string) => {
    if (orders.find(o => o.id === orderId)?.keys) return
    setLoadingKeysId(orderId)
    try {
      const res = await apiClient.orders.downloadKeys(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, keys: res.data?.keys } : o))
    } catch { setError('Failed to load keys. Please try again.') }
    setLoadingKeysId(null)
  }

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Load keys on-demand when user clicks "Load Keys" button.
  // Avoids N+1 problem of auto-loading keys for every delivered order on mount.
  // Keys are fetched only when explicitly requested by the user.

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

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      <section className='relative pt-28 pb-16 bg-neutral-900'>
        <div className='absolute inset-0'><div className='absolute top-20 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' /></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => router.push('/dashboard')} className='flex items-center gap-1 text-sm text-neutral-400 hover:text-white mb-4 transition-colors'>
              <ArrowLeft className='w-4 h-4' /> Back to Dashboard
            </button>
            <h1 className='text-4xl md:text-5xl font-semibold text-white flex items-center gap-3'>
              <KeyRound className='w-8 h-8 text-violet-400' />
              My Keys
            </h1>
            <p className='text-neutral-400 text-lg mt-1'>Your purchased digital products and license keys</p>
          </motion.div>
        </div>
      </section>

      <section className='py-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div variants={container} initial='hidden' animate='show'>
            {error && (
              <motion.div variants={itemAnim} className='mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2'>
                <AlertCircle className='w-4 h-4' />{error}
                <button onClick={() => setError(null)} className='ml-auto text-red-400/50 hover:text-red-400'>Dismiss</button>
              </motion.div>
            )}

            {loading ? (
              <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-violet-400 animate-spin' /></div>
            ) : orders.length === 0 ? (
              <motion.div variants={itemAnim}>
                <Card className='bg-neutral-900/50 border-neutral-800'>
                  <CardContent className='p-12 text-center'>
                    <KeyRound className='w-16 h-16 text-neutral-600 mx-auto mb-4' />
                    <h3 className='text-xl font-medium text-white mb-2'>No keys yet</h3>
                            <p className='text-neutral-400 mb-6'>You don&apos;t have any delivered orders with keys yet.</p>
                            <Button className='bg-white text-neutral-950 hover:bg-neutral-200' asChild>
                              <Link href='/products'>Browse Products</Link>
                            </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className='space-y-6'>
                {orders.map((order) => (
                  <motion.div key={order.id} variants={itemAnim}>
                    <Card className='bg-neutral-900/50 border-neutral-800 overflow-hidden'>
                      <div className='p-5 border-b border-neutral-800'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <Package className='w-5 h-5 text-violet-400' />
                            <div>
                              <span className='font-mono text-sm text-violet-400'>#{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className='text-xs text-neutral-500 ml-3'>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge variant='outline' className='border-emerald-500 text-emerald-400'>Delivered</Badge>
                        </div>
                      </div>
                      <div className='p-5'>
                        {loadingKeysId === order.id ? (
                          <div className='flex justify-center py-8'>
                            <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
                          </div>
                        ) : order.keys ? (
                          <div className='space-y-3'>
                            {order.keys.map((keyItem, ki) => (
                              <div key={ki} className='flex items-center justify-between bg-neutral-800/50 rounded-lg p-4 group'>
                                <div className='min-w-0 flex-1'>
                                  <div className='text-xs text-neutral-500 mb-1'>{keyItem.productName}</div>
                                  <div className='font-mono text-sm text-white break-all'>{keyItem.decryptedKey}</div>
                                </div>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='ml-4 border-neutral-700 text-neutral-400 hover:bg-neutral-800 flex-shrink-0'
                                  onClick={() => copyToClipboard(keyItem.decryptedKey, `${order.id}-${ki}`)}
                                >
                                  {copiedKey === `${order.id}-${ki}`
                                    ? <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                                    : <Copy className='w-4 h-4' />
                                  }
                                </Button>
                              </div>
                            ))}
                            <div className='text-xs text-neutral-600 text-center pt-2'>
                              {order.keys.length} key{order.keys.length !== 1 ? 's' : ''} in this order
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant='outline'
                            className='w-full border-neutral-700 text-neutral-400'
                            onClick={() => handleLoadKeys(order.id)}
                            disabled={loadingKeysId === order.id}
                          >
                            {loadingKeysId === order.id
                              ? <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                              : <Download className='w-4 h-4 mr-2' />
                            }
                            Load Keys
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
