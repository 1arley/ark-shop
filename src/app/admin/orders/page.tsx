'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Search, Loader2, Filter, ChevronDown,
  ChevronUp, CheckCircle, XCircle, Send, Wallet,
  Download, Copy, CheckCircle2, AlertCircle, DollarSign
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/api'

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case 'DELIVERED': return { label: 'Delivered', className: 'border-emerald-500 text-emerald-400' }
    case 'PAID': return { label: 'Paid', className: 'border-emerald-500 text-emerald-400' }
    case 'PROCESSING': return { label: 'Processing', className: 'border-amber-500 text-amber-400' }
    case 'AWAITING_PAYMENT': return { label: 'Awaiting Payment', className: 'border-amber-500 text-amber-400' }
    case 'PENDING': return { label: 'Pending', className: 'border-neutral-500 text-neutral-400' }
    case 'CANCELLED': return { label: 'Cancelled', className: 'border-red-500 text-red-400' }
    case 'REFUNDED': return { label: 'Refunded', className: 'border-blue-500 text-blue-400' }
    default: return { label: status, className: 'border-neutral-500 text-neutral-400' }
  }
}

const statusFlow: Record<string, string[]> = {
  PENDING: ['AWAITING_PAYMENT', 'CANCELLED'],
  AWAITING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [delivering, setDelivering] = useState<string | null>(null)
  const [refunding, setRefunding] = useState<string | null>(null)
  const [orderKeys, setOrderKeys] = useState<Record<string, { productName: string; key: string }[]>>({})
  const [loadingKeys, setLoadingKeys] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await apiClient.admin.listOrders({ limit: 100, status: statusFilter || undefined })
      setOrders(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      await apiClient.admin.updateOrderStatus(id, status)
      await fetchOrders()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Update failed') } finally { setUpdating(null) }
  }

  const handleDeliver = async (id: string) => {
    setDelivering(id)
    try {
      await apiClient.ordersAdmin.deliverOrder(id)
      await fetchOrders()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Delivery failed') } finally { setDelivering(null) }
  }

  const handleRefund = async (id: string) => {
    if (!confirm('Refund this payment?')) return
    setRefunding(id)
    try {
      await apiClient.paymentsAdmin.refundPayment(id)
      await fetchOrders()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Refund failed') } finally { setRefunding(null) }
  }

  const handleToggleOrder = async (orderId: string) => {
    if (expanded === orderId) { setExpanded(null); return }
    setExpanded(orderId)
    const order = orders.find(o => o.id === orderId)
    if (order && order.status === 'DELIVERED') {
      setLoadingKeys(orderId)
      try {
        const res = await apiClient.orders.downloadKeys(orderId)
        setOrderKeys(prev => ({ ...prev, [orderId]: res.data }))
      } catch { } finally { setLoadingKeys(null) }
    }
  }

  const copyToClipboard = async (key: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedKey(itemId)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      // Fallback para navegadores sem suporte a clipboard API ou em contexto não seguro
      try {
        const textarea = document.createElement('textarea')
        textarea.value = key
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopiedKey(itemId)
        setTimeout(() => setCopiedKey(null), 2000)
      } catch {
        // Se ambos falharem, exibe a key selecionável para cópia manual
        alert('Could not copy key. Please select and copy it manually.')
      }
    }
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Orders</h1>
          <p className='text-neutral-400 text-sm mt-1'>{orders.length} orders</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemAnim} className='flex items-center gap-4 mb-6'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
          <input
            type='text' placeholder='Search by ID, name, email...' value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-neutral-500' />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className='bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white'>
            <option value=''>All Status</option>
            <option value='PENDING'>Pending</option>
            <option value='AWAITING_PAYMENT'>Awaiting Payment</option>
            <option value='PAID'>Paid</option>
            <option value='PROCESSING'>Processing</option>
            <option value='DELIVERED'>Delivered</option>
            <option value='CANCELLED'>Cancelled</option>
            <option value='REFUNDED'>Refunded</option>
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-amber-400 animate-spin' /></div>
      ) : filtered.length === 0 ? (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-12 text-center'>
            <ShoppingBag className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
            <p className='text-neutral-400'>No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {filtered.map((order) => {
            const config = getStatusConfig(order.status)
            const isExpanded = expanded === order.id
            const payment = order.payments?.[0]
            const nextStatuses = statusFlow[order.status] || []

            return (
              <motion.div
                key={order.id}
                variants={itemAnim}
                className='bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden'
              >
                <div
                  className='p-5 cursor-pointer'
                  onClick={() => handleToggleOrder(order.id)}
                >
                  <div className='flex items-center justify-between flex-wrap gap-3'>
                    <div className='flex items-center gap-4 min-w-0'>
                      <div>
                        <div className='font-mono text-sm text-amber-400 mb-0.5'>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className='text-xs text-neutral-500'>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant='outline' className={config.className}>
                        {config.label}
                      </Badge>
                      {order.user && (
                        <div className='hidden sm:block text-xs text-neutral-500'>
                          {order.user.name || order.user.email}
                        </div>
                      )}
                    </div>

                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <div className='text-lg font-bold text-white'>R$ {formatPrice(order.total)}</div>
                        <div className='text-xs text-neutral-500'>{order.items?.length || 0} items</div>
                      </div>
                      {isExpanded ? <ChevronUp className='w-4 h-4 text-neutral-500' /> : <ChevronDown className='w-4 h-4 text-neutral-500' />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className='border-t border-neutral-800'
                  >
                    <div className='p-5 space-y-4'>
                      {/* User info */}
                      {order.user && (
                        <div className='text-sm text-neutral-400 bg-neutral-800/50 rounded-lg p-3'>
                          Customer: <span className='text-white'>{order.user.name || 'Unknown'}</span>
                          {' · '}
                          <span className='text-white'>{order.user.email}</span>
                          {' · ID: '}
                          <span className='font-mono text-amber-400'>{order.user.id.slice(0, 8)}</span>
                        </div>
                      )}

                      {/* Items */}
                      {order.items?.map((item, idx) => (
                        <div key={item.id} className='flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg'>
                          <div>
                            <div className='text-xs text-neutral-500'>{item.product?.category?.name || 'Digital'}</div>
                            <div className='text-sm font-medium text-white'>{item.product?.name || `Item ${idx + 1}`}</div>
                            <div className='text-xs text-neutral-500'>Qty: {item.quantity} × R$ {formatPrice(item.unitPrice)}</div>
                          </div>
                          {/* Keys for delivered orders */}
                          {orderKeys[order.id] && orderKeys[order.id]
                            .filter(k => k.productName === item.product?.name)
                            .map((keyItem, ki) => (
                              <div key={ki} className='flex items-center gap-2'>
                                <span className='font-mono text-sm text-neutral-300'>{keyItem.key}</span>
                                <Button size='sm' variant='outline'
                                  className='border-neutral-700 hover:bg-neutral-800'
                                  onClick={(e) => { e.stopPropagation(); copyToClipboard(keyItem.key, `${order.id}-${ki}`) }}>
                                  {copiedKey === `${order.id}-${ki}`
                                    ? <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                                    : <Copy className='w-4 h-4' />}
                                </Button>
                              </div>
                            ))}
                        </div>
                      ))}

                      {/* Payment info */}
                      {payment && (
                        <div className='flex items-center gap-3 text-sm text-neutral-400 bg-neutral-800/50 rounded-lg p-3'>
                          <Wallet className='w-4 h-4 text-amber-400' />
                          <span>Payment: <span className='text-white'>{payment.status}</span></span>
                          <span>· Method: <span className='text-white'>{payment.method}</span></span>
                          <span>· Provider: <span className='text-white'>{payment.provider}</span></span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className='flex flex-wrap gap-2 pt-2'>
                        {/* Status transitions */}
                        {nextStatuses.map(status => (
                          <Button
                            key={status}
                            size='sm'
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, status) }}
                            disabled={updating === order.id}
                            className={
                              status === 'CANCELLED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                            }
                          >
                            {updating === order.id ? <Loader2 className='w-3.5 h-3.5 mr-1 animate-spin' /> : null}
                            {status === 'CANCELLED' ? <XCircle className='w-3.5 h-3.5 mr-1' /> :
                              status === 'DELIVERED' ? <CheckCircle className='w-3.5 h-3.5 mr-1' /> :
                                <ChevronDown className='w-3.5 h-3.5 mr-1' />}
                            → {getStatusConfig(status as OrderStatus).label}
                          </Button>
                        ))}

                        {/* Deliver action */}
                        {(order.status === 'PAID' || order.status === 'PROCESSING') && (
                          <Button
                            size='sm'
                            onClick={(e) => { e.stopPropagation(); handleDeliver(order.id) }}
                            disabled={delivering === order.id}
                            className='bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          >
                            {delivering === order.id
                              ? <Loader2 className='w-3.5 h-3.5 mr-1 animate-spin' />
                              : <Send className='w-3.5 h-3.5 mr-1' />}
                            Deliver Keys
                          </Button>
                        )}

                        {/* Refund */}
                        {payment && payment.status === 'APPROVED' && (
                          <Button
                            size='sm'
                            onClick={(e) => { e.stopPropagation(); handleRefund(payment.id) }}
                            disabled={refunding === payment.id}
                            className='bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                          >
                            {refunding === payment.id
                              ? <Loader2 className='w-3.5 h-3.5 mr-1 animate-spin' />
                              : <DollarSign className='w-3.5 h-3.5 mr-1' />}
                            Refund Payment
                          </Button>
                        )}

                        {/* Download keys link for delivered orders */}
                        {order.status === 'DELIVERED' && !orderKeys[order.id] && (
                          <Button
                            size='sm'
                            variant='outline'
                            className='border-neutral-700 text-neutral-400'
                            onClick={(e) => { e.stopPropagation(); handleToggleOrder(order.id) }}
                          >
                            {loadingKeys === order.id
                              ? <Loader2 className='w-3.5 h-3.5 mr-1 animate-spin' />
                              : <Download className='w-3.5 h-3.5 mr-1' />}
                            Load Keys
                          </Button>
                        )}

                        {order.status === 'AWAITING_PAYMENT' && (
                          <div className='flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2'>
                            <AlertCircle className='w-4 h-4' />
                            Awaiting PIX payment
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
