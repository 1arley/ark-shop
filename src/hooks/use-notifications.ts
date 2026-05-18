'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { apiClient } from '@/services/api'
import type { Notification, PaginatedResponse } from '@/types/api'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    if (!mountedRef.current) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.notifications.list({ page, limit })
      if (!mountedRef.current) return
      const data = response.data
      if (Array.isArray(data)) {
        setNotifications(data)
        setTotal(data.length)
        setTotalPages(1)
      } else {
        const paginated = data as PaginatedResponse<Notification>
        setNotifications(paginated.data || [])
        setTotal(paginated.total || 0)
        setCurrentPage(paginated.page || 1)
        setTotalPages(paginated.totalPages || 1)
      }
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    if (!mountedRef.current) return
    try {
      const response = await apiClient.notifications.countUnread()
      if (!mountedRef.current) return
      setUnreadCount(response.data?.count || 0)
    } catch {
      // Silently fail — unread count is non-critical
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.notifications.markAsRead(id)
      if (!mountedRef.current) return
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      // Revert on failure — will be corrected on next fetch
      console.error('[useNotifications] Failed to mark as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.notifications.markAllAsRead()
      if (!mountedRef.current) return
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('[useNotifications] Failed to mark all as read:', err)
    }
  }, [])

  // Auto-fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    currentPage,
    totalPages,
    total,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  }
}
