import { OrderList } from '@/components/orders/order-list'
import { Suspense } from 'react'
import { Metadata } from 'next'

// Add route segment config
export const revalidate = 3600 // revalidate every hour

export const metadata: Metadata = {
  title: 'Executive Orders',
  description: 'Browse and read executive orders from the White House.',
  openGraph: {
    title: 'Executive Orders',
    description: 'Browse and read executive orders from the White House.',
    type: 'website'
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Executive Orders from President Donald J. Trump</h1>

      <p className="text-lg text-gray-700 mb-4">
        This page provides a comprehensive list of executive orders issued by President Donald J. Trump during his presidency. Executive orders are official documents that outline policies or actions that the President wishes to implement without needing Congressional approval. Browse through the list to learn more about the key initiatives and decisions made by the Trump administration.
      </p>

      <p className="text-lg text-gray-700 mb-4">
        Each order has a summary and explanation of the order, and is linked to the original document on the White House website.
      </p>
      
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrderList page={page} />
      </Suspense>
    </main>
  )
}
