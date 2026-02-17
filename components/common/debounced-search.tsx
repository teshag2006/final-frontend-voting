'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface DebouncedSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceDelay?: number
  defaultValue?: string
}

export function DebouncedSearch({
  onSearch,
  placeholder = 'Search...',
  debounceDelay = 300,
  defaultValue = '',
}: DebouncedSearchProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const timer = setTimeout(() => {
        onSearch(searchQuery)
        setIsSearching(false)
      }, debounceDelay)

      return () => clearTimeout(timer)
    },
    [debounceDelay, onSearch]
  )

  useEffect(() => {
    setIsSearching(true)
    return debouncedSearch(query)
  }, [query, debouncedSearch])

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
        disabled={isSearching}
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
