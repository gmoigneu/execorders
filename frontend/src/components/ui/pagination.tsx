'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={createPageURL(currentPage - 1)}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Previous
        </Link>
      )}
      
      {[...Array(totalPages)].map((_, i) => {
        const pageNumber = i + 1
        const isCurrentPage = pageNumber === currentPage

        return (
          <Link
            key={pageNumber}
            href={createPageURL(pageNumber)}
            className={`px-4 py-2 text-sm border rounded ${
              isCurrentPage 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-50'
            }`}
          >
            {pageNumber}
          </Link>
        )
      })}

      {currentPage < totalPages && (
        <Link
          href={createPageURL(currentPage + 1)}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Next
        </Link>
      )}
    </div>
  )
} 