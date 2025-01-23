'use client'

import { type ReactNode } from 'react'
import { OrderStoreProvider } from './order-store-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OrderStoreProvider>
      {/* Other providers can be nested here */}
      {children}
    </OrderStoreProvider>
  )
} 