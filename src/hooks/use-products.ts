'use client'

import { useState, useCallback, useMemo } from 'react'

export interface Product {
  id: number
  title: string
  price: number
  originalPrice?: number
  category: string
  platform: string
  rating: number
  reviews: number
  badge?: string | null
  inStock: boolean
  image?: string
  description?: string
}

export interface ProductFilters {
  category?: string
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

  const fetchProducts = useCallback(async (_filters?: ProductFilters) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call when backend is available
      // const endpoint = new URL('/products', apiClient.baseURL)
      // if (filters?.category) endpoint.searchParams.set('category', filters.category)
      // const response = await apiClient.get<Product[]>(endpoint.toString())
      // setProducts(response.data)
      
      // Simulated data for demo
      const mockProducts: Product[] = [
        {
          id: 1,
          title: 'Steam Gift Card $50',
          price: 50.0,
          originalPrice: 55.0,
          category: 'Gift Cards',
          platform: 'Steam',
          rating: 4.8,
          reviews: 2847,
          badge: 'Featured',
          inStock: true,
        },
        {
          id: 2,
          title: 'Microsoft 365 Personal (1 Year)',
          price: 69.99,
          originalPrice: 99.99,
          category: 'Office Suites',
          platform: 'Microsoft',
          rating: 4.9,
          reviews: 1923,
          badge: 'Best Seller',
          inStock: true,
        },
      ]
      
      setProducts(mockProducts)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.category && product.category !== filters.category) {
        return false
      }
      if (filters.platform && product.platform !== filters.platform) {
        return false
      }
      if (filters.minPrice && product.price < filters.minPrice) {
        return false
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          product.title.toLowerCase().includes(searchLower) ||
          product.platform.toLowerCase().includes(searchLower)
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
    fetchProducts,
    updateFilters,
    clearFilters,
  }
}
