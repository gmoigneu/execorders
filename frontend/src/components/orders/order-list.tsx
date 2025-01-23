import Link from 'next/link'
import { fetchOrders } from '@/lib/api/orders'
import { Pagination } from '@/components/ui/pagination'

// Helper function to format dates
function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export async function OrderList({ 
  page = 1,
  per_page = 10 
}: { 
  page?: number
  per_page?: number 
}) {
  try {
    const { data: orders, total, page: currentPage } = await fetchOrders(page, per_page)
    console.log('Fetched orders:', orders.length)

    if (!orders.length) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No orders found.</p>
        </div>
      )
    }
    
    const totalPages = Math.ceil(total / per_page)
    
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          {orders.map(order => (
            <Link 
              key={order.id} 
              href={`/${order.slug}`}
              className="block p-4 border rounded-lg hover:border-gray-400 transition-colors"
            >
              <h3 className="text-lg font-semibold">{order.title}</h3>
              {order.summary && (
                <p className="text-sm text-gray-600">{order.summary}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                Published: {formatDate(order.published_at)}
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination 
            totalPages={totalPages}
            currentPage={currentPage}
          />
        )}
      </div>
    )
  } catch (error) {
    console.error('Error in OrderList:', error)
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading orders. Please try again later.</p>
      </div>
    )
  }
} 