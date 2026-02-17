'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState, useMemo } from 'react'

interface Activity {
  id: string
  action: string
  user: string
  type: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject'
  timestamp: string
  details?: string
}

interface ActivityLogProps {
  activities: Activity[]
  maxItems?: number
  onSearch?: (query: string) => void
}

const typeColors = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  view: 'bg-gray-100 text-gray-800',
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
}

export function ActivityLog({
  activities,
  maxItems = 50,
  onSearch,
}: ActivityLogProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredActivities = useMemo(() => {
    let result = [...activities]

    if (searchQuery) {
      result = result.filter(
        (activity) =>
          activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.details?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return result.slice(0, maxItems)
  }, [activities, searchQuery, maxItems])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>View recent system activities and user actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activities found</p>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 border rounded hover:bg-muted/50 transition-colors"
              >
                <Badge className={typeColors[activity.type]}>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.user} • {activity.timestamp}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {activities.length > maxItems && (
          <p className="text-xs text-muted-foreground text-center">
            Showing {filteredActivities.length} of {activities.length} activities
          </p>
        )}
      </CardContent>
    </Card>
  )
}
