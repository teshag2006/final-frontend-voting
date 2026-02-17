'use client'

import { useVirtualScroll } from '@/hooks/useVirtualScroll'
import { Loader2 } from 'lucide-react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight?: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  isLoading?: boolean
  loadMoreText?: string
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight = 600,
  renderItem,
  overscan = 5,
  isLoading = false,
  loadMoreText = 'Loading...',
}: VirtualListProps<T>) {
  const { containerRef, virtualItems, totalHeight } = useVirtualScroll({
    items,
    itemHeight,
    containerHeight,
    overscan,
  })

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto border rounded-lg"
      style={{ height: `${containerHeight}px` }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {virtualItems.map((virtualItem) => (
          <div
            key={`${virtualItem.index}-${items[virtualItem.index]}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${itemHeight}px`,
              transform: `translateY(${virtualItem.offset}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">{loadMoreText}</span>
        </div>
      )}
    </div>
  )
}
