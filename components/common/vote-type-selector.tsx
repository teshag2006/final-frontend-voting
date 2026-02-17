'use client'

import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface VoteType {
  id: string
  name: string
  description: string
  badge?: string
}

interface VoteTypeSelectorProps {
  voteTypes: VoteType[]
  selectedType: string
  onTypeChange: (typeId: string) => void
  disabled?: boolean
}

export function VoteTypeSelector({
  voteTypes,
  selectedType,
  onTypeChange,
  disabled = false,
}: VoteTypeSelectorProps) {
  return (
    <RadioGroup value={selectedType} onValueChange={onTypeChange} disabled={disabled}>
      <div className="space-y-3">
        {voteTypes.map((type) => (
          <div key={type.id}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={type.id} id={type.id} disabled={disabled} />
              <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{type.name}</span>
                  {type.badge && <Badge variant="secondary">{type.badge}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </Label>
            </div>
          </div>
        ))}
      </div>
    </RadioGroup>
  )
}
