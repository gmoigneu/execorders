import { fetchOrderBySlug } from '@/lib/api/orders'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

// Helper function to format dates
function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export async function OrderDetail({ 
  slug,
  fromPage
}: { 
  slug: string
  fromPage?: string
}) {
  try {
    const order = await fetchOrderBySlug(slug)
    const backUrl = fromPage ? `/?page=${fromPage}` : '/'

    return (
      <article className="space-y-4">
        <div className="mb-6">
          <Link href={backUrl} className="text-blue-500 hover:text-blue-700">
            ← Back to Executive Orders
          </Link>
        </div>
        <h1 className="text-2xl font-bold">{order.title}</h1>
        <div className="text-sm text-gray-500">
          Published: {formatDate(order.published_at)}
        </div>
        <a 
          href={order.url} 
          className="text-blue-500 hover:text-blue-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Order on the White House website
        </a>
        <h2 className="text-xl font-bold">Summary</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{order.summary}</ReactMarkdown>
        </div>
        <h2 className="text-xl font-bold">Explanation</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{order.explanation}</ReactMarkdown>
        </div>
        <footer className="mt-8 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(order.created_at)}
          </div>
        </footer>
      </article>
    )
  } catch (error) {
    console.error('Error fetching order:', error)
    notFound()
  }
} 