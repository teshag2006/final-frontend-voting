'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  unit?: string
  icon?: React.ReactNode
}

export function KPICard({
  label,
  value,
  change,
  changeLabel = 'vs last period',
  unit,
  icon,
}: KPICardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {icon && <div className="text-muted-foreground">{icon}</div>}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
              {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
              <span className={isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : ''}>
                {isPositive ? '+' : ''}
                {change}% {changeLabel}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
