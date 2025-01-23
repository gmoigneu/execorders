import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
      <p className="text-gray-600 mb-4">Could not find the requested order.</p>
      <Link 
        href="/"
        className="text-blue-500 hover:underline"
      >
        Return to Orders
      </Link>
    </div>
  )
} 