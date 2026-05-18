'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1 }: PaginationProps) {
  if (totalPages <= 1) return null

  const generatePages = () => {
    const pages: (number | string)[] = []
    const totalNumbers = siblingCount * 2 + 3 // siblings + current + first + last + 2 dots max
    const totalBlocks = totalNumbers + 2 // +2 for potential dots

    if (totalPages <= totalBlocks) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
      return [...leftRange, '...', totalPages]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1)
      return [1, '...', ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i)
      return [1, '...', ...middleRange, '...', totalPages]
    }

    return pages
  }

  const pages = generatePages()

  return (
    <div className='flex items-center justify-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        className='border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30'
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className='w-4 h-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        className='border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className='w-4 h-4' />
      </Button>

      <div className='flex items-center gap-1'>
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className='px-2 text-neutral-500'>
                ...
              </span>
            )
          }

          const pageNum = page as number
          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? 'default' : 'outline'}
              size='sm'
              className={
                currentPage === pageNum
                  ? 'bg-violet-600 hover:bg-violet-500 text-white min-w-9'
                  : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white min-w-9'
              }
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      <Button
        variant='outline'
        size='sm'
        className='border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className='w-4 h-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        className='border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30'
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className='w-4 h-4' />
      </Button>
    </div>
  )
}
