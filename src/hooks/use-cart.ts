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
      // Use allSettled so one failed item doesn't block the rest
      const results = await Promise.allSettled(
        items.map((item) => apiClient.cart.addItem(item.productId, item.quantity)),
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        console.warn(
          `[useCart] syncCartToServer: ${failed.length}/${items.length} items failed to sync`,
        )
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
      const existingItem = items.find((i) => i.id === item.id)
      addItemToStore(item)
      if (isAuthenticated) {
        try {
          // Send the updated quantity (existing + 1) to stay in sync with local state
          const qty = existingItem ? existingItem.quantity + 1 : 1
          await apiClient.cart.addItem(item.productId, qty)
        } catch (err) {
          console.error('[useCart] addItem server sync failed:', err)
        }
      }
    },
    [addItemToStore, isAuthenticated, items],
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
    [removeItemFromStore, isAuthenticated, items],
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
    [updateQuantityInStore, isAuthenticated, items],
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
