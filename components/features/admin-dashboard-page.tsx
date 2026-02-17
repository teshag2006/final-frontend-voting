'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KPICard } from '@/components/common/kpi-card'
import { FraudCaseCard } from '@/components/common/fraud-case-card'
import { ActivityLog } from '@/components/common/activity-log'
import { BulkActionToolbar } from '@/components/common/bulk-action-toolbar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, LineChart, AlertTriangle, TrendingUp, Users, Coins } from 'lucide-react'

interface FraudCase {
  id: string
  caseId: string
  severity: 'high' | 'medium' | 'low'
  reason: string
  userInfo: string
  votes: number
  date: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
}

interface Activity {
  id: string
  action: string
  user: string
  type: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject'
  timestamp: string
  details?: string
}

interface AdminDashboardPageProps {
  totalVotes: number
  totalVotesChange?: number
  activeUsers: number
  activeUsersChange?: number
  revenue: number
  revenueChange?: number
  fraudCasesOpen: number
  fraudCasesOpenChange?: number
  fraudCases?: FraudCase[]
  activities?: Activity[]
  onApproveFraudCase?: (caseId: string) => void
  onRejectFraudCase?: (caseId: string) => void
  onReviewFraudCase?: (caseId: string) => void
}

export function AdminDashboardPage({
  totalVotes,
  totalVotesChange = 12,
  activeUsers,
  activeUsersChange = 8,
  revenue,
  revenueChange = 15,
  fraudCasesOpen,
  fraudCasesOpenChange = -5,
  fraudCases = [],
  activities = [],
  onApproveFraudCase,
  onRejectFraudCase,
  onReviewFraudCase,
}: AdminDashboardPageProps) {
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set())

  const handleToggleCaseSelect = (caseId: string) => {
    const updated = new Set(selectedCases)
    if (updated.has(caseId)) {
      updated.delete(caseId)
    } else {
      updated.add(caseId)
    }
    setSelectedCases(updated)
  }

  const handleSelectAll = () => {
    if (selectedCases.size === fraudCases.length) {
      setSelectedCases(new Set())
    } else {
      setSelectedCases(new Set(fraudCases.map((c) => c.id)))
    }
  }

  const bulkActions = [
    {
      id: 'approve',
      label: 'Approve',
      variant: 'default' as const,
      onClick: async () => {
        for (const caseId of selectedCases) {
          await onApproveFraudCase?.(caseId)
        }
        setSelectedCases(new Set())
      },
    },
    {
      id: 'reject',
      label: 'Reject',
      variant: 'destructive' as const,
      onClick: async () => {
        for (const caseId of selectedCases) {
          await onRejectFraudCase?.(caseId)
        }
        setSelectedCases(new Set())
      },
    },
  ]

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Votes"
          value={totalVotes.toLocaleString()}
          change={totalVotesChange}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          label="Active Users"
          value={activeUsers.toLocaleString()}
          change={activeUsersChange}
          icon={<Users className="h-5 w-5" />}
        />
        <KPICard
          label="Revenue"
          value={`$${revenue.toLocaleString()}`}
          change={revenueChange}
          icon={<Coins className="h-5 w-5" />}
        />
        <KPICard
          label="Fraud Cases Open"
          value={fraudCasesOpen}
          change={fraudCasesOpenChange}
          changeLabel="vs last week"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Votes Over Time
            </CardTitle>
            <CardDescription>Vote count for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - integrate with Recharts
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Top Contestants
            </CardTitle>
            <CardDescription>Most voted contestants this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - integrate with Recharts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Fraud Cases and Activities */}
      <Tabs defaultValue="fraud" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fraud">Fraud Cases ({fraudCases.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="fraud" className="space-y-4">
          {fraudCases.length > 0 && (
            <BulkActionToolbar
              selectedCount={selectedCases.size}
              actions={bulkActions}
              onClearSelection={() => setSelectedCases(new Set())}
            />
          )}

          {fraudCases.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No fraud cases reported
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fraudCases.map((fraudCase) => (
                <div key={fraudCase.id} className="relative">
                  {/* Checkbox Overlay */}
                  <div
                    className="absolute top-3 left-3 z-10 flex items-center gap-2 cursor-pointer"
                    onClick={() => handleToggleCaseSelect(fraudCase.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCases.has(fraudCase.id)}
                      readOnly
                      className="cursor-pointer"
                    />
                  </div>

                  <FraudCaseCard
                    {...fraudCase}
                    onReview={() => onReviewFraudCase?.(fraudCase.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog activities={activities} maxItems={20} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
