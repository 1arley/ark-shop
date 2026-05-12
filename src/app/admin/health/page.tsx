'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, Database, Package, ShoppingBag,
  CreditCard, RefreshCw, Heart, HeartOff,
  Clock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api'
import type { SystemHealth } from '@/types/api'

export default function AdminHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHealth = async () => {
    try {
      const res = await apiClient.admin.getSystemHealth()
      setHealth(res.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchHealth() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHealth()
    setRefreshing(false)
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  if (loading) {
    return <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-amber-400 animate-spin' /></div>
  }

  const isHealthy = health?.database === 'healthy'

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      {/* Header */}
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-white'>System Health</h1>
          <p className='text-neutral-400 text-sm mt-1'>Server status and database metrics</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Status Banner */}
      <motion.div variants={itemAnim} className='mb-8'>
        <div className={`p-6 rounded-xl border ${isHealthy
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-red-500/5 border-red-500/20'
          }`}>
          <div className='flex items-center gap-4'>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isHealthy ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {isHealthy
                ? <Heart className='w-8 h-8 text-emerald-400' />
                : <HeartOff className='w-8 h-8 text-red-400' />
              }
            </div>
            <div>
              <div className='text-xl font-bold text-white flex items-center gap-2'>
                {isHealthy ? 'All Systems Operational' : 'System Issues Detected'}
                <span className={`inline-block w-3 h-3 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
              </div>
              <p className='text-sm text-neutral-400 mt-1'>
                {isHealthy
                  ? 'The server and database are running normally.'
                  : 'There may be connectivity or performance issues.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {[
          { label: 'Database', value: health?.database || 'unknown', icon: Database, healthy: isHealthy },
          { label: 'Products', value: String(health?.products || 0), icon: Package, healthy: true },
          { label: 'Orders', value: String(health?.orders || 0), icon: ShoppingBag, healthy: true },
          { label: 'Payments', value: String(health?.payments || 0), icon: CreditCard, healthy: true },
        ].map((item) => (
          <motion.div key={item.label} variants={itemAnim}>
            <Card className='bg-neutral-900/50 border-neutral-800'>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-xs text-neutral-500 mb-1'>{item.label}</div>
                    <div className='text-xl font-bold text-white flex items-center gap-2'>
                      {item.value}
                      {item.healthy !== undefined && (
                        <span className={`inline-block w-2 h-2 rounded-full ${item.healthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      )}
                    </div>
                  </div>
                  <item.icon className={`w-8 h-8 ${item.healthy !== false ? 'text-amber-500/40' : 'text-red-500/40'}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Timestamp */}
      {health?.timestamp && (
        <motion.div variants={itemAnim} className='flex items-center gap-2 text-xs text-neutral-600 bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-3'>
          <Clock className='w-3.5 h-3.5' />
          Last checked: {new Date(health.timestamp).toLocaleString()}
        </motion.div>
      )}
    </motion.div>
  )
}
