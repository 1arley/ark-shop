'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Loader2,
  ChevronRight,
  Download,
  X,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SectionHero from '@/components/layout/SectionHero'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuth } from '@/hooks/use-auth'
import { useOrders } from '@/hooks/use-orders'
import { formatPrice } from '@/lib/utils'
import type { OrderStatus } from '@/types/api'

const orderStatusOptions: OrderStatus[] = [
  'PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'REFUNDED',
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    orders,
    isLoading,
    currentPage,
    totalPages,
    total,
    fetchOrders,
    cancelOrder,
  } = useOrders()

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(1, 20)
    }
  }, [isAuthenticated, fetchOrders])

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancellingId(orderId)
    const result = await cancelOrder(orderId)
    if (!result.success) {
      alert(result.error || 'Failed to cancel order')
    }
    setCancellingId(null)
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

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

      <SectionHero
        title='My Orders'
        subtitle='Track your orders and manage your purchases'
      />

      <section className='py-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Filter */}
          <div className='flex items-center gap-2 mb-8 flex-wrap'>
            <Filter className='w-4 h-4 text-neutral-500' />
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'bg-violet-600' : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800'}
            >
              All
            </Button>
            {orderStatusOptions.map((status) => {
              const count = orders.filter((o) => o.status === status).length
              if (count === 0) return null
              return (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-violet-600' : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800'}
                >
                  {status.replace('_', ' ')}
                  <span className='ml-1 text-xs opacity-60'>({count})</span>
                </Button>
              )
            })}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className='flex justify-center py-16'>
              <Loader2 className='w-10 h-10 text-violet-400 animate-spin' />
            </div>
          ) : filteredOrders.length > 0 ? (
            <>
              <div className='space-y-4'>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/orders/${order.id}`}>
                      <Card className='bg-neutral-900/50 border-neutral-800 hover:border-violet-500/30 transition-all group'>
                        <CardContent className='p-5'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              <div className='w-12 h-12 bg-violet-600/10 rounded-xl flex items-center justify-center'>
                                <ShoppingBag className='w-6 h-6 text-violet-400' />
                              </div>
                              <div>
                                <div className='font-mono text-sm text-violet-400 mb-1'>
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </div>
                                <div className='text-xs text-neutral-500'>
                                  {formatDate(order.createdAt)}
                                </div>
                              </div>
                            </div>

                            <div className='flex items-center gap-4'>
                              <StatusBadge status={order.status} variant='order' size='sm' />
                              <div className='text-right'>
                                <div className='text-lg font-bold text-white'>
                                  R$ {formatPrice(order.total)}
                                </div>
                                <div className='text-xs text-neutral-500'>
                                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                </div>
                              </div>
                              <ChevronRight className='w-5 h-5 text-neutral-600 group-hover:text-violet-400 transition-colors' />
                            </div>
                          </div>

                          {/* Items preview */}
                          {order.items && order.items.length > 0 && (
                            <div className='mt-4 pt-4 border-t border-neutral-800'>
                              <div className='flex flex-wrap gap-2'>
                                {order.items.slice(0, 3).map((item) => (
                                  <span key={item.id} className='text-xs text-neutral-400 bg-neutral-800/50 px-2 py-1 rounded'>
                                    {item.product?.name || 'Product'} × {item.quantity}
                                  </span>
                                ))}
                                {order.items.length > 3 && (
                                  <span className='text-xs text-neutral-500'>+{order.items.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          {(order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT') && (
                            <div className='mt-4 pt-4 border-t border-neutral-800 flex items-center gap-3'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleCancelOrder(order.id)
                                }}
                                disabled={cancellingId === order.id}
                                className='border-red-500/30 text-red-400 hover:bg-red-500/10'
                              >
                                {cancellingId === order.id ? (
                                  <Loader2 className='w-3.5 h-3.5 animate-spin mr-2' />
                                ) : (
                                  <X className='w-3.5 h-3.5 mr-2' />
                                )}
                                Cancel Order
                              </Button>
                              {order.status === 'AWAITING_PAYMENT' && (
                                <Link href={`/orders/${order.id}`}>
                                  <Button size='sm' className='bg-emerald-600 hover:bg-emerald-500'>
                                    Complete Payment
                                  </Button>
                                </Link>
                              )}
                            </div>
                          )}

                          {/* Delivered: download keys */}
                          {order.status === 'DELIVERED' && (
                            <div className='mt-4 pt-4 border-t border-neutral-800'>
                              <Link href={`/orders/${order.id}`}>
                                <Button size='sm' variant='outline' className='border-neutral-700 text-neutral-300 hover:bg-neutral-800'>
                                  <Download className='w-3.5 h-3.5 mr-2' />
                                  View Keys
                                </Button>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-8'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchOrders(page, 20)}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon='shoppingBag'
              title={statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter.toLowerCase()} orders`}
              description='Start shopping to see your orders here.'
              actionLabel='Browse Products'
              actionHref='/products'
            />
          )}

          {/* Summary */}
          {!isLoading && total > 0 && (
            <div className='mt-8 text-center text-sm text-neutral-500'>
              Showing {filteredOrders.length} of {total} orders
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
