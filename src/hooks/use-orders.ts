'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'
import type { Order, OrderStatus, PaginatedResponse, DeliveredKey } from '@/types/api'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [orderKeys, setOrderKeys] = useState<Record<string, DeliveredKey[]>>({})
  const [loadingKeys, setLoadingKeys] = useState<string | null>(null)

  const fetchOrders = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.orders.list({ page, limit })
      const data = response.data
      if (Array.isArray(data)) {
        setOrders(data)
        setTotal(data.length)
        setTotalPages(1)
      } else {
        const paginated = data as PaginatedResponse<Order>
        setOrders(paginated.data || [])
        setTotal(paginated.total || 0)
        setCurrentPage(paginated.page || 1)
        setTotalPages(paginated.totalPages || 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchOrderById = useCallback(async (id: string) => {
    setIsLoadingOrder(true)
    setError(null)
    try {
      const response = await apiClient.orders.getById(id)
      setSelectedOrder(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order')
    } finally {
      setIsLoadingOrder(false)
    }
  }, [])

  const cancelOrder = useCallback(async (id: string) => {
    try {
      const response = await apiClient.orders.cancel(id)
      setOrders(prev =>
        prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' as OrderStatus } : o)
      )
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'CANCELLED' as OrderStatus } : null)
      }
      return { success: true, data: response.data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to cancel order' }
    }
  }, [selectedOrder])

  const downloadKeys = useCallback(async (orderId: string) => {
    if (orderKeys[orderId]) return orderKeys[orderId]
    setLoadingKeys(orderId)
    try {
      const response = await apiClient.orders.downloadKeys(orderId)
      const keys = response.data?.keys || []
      setOrderKeys(prev => ({ ...prev, [orderId]: keys }))
      return keys
    } catch (err) {
      console.error('[useOrders] Failed to download keys:', err)
      return []
    } finally {
      setLoadingKeys(null)
    }
  }, [orderKeys])

  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null)
  }, [])

  return {
    orders,
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    selectedOrder,
    isLoadingOrder,
    orderKeys,
    loadingKeys,
    fetchOrders,
    fetchOrderById,
    cancelOrder,
    downloadKeys,
    clearSelectedOrder,
  }
}
