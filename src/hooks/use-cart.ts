'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useCartStore } from '@/stores/cart-store'
import type { CartItem } from '@/stores/cart-store'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/auth-store'

export function useCart() {
  const {
    items,
    addItem: addItemToStore,
    removeItem: removeItemFromStore,
    updateQuantity: updateQuantityInStore,
    clearCart: clearCartStore,
    setItems,
    getItemCount,
    getTotal,
  } = useCartStore()

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Sync local cart to backend after login
  const syncCartToServer = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      for (const item of items) {
        await apiClient.cart.addItem(item.productId, item.quantity)
      }
      // Fetch the server cart to get the canonical state
      const response = await apiClient.cart.get()
      const serverItems: CartItem[] = response.data.items.map((ci) => ({
        id: ci.product.id,
        productId: ci.productId,
        name: ci.product.name,
        price: ci.product.price,
        platform: ci.product.category?.name || '',
        quantity: ci.quantity,
        image: ci.product.imageUrl || undefined,
      }))
      setItems(serverItems)
    } catch (err) {
      console.error('[useCart] syncCartToServer failed:', err)
    }
  }, [isAuthenticated, items, setItems])

  const fetchFromServer = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const response = await apiClient.cart.get()
      const serverItems: CartItem[] = response.data.items.map((ci) => ({
        id: ci.product.id,
        productId: ci.productId,
        name: ci.product.name,
        price: ci.product.price,
        platform: ci.product.category?.name || '',
        quantity: ci.quantity,
        image: ci.product.imageUrl || undefined,
      }))
      setItems(serverItems)
    } catch (err) {
      console.error('[useCart] fetchFromServer failed:', err)
    }
  }, [isAuthenticated, setItems])

  // Auto-fetch server cart on mount if user is authenticated
  const fetched = useRef(false)
  const prevAuth = useRef(isAuthenticated)

  useEffect(() => {
    if (prevAuth.current !== isAuthenticated) {
      fetched.current = false
      prevAuth.current = isAuthenticated
    }
    if (fetched.current) return
    fetched.current = true
    if (!isAuthenticated) return
    fetchFromServer()
  }, [isAuthenticated, fetchFromServer])

  // Fetch cart from server (for authenticated users)
  const fetchCart = useCallback(async () => {
    await fetchFromServer()
  }, [fetchFromServer])

  const addItem = useCallback(
    async (item: Omit<CartItem, 'quantity'>) => {
      addItemToStore(item)
      if (isAuthenticated) {
        try {
          await apiClient.cart.addItem(item.productId, 1)
        } catch (err) {
          console.error('[useCart] addItem server sync failed:', err)
        }
      }
    },
    [addItemToStore, isAuthenticated]
  )

  const removeItem = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id)
      removeItemFromStore(id)
      if (isAuthenticated && item) {
        try {
          await apiClient.cart.removeItem(item.productId)
        } catch (err) {
          console.error('[useCart] removeItem server sync failed:', err)
        }
      }
    },
    [removeItemFromStore, isAuthenticated, items]
  )

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      const item = items.find((i) => i.id === id)
      updateQuantityInStore(id, quantity)
      if (isAuthenticated && item) {
        try {
          await apiClient.cart.updateItem(item.productId, quantity)
        } catch (err) {
          console.error('[useCart] updateQuantity server sync failed:', err)
        }
      }
    },
    [updateQuantityInStore, isAuthenticated, items]
  )

  const clearCart = useCallback(async () => {
    clearCartStore()
    if (isAuthenticated) {
      try {
        await apiClient.cart.clear()
      } catch (err) {
        console.error('[useCart] clearCart server sync failed:', err)
      }
    }
  }, [clearCartStore, isAuthenticated])

  const itemCount = getItemCount()
  const total = getTotal()

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    syncCartToServer,
    fetchCart,
    itemCount,
    total,
  }
}
