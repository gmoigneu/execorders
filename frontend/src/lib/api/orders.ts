import { Order } from '@/types/order'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Common fetch options for caching
const fetchOptions = {
  next: {
    revalidate: 3600 // Cache for 1 hour
  }
} as const

// Helper function to safely parse dates
function parseDate(dateString: string | null | Date): Date | null {
  if (!dateString) return null
  if (dateString instanceof Date) return dateString
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

interface PaginatedResponse {
  data: Order[]
  total: number
  page: number
  per_page: number
}

export async function fetchOrders(page = 1, per_page = 10): Promise<PaginatedResponse> {
  try {
    const url = `${API_BASE_URL}/?page=${page}&per_page=${per_page}`
    console.log('Fetching orders from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      ...fetchOptions
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const rawData = await response.json()

    // Handle both array and paginated response formats
    const data = rawData.data || rawData
    const meta = rawData.meta || {
      total: Array.isArray(rawData) ? rawData.length : 0,
      page,
      per_page
    }

    const ordersData = Array.isArray(data.orders) ? data.orders : []
    console.log('Processed orders:', ordersData)

    return {
      data: ordersData.map((order: Order) => ({
        ...order,
        published_at: parseDate(order.published_at) || new Date(),
        created_at: parseDate(order.created_at) || new Date()
      })),
      total: meta.total,
      page: meta.page,
      per_page: meta.per_page
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

export async function fetchOrderBySlug(slug: string): Promise<Order> {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      ...fetchOptions
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Check if we need to unwrap the data
    const orderData = data.order || data.data || data

    return {
      ...orderData,
      published_at: parseDate(orderData.published_at as string),
      created_at: parseDate(orderData.created_at as string) || new Date()
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
} 