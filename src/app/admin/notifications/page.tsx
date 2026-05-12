'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, Loader2, Mail, CheckCheck, Eye,
  EyeOff, Clock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api'
import type { Notification } from '@/types/api'

const typeStyles: Record<string, string> = {
  EMAIL: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  DISCORD: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  TELEGRAM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  WEBHOOK: 'text-neutral-400 bg-neutral-800 border-neutral-700',
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await apiClient.notifications.list({ limit: 100 })
      setNotifications(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleMarkRead = async (id: string) => {
    setMarking(id)
    try {
      await apiClient.notifications.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    } catch { } finally { setMarking(null) }
  }

  const handleMarkAllRead = async () => {
    try {
      await apiClient.notifications.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })))
    } catch { }
  }

  const unreadCount = notifications.filter(n => !n.readAt).length

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Notifications</h1>
          <p className='text-neutral-400 text-sm mt-1'>
            {notifications.length} total
            {unreadCount > 0 && <span className='text-amber-400 ml-1'>· {unreadCount} unread</span>}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead}
            className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'>
            <CheckCheck className='w-4 h-4 mr-2' />Mark All Read
          </Button>
        )}
      </motion.div>

      {loading ? (
        <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-amber-400 animate-spin' /></div>
      ) : notifications.length === 0 ? (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-12 text-center'>
            <Bell className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
            <p className='text-neutral-400'>No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-2'>
          {notifications.map((notif) => {
            const typeStyle = typeStyles[notif.type] || typeStyles.WEBHOOK
            const isRead = !!notif.readAt

            return (
              <motion.div
                key={notif.id}
                variants={itemAnim}
                className={`bg-neutral-900/50 border rounded-xl overflow-hidden transition-all duration-200 ${isRead ? 'border-neutral-800 opacity-60' : 'border-amber-500/20'
                  }`}
              >
                <div className='p-5'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex items-start gap-4 min-w-0 flex-1'>
                      <div className={`w-10 h-10 rounded-lg ${typeStyle} flex items-center justify-center flex-shrink-0 border`}>
                        <Mail className='w-5 h-5' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${typeStyle}`}>
                            {notif.type}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${notif.status === 'SENT' ? 'border-emerald-500 text-emerald-400' :
                            notif.status === 'FAILED' ? 'border-red-500 text-red-400' :
                              'border-neutral-500 text-neutral-400'
                            }`}>
                            {notif.status}
                          </span>
                          {!isRead && (
                            <span className='w-2 h-2 rounded-full bg-amber-400' />
                          )}
                        </div>
                        <h3 className='text-sm font-medium text-white'>{notif.subject}</h3>
                        <p className='text-xs text-neutral-400 mt-1 line-clamp-2'>{notif.content}</p>
                        <div className='flex items-center gap-3 mt-2 text-xs text-neutral-600'>
                          <span className='flex items-center gap-1'>
                            <Clock className='w-3 h-3' />
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                          {notif.sentAt && (
                            <span className='flex items-center gap-1'>
                              <Mail className='w-3 h-3' />
                              Sent: {new Date(notif.sentAt).toLocaleString()}
                            </span>
                          )}
                          {isRead && notif.readAt && (
                            <span className='flex items-center gap-1 text-neutral-500'>
                              <EyeOff className='w-3 h-3' />
                              Read: {new Date(notif.readAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isRead && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleMarkRead(notif.id)}
                        disabled={marking === notif.id}
                        className='border-neutral-700 text-neutral-400 flex-shrink-0'
                      >
                        {marking === notif.id
                          ? <Loader2 className='w-3.5 h-3.5 animate-spin' />
                          : <Eye className='w-3.5 h-3.5' />}
                      </Button>
                    )}
                  </div>

                  {/* Metadata */}
                  {notif.metadata && Object.keys(notif.metadata).length > 0 && (
                    <div className='mt-3 bg-neutral-800/30 rounded-lg p-3'>
                      <pre className='text-xs text-neutral-500 font-mono'>
                        {JSON.stringify(notif.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
