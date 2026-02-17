'use client'

import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SortOption {
  id: string
  label: string
}

interface SortControlsProps {
  sortOptions: SortOption[]
  selectedSort: string
  onSortChange: (sortId: string) => void
  isDescending?: boolean
  onToggleDirection?: () => void
}

export function SortControls({
  sortOptions,
  selectedSort,
  onSortChange,
  isDescending = false,
  onToggleDirection,
}: SortControlsProps) {
  const selectedLabel = sortOptions.find((opt) => opt.id === selectedSort)?.label || 'Sort by'

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            {selectedLabel}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={selectedSort === option.id ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {onToggleDirection && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDirection}
          aria-label={`Sort ${isDescending ? 'ascending' : 'descending'}`}
        >
          <ArrowUpDown className={`h-4 w-4 transition-transform ${isDescending ? 'rotate-180' : ''}`} />
        </Button>
      )}
    </div>
  )
}
