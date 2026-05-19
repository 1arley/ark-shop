'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { apiClient } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'

const NOTIFICATION_POLL_INTERVAL = 60000

export function NotificationBadge() {
  const { isAuthenticated, user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchUnread = async () => {
      try {
        const res = await apiClient.notifications.countUnread()
        setUnreadCount(res.data.count)
      } catch (err) { console.error('[NotificationBadge] Failed to fetch unread count:', err) }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, NOTIFICATION_POLL_INTERVAL)
    const onFocus = () => fetchUnread()

    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [isAuthenticated])

  const isAdmin = user?.role && ['ADMIN', 'SUPERADMIN'].includes(user.role)

  return (
    <>
      {isAdmin ? (
        <Link
          href='/admin/notifications'
          className='relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200'
          title='Notifications'
        >
          <Bell className='w-[18px] h-[18px]' aria-hidden="true" />
          <span
            className={`absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all duration-300 ${
              mounted && unreadCount > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
            aria-live="polite"
          >
            {mounted ? (unreadCount > 99 ? '99+' : unreadCount) : 0}
          </span>
        </Link>
      ) : (
        <button
          className='relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200'
          title='Notifications'
          aria-label="Notifications"
        >
          <Bell className='w-[18px] h-[18px]' aria-hidden="true" />
          <span
            className={`absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all duration-300 ${
              mounted && unreadCount > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
            aria-live="polite"
          >
            {mounted ? (unreadCount > 99 ? '99+' : unreadCount) : 0}
          </span>
        </button>
      )}
    </>
  )
}
