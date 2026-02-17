import { useEffect, useRef, useState, useCallback } from 'react'

interface UseVirtualScrollProps {
  items: unknown[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface VirtualItem {
  index: number
  offset: number
}

export function useVirtualScroll({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)

  const virtualItems: VirtualItem[] = []
  for (let i = startIndex; i < endIndex; i++) {
    virtualItems.push({
      index: i,
      offset: i * itemHeight,
    })
  }

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const totalHeight = items.length * itemHeight

  return {
    containerRef,
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
  }
}
