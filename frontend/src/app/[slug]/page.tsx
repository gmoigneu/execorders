import { OrderDetail } from '@/components/orders/order-detail'
import { Suspense } from 'react'
import { fetchOrderBySlug } from '@/lib/api/orders'
import { Metadata } from 'next'

// Add route segment config
export const revalidate = 3600 // revalidate every hour

type Props = {
  params: { slug: string }
}

interface OrderDetailProps {
  params: { slug: string }
}

// Helper function to safely format dates for metadata
function formatMetadataDate(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z'
}

export async function generateMetadata(
  { params }: OrderDetailProps,
): Promise<Metadata> {
  const slug = (await params).slug
  const order = await fetchOrderBySlug(slug)
  
  const publishedTime = formatMetadataDate(order.published_at)
  const modifiedTime = formatMetadataDate(order.created_at)

  return {
    title: 'Executive Order: ' + order.title,
    description: order.excerpt,
    openGraph: {
      title: 'Executive Order: ' + order.title,
      description: order.excerpt || 'Executive Order details',
      type: 'article',
      publishedTime,
      modifiedTime,
      url: order.url,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Executive Order: ' + order.title,
      description: order.excerpt || 'Executive Order details',
    }
  }
}

export default function OrderPage({ params }: Props) {
  return (
    <main className="container mx-auto p-4">
      <Suspense fallback={<div>Loading order...</div>}>
        <OrderDetail slug={params.slug} />
      </Suspense>
    </main>
  )
} 