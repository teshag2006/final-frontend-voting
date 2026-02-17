'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Action {
  id: string
  label: string
  variant?: 'default' | 'destructive' | 'outline'
  onClick: () => void
  disabled?: boolean
}

interface BulkActionToolbarProps {
  selectedCount: number
  actions: Action[]
  onClearSelection: () => void
}

export function BulkActionToolbar({
  selectedCount,
  actions,
  onClearSelection,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <Card className="sticky bottom-0 z-50 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{selectedCount} selected</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
