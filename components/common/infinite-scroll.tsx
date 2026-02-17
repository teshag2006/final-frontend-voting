'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollProps {
  children: React.ReactNode
  onLoadMore: () => void
  isLoading?: boolean
  hasMore?: boolean
  threshold?: number
}

export function InfiniteScroll({
  children,
  onLoadMore,
  isLoading = false,
  hasMore = true,
  threshold = 200,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [hasObserver, setHasObserver] = useState(false)

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          onLoadMore()
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    )

    observer.observe(sentinelRef.current)
    setHasObserver(true)

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current)
      }
    }
  }, [isLoading, hasMore, onLoadMore, threshold])

  return (
    <div className="space-y-6">
      {children}

      {hasObserver && hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
