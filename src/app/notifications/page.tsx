'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  AlertCircle,
  Loader2,
  Check,
  CheckCheck,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SectionHero from '@/components/layout/SectionHero'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/hooks/use-auth'
import { useNotifications } from '@/hooks/use-notifications'

const typeIcons: Record<string, React.ElementType> = {
  EMAIL: Mail,
  DISCORD: MessageSquare,
  TELEGRAM: Send,
  WEBHOOK: AlertCircle,
}

const statusColors: Record<string, string> = {
  PENDING: 'border-amber-500/50 text-amber-400 bg-amber-500/10',
  SENT: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
  FAILED: 'border-red-500/50 text-red-400 bg-red-500/10',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    notifications,
    isLoading,
    unreadCount,
    currentPage,
    totalPages,
    total,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/notifications')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(1, 20)
    }
  }, [isAuthenticated, fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.readAt) return false
    if (filter === 'read' && !n.readAt) return false
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    return true
  })

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
        title='Notifications'
        subtitle='Stay updated with your account activity and order status'
        badge={unreadCount > 0 ? (
          <Badge className='bg-violet-600 text-white border-0 text-xs'>
            {unreadCount} unread
          </Badge>
        ) : undefined}
      />

      <section className='py-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Toolbar */}
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
            <div className='flex items-center gap-2 flex-wrap'>
              {(['all', 'unread', 'read'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setFilter(f)}
                  className={filter === f ? 'bg-violet-600' : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800'}
                >
                  {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
                </Button>
              ))}
              <div className='w-px h-6 bg-neutral-700 mx-2' />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className='bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-neutral-300'
              >
                <option value='all'>All Types</option>
                <option value='EMAIL'>Email</option>
                <option value='DISCORD'>Discord</option>
                <option value='TELEGRAM'>Telegram</option>
                <option value='WEBHOOK'>Webhook</option>
              </select>
            </div>

            {unreadCount > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleMarkAllAsRead}
                className='border-neutral-700 text-neutral-400 hover:bg-neutral-800'
              >
                <CheckCheck className='w-4 h-4 mr-2' />
                Mark All Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className='flex justify-center py-16'>
              <Loader2 className='w-10 h-10 text-violet-400 animate-spin' />
            </div>
          ) : filteredNotifications.length > 0 ? (
            <>
              <div className='space-y-3'>
                {filteredNotifications.map((notification, index) => {
                  const IconComponent = typeIcons[notification.type] || Bell
                  const isUnread = !notification.readAt

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <Card
                        className={`border transition-all cursor-pointer ${
                          isUnread
                            ? 'bg-violet-600/5 border-violet-500/20 hover:border-violet-500/40'
                            : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                        }`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CardContent className='p-5'>
                          <div className='flex items-start gap-4'>
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isUnread ? 'bg-violet-600/20' : 'bg-neutral-800/50'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                isUnread ? 'text-violet-400' : 'text-neutral-500'
                              }`} />
                            </div>

                            {/* Content */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h4 className={`font-medium ${
                                  isUnread ? 'text-white' : 'text-neutral-300'
                                }`}>
                                  {notification.subject}
                                </h4>
                                {isUnread && (
                                  <span className='w-2 h-2 bg-violet-500 rounded-full flex-shrink-0' />
                                )}
                              </div>
                              <p className='text-sm text-neutral-400 line-clamp-2 mb-2'>
                                {notification.content}
                              </p>
                              <div className='flex items-center gap-3 text-xs text-neutral-500'>
                                <span className='flex items-center gap-1'>
                                  <Clock className='w-3 h-3' />
                                  {formatDate(notification.createdAt)}
                                </span>
                                <Badge
                                  variant='outline'
                                  className={`text-xs ${statusColors[notification.status] || 'border-neutral-500/50 text-neutral-400'}`}
                                >
                                  {notification.status}
                                </Badge>
                                <Badge variant='outline' className='text-xs border-neutral-600 text-neutral-500'>
                                  {notification.type}
                                </Badge>
                              </div>
                            </div>

                            {/* Action */}
                            {isUnread && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id)
                                }}
                                className='text-neutral-500 hover:text-emerald-400 transition-colors flex-shrink-0'
                                title='Mark as read'
                              >
                                <Check className='w-4 h-4' />
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-8'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchNotifications(page, 20)}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon='inbox'
              title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              description={
                filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."
              }
              actionLabel='Browse Products'
              actionHref='/products'
            />
          )}

          {/* Summary */}
          {!isLoading && total > 0 && (
            <div className='mt-8 text-center text-sm text-neutral-500'>
              Showing {filteredNotifications.length} of {total} notifications
              {unreadCount > 0 && ` (${unreadCount} unread)`}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
