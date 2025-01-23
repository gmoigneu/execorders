import { OrderDetail } from '@/components/orders/order-detail'
import { Suspense } from 'react'
import { fetchOrderBySlug } from '@/lib/api/orders'

// Add route segment config
export const revalidate = 3600 // revalidate every hour

import { use } from 'react'

type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
 

// Helper function to safely format dates for metadata
function formatMetadataDate(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z'
}

export async function generateMetadata({ params }: { params: Params }) {
  const {slug} = await params
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

export default function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const params = use(props.params)
  const searchParams = use(props.searchParams)
  const { slug } = params
  const { from } = searchParams

  return (
    <main className="container mx-auto p-4">
      <Suspense fallback={<div>Loading order...</div>}>
        <OrderDetail 
          slug={slug}
          fromPage={from as string}
        />
      </Suspense>
    </main>
  )
} 