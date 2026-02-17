'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight } from 'lucide-react'

interface FraudCaseCardProps {
  id: string
  caseId: string
  severity: 'high' | 'medium' | 'low'
  reason: string
  userInfo: string
  votes: number
  date: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  onReview: (caseId: string) => void
}

const severityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
}

const statusColors = {
  open: 'bg-gray-100 text-gray-800',
  investigating: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-600',
}

export function FraudCaseCard({
  id,
  caseId,
  severity,
  reason,
  userInfo,
  votes,
  date,
  status,
  onReview,
}: FraudCaseCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
            <div>
              <p className="font-semibold text-sm">Case #{caseId}</p>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
          </div>
          <Badge className={severityColors[severity]}>{severity.toUpperCase()}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Reason</p>
          <p className="text-sm">{reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">User</p>
            <p className="text-sm font-medium">{userInfo}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Suspicious Votes</p>
            <p className="text-sm font-medium">{votes}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onReview(id)}
          className="w-full gap-2"
        >
          Review Case
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
