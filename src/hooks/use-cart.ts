'use client'

import { useCallback } from 'react'
import { useCartStore } from '@/stores/cart-store'
import type { CartItem } from '@/stores/cart-store'

export function useCart() {
  const {
    items,
    addItem: addItemToStore,
    removeItem: removeItemFromStore,
    updateQuantity: updateQuantityInStore,
    clearCart: clearCartStore,
    getItemCount,
    getTotal,
  } = useCartStore()

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>) => {
      addItemToStore(item)
    },
    [addItemToStore]
  )

  const removeItem = useCallback(
    (id: number) => {
      removeItemFromStore(id)
    },
    [removeItemFromStore]
  )

  const updateQuantity = useCallback(
    (id: number, quantity: number) => {
      updateQuantityInStore(id, quantity)
    },
    [updateQuantityInStore]
  )

  const clearCart = useCallback(() => {
    clearCartStore()
  }, [clearCartStore])

  const itemCount = getItemCount()
  const total = getTotal()

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    total,
  }
}
