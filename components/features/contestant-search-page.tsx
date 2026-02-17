'use client'

import { useState, useMemo } from 'react'
import { DebouncedSearch } from '@/components/common/debounced-search'
import { CategoryFilter } from '@/components/common/category-filter'
import { AlphabeticalJump } from '@/components/common/alphabetical-jump'
import { SortControls } from '@/components/common/sort-controls'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Filter, X } from 'lucide-react'

interface Contestant {
  id: string
  name: string
  category: string
  votes: number
}

interface ContestantSearchPageProps {
  contestants: Contestant[]
  categories: Array<{ id: string; name: string }>
  onContestantSelect: (contestant: Contestant) => void
}

const SORT_OPTIONS = [
  { id: 'name', label: 'Name (A-Z)' },
  { id: 'votes', label: 'Most Votes' },
  { id: 'recent', label: 'Recently Added' },
]

export function ContestantSearchPage({
  contestants,
  categories,
  onContestantSelect,
}: ContestantSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLetter, setSelectedLetter] = useState('')
  const [selectedSort, setSelectedSort] = useState('name')
  const [isDescending, setIsDescending] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  const filteredContestants = useMemo(() => {
    let result = [...contestants]

    // Filter by search query
    if (searchQuery) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.category))
    }

    // Filter by letter
    if (selectedLetter) {
      result = result.filter((c) =>
        c.name.toUpperCase().startsWith(selectedLetter)
      )
    }

    // Sort
    result.sort((a, b) => {
      let compareValue = 0
      switch (selectedSort) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'votes':
          compareValue = b.votes - a.votes
          break
        case 'recent':
          compareValue = 0 // Would need timestamp data
          break
      }
      return isDescending ? -compareValue : compareValue
    })

    return result
  }, [contestants, searchQuery, selectedCategories, selectedLetter, selectedSort, isDescending])

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || selectedLetter

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedLetter('')
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div>
        <DebouncedSearch
          onSearch={setSearchQuery}
          placeholder="Search contestants..."
          defaultValue={searchQuery}
        />
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Category</p>
              <CategoryFilter
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Quick Jump</p>
              <AlphabeticalJump
                onLetterClick={setSelectedLetter}
                activeLetters={selectedLetter ? [selectedLetter] : []}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>

        <SortControls
          sortOptions={SORT_OPTIONS}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          isDescending={isDescending}
          onToggleDirection={() => setIsDescending(!isDescending)}
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Found {filteredContestants.length} contestant{filteredContestants.length !== 1 ? 's' : ''}
        </p>

        {filteredContestants.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No contestants found matching your criteria</p>
            {hasActiveFilters && (
              <Button
                variant="link"
                onClick={clearFilters}
                className="mt-2"
              >
                Clear filters and try again
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredContestants.map((contestant) => (
              <Card
                key={contestant.id}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onContestantSelect(contestant)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{contestant.name}</p>
                    <p className="text-sm text-muted-foreground">{contestant.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{contestant.votes.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">votes</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
