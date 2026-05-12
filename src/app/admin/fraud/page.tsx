'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert, Loader2, Search,
  Shield, ShieldCheck, AlertTriangle, Skull,
  MapPin, Fingerprint
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { apiClient } from '@/services/api'
import type { FraudLog } from '@/types/api'

const riskConfig: Record<string, { icon: typeof Shield; color: string; bg: string }> = {
  LOW: { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  MEDIUM: { icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  HIGH: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  CRITICAL: { icon: Skull, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
}

export default function AdminFraudPage() {
  const [logs, setLogs] = useState<FraudLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await apiClient.admin.getFraudLogs({ limit: 100 })
      setLogs(res.data?.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchLogs() }, [])

  const filtered = logs.filter((log: FraudLog) =>
    log.id.toLowerCase().includes(search.toLowerCase()) ||
    log.userId?.toLowerCase().includes(search.toLowerCase()) ||
    log.decision?.toLowerCase().includes(search.toLowerCase()) ||
    log.reason?.toLowerCase().includes(search.toLowerCase())
  )

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Fraud Logs</h1>
          <p className='text-neutral-400 text-sm mt-1'>{logs.length} total entries</p>
        </div>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
          <input
            type='text' placeholder='Search logs...' value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-64 pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none'
          />
        </div>
      </motion.div>

      {loading ? (
        <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-amber-400 animate-spin' /></div>
      ) : filtered.length === 0 ? (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-12 text-center'>
            <ShieldAlert className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
            <p className='text-neutral-400'>No fraud logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {filtered.map((log) => {
            const risk = riskConfig[log.riskLevel] || riskConfig.LOW
            const RiskIcon = risk.icon
            const isExpanded = expanded === log.id

            return (
              <motion.div
                key={log.id}
                variants={itemAnim}
                className='bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden'
              >
                <div
                  className='p-4 cursor-pointer'
                  onClick={() => setExpanded(isExpanded ? null : log.id)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 min-w-0'>
                      <div className={`w-10 h-10 rounded-lg ${risk.bg} flex items-center justify-center flex-shrink-0 border`}>
                        <RiskIcon className={`w-5 h-5 ${risk.color}`} />
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${risk.bg} ${risk.color}`}>
                            {log.riskLevel}
                          </span>
                          <span className='text-xs text-neutral-500'>Score: {log.riskScore}</span>
                        </div>
                        <div className='text-xs text-neutral-400 mt-1'>
                          <span className='font-mono text-amber-400'>{log.id.slice(0, 8)}</span>
                          {' · '}
                          Decision: {log.decision}
                          {log.reason && <span> · {log.reason}</span>}
                        </div>
                      </div>
                    </div>
                    <div className='text-xs text-neutral-500 text-right'>
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className='font-mono text-amber-400/60'>{log.userId.slice(0, 8)}</div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className='border-t border-neutral-800'
                  >
                    <div className='p-4 space-y-3'>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='bg-neutral-800/50 rounded-lg p-3'>
                          <div className='text-xs text-neutral-500 mb-1'>User ID</div>
                          <div className='text-sm font-mono text-white'>{log.userId}</div>
                        </div>
                        {log.orderId && (
                          <div className='bg-neutral-800/50 rounded-lg p-3'>
                            <div className='text-xs text-neutral-500 mb-1'>Order ID</div>
                            <div className='text-sm font-mono text-white'>{log.orderId}</div>
                          </div>
                        )}
                        {log.ipAddress && (
                          <div className='bg-neutral-800/50 rounded-lg p-3'>
                            <div className='text-xs text-neutral-500 mb-1 flex items-center gap-1'>
                              <MapPin className='w-3 h-3' /> IP Address
                            </div>
                            <div className='text-sm font-mono text-white'>{log.ipAddress}</div>
                          </div>
                        )}
                        {log.deviceFingerprint && (
                          <div className='bg-neutral-800/50 rounded-lg p-3'>
                            <div className='text-xs text-neutral-500 mb-1 flex items-center gap-1'>
                              <Fingerprint className='w-3 h-3' /> Device Fingerprint
                            </div>
                            <div className='text-sm font-mono text-white truncate'>{log.deviceFingerprint}</div>
                          </div>
                        )}
                      </div>
                      {log.checks && Object.keys(log.checks).length > 0 && (
                        <div className='bg-neutral-800/50 rounded-lg p-3'>
                          <div className='text-xs text-neutral-500 mb-2'>Fraud Checks</div>
                          <pre className='text-xs text-neutral-300 font-mono whitespace-pre-wrap'>
                            {JSON.stringify(log.checks, null, 2)}
                          </pre>
                        </div>
                      )}
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
