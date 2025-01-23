import { create } from 'zustand'
import { Order } from '@/types/order'

export interface OrderState {
  orders: Order[]
  selectedOrder: Order | null
  isLoading: boolean
  error: string | null
}

export interface OrderActions {
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (id: number, updates: Partial<Order>) => void
  deleteOrder: (id: number) => void
  selectOrder: (id: number) => void
  clearSelectedOrder: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useOrderStore = create<OrderState & OrderActions>((set) => ({
  // Initial state
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  // Actions
  setOrders: (orders) => set({ orders }),
  
  addOrder: (order) => set((state) => ({ 
    orders: [...state.orders, order] 
  })),
  
  updateOrder: (id, updates) => set((state) => ({
    orders: state.orders.map((order) => 
      order.id === id ? { ...order, ...updates } : order
    ),
    selectedOrder: state.selectedOrder?.id === id 
      ? { ...state.selectedOrder, ...updates }
      : state.selectedOrder
  })),
  
  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter((order) => order.id !== id),
    selectedOrder: state.selectedOrder?.id === id 
      ? null 
      : state.selectedOrder
  })),
  
  selectOrder: (id) => set((state) => ({
    selectedOrder: state.orders.find((order) => order.id === id) || null
  })),
  
  clearSelectedOrder: () => set({ selectedOrder: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error })
})) 