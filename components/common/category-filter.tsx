'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

interface Category {
  id: string
  name: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategories: string[]
  onCategoryChange: (categoryIds: string[]) => void
  multiple?: boolean
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryChange,
  multiple = true,
}: CategoryFilterProps) {
  const handleSelect = (categoryId: string) => {
    if (multiple) {
      const updated = selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories, categoryId]
      onCategoryChange(updated)
    } else {
      onCategoryChange([categoryId])
    }
  }

  const selectedName =
    selectedCategories.length === 1
      ? categories.find((c) => c.id === selectedCategories[0])?.name
      : selectedCategories.length > 1
        ? `${selectedCategories.length} selected`
        : 'All Categories'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {selectedName}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {categories.map((category) => (
          <DropdownMenuCheckboxItem
            key={category.id}
            checked={selectedCategories.includes(category.id)}
            onCheckedChange={() => handleSelect(category.id)}
          >
            {category.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
