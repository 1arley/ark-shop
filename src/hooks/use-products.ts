'use client'

import { useState, useCallback, useMemo } from 'react'
import { apiClient } from '@/services/api'
import type { Product, ProductListParams, PaginatedResponse } from '@/types/api'

export type { Product } from '@/types/api'

export interface ProductFilters {
  category?: string
  categoryId?: string
  platform?: string
  minPrice?: number
  maxPrice?: number
  search?: string
}

export function useProducts(initialFilters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = useCallback(async (params?: ProductListParams) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.products.list({
        page: params?.page || 1,
        limit: params?.limit || 20,
        search: params?.search,
        isActive: true,
        categoryId: params?.categoryId,
      })

      // Backend may return paginated or array
      const data = response.data
      if (Array.isArray(data)) {
        setProducts(data)
        setTotalProducts(data.length)
        setTotalPages(1)
      } else {
        const paginated = data as PaginatedResponse<Product>
        setProducts(paginated.data || [])
        setTotalProducts(paginated.total || 0)
        setCurrentPage(paginated.page || 1)
        setTotalPages(paginated.totalPages || 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    // Client-side filtering is minimal — most filtering happens server-side.
    // Only apply local filters that the API doesn't support.
    return products.filter((product) => {
      if (filters.minPrice && product.price < filters.minPrice) return false
      if (filters.maxPrice && product.price > filters.maxPrice) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          product.name.toLowerCase().includes(searchLower) ||
          (product.description || '').toLowerCase().includes(searchLower)
        )
      }
      return true
    })
  }, [products, filters])

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    products: filteredProducts,
    allProducts: products,
    isLoading,
    error,
    filters,
    totalProducts,
    currentPage,
    totalPages,
    fetchProducts,
    updateFilters,
    clearFilters,
  }
}
