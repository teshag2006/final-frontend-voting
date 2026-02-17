'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface Feature {
  name: string
  included: boolean
}

interface PlanCardProps {
  name: string
  description: string
  price: number
  period?: string
  features: Feature[]
  isPopular?: boolean
  isCurrentPlan?: boolean
  onSelect: () => void
  badge?: string
  disabled?: boolean
}

export function PlanCard({
  name,
  description,
  price,
  period = 'month',
  features,
  isPopular = false,
  isCurrentPlan = false,
  onSelect,
  badge,
  disabled = false,
}: PlanCardProps) {
  return (
    <Card className={isPopular ? 'border-accent shadow-lg scale-105' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${price}</span>
            <span className="text-muted-foreground">/{period}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {feature.included ? (
                <Check className="h-4 w-4 text-accent" />
              ) : (
                <div className="h-4 w-4" />
              )}
              <span className={feature.included ? '' : 'line-through text-muted-foreground'}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={onSelect}
          disabled={isCurrentPlan || disabled}
          className="w-full"
          variant={isPopular ? 'default' : 'outline'}
        >
          {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  )
}
