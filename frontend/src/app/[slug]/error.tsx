'use client'

export default function Error() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600">Failed to load the order.</p>
    </div>
  )
} 