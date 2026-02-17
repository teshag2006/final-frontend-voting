'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface QuotaProgressProps {
  used: number
  total: number
  label?: string
  showResetDate?: string
  isWarning?: boolean
}

export function QuotaProgress({
  used,
  total,
  label = 'Daily Votes',
  showResetDate,
  isWarning = false,
}: QuotaProgressProps) {
  const percentage = (used / total) * 100
  const remaining = total - used

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">
                {used} of {total} used
              </p>
            </div>
            {remaining === 0 ? (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
          </div>

          <Progress value={percentage} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">{remaining} votes remaining</span>
            {showResetDate && <span className="text-muted-foreground">Resets {showResetDate}</span>}
          </div>

          {isWarning && percentage >= 75 && (
            <p className="text-xs text-yellow-600">You're running low on your daily quota</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
