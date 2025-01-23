'use client'

import { type ReactNode, createContext, useRef } from 'react'
import { type StoreApi } from 'zustand'
import { useOrderStore } from '@/stores/order-store'
import { type OrderState, type OrderActions } from '@/stores/order-store'

const OrderStoreContext = createContext<StoreApi<OrderState & OrderActions> | null>(null)

export function OrderStoreProvider({ children }: { children: ReactNode }) {
  const store = useRef(useOrderStore).current
  
  return (
    <OrderStoreContext.Provider value={store}>
      {children}
    </OrderStoreContext.Provider>
  )
} 