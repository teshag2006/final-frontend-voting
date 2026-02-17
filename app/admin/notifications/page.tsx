'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationsLiveTable } from '@/components/admin/notifications-live-table';
import { AlertRulesTable } from '@/components/admin/alert-rules-table';
import { NotificationSeverityBadge } from '@/components/admin/notification-severity-badge';
import {
  generateNotifications,
  generateAlertRules,
  generateDeliveryLogs,
  generateTemplates,
  generateWebhookIntegrations,
  getNotificationStats,
} from '@/lib/notifications-mock';
import { type Notification, type AlertRule, type DeliveryLog } from '@/types/notifications';
import { Bell, AlertCircle, CheckCircle2, RefreshCw, Settings } from 'lucide-react';

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState(generateNotifications(50));
  const [alertRules, setAlertRules] = useState(generateAlertRules(10));
  const [deliveryLogs, setDeliveryLogs] = useState(generateDeliveryLogs(30));
  const [templates, setTemplates] = useState(generateTemplates());
  const [webhooks, setWebhooks] = useState(generateWebhookIntegrations());
  const [stats, setStats] = useState(getNotificationStats());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setNotifications(generateNotifications(50));
    setStats(getNotificationStats());
    setIsLoading(false);
  }, []);

  const handleStatusChange = (id: string, status: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status: status as any,
              readAt: status === 'READ' ? new Date() : n.readAt,
              acknowledgedAt: status === 'ACKNOWLEDGED' ? new Date() : n.acknowledgedAt,
            }
          : n
      )
    );
  };

  const handleRuleToggle = (id: string, enabled: boolean) => {
    setAlertRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
        <p className="text-muted-foreground">Centralized visibility and control over system alerts and notifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Today</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.totalToday}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-blue-600">{stats.newCount}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{stats.criticalCount}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{stats.unresolvedCount}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-destructive">{stats.failedDeliveries}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="live-notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Live Notifications ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="alert-rules">Alert Rules ({alertRules.length})</TabsTrigger>
          <TabsTrigger value="delivery-logs">Delivery Logs ({deliveryLogs.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks ({webhooks.length})</TabsTrigger>
        </TabsList>

        {/* Live Notifications Tab */}
        <TabsContent value="live-notifications" className="space-y-4">
          <NotificationsLiveTable
            notifications={notifications}
            isLoading={isLoading}
            onViewDetails={setSelectedNotification}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        {/* Alert Rules Tab */}
        <TabsContent value="alert-rules" className="space-y-4">
          <AlertRulesTable rules={alertRules} isLoading={isLoading} onToggle={handleRuleToggle} />
        </TabsContent>

        {/* Delivery Logs Tab */}
        <TabsContent value="delivery-logs" className="space-y-4">
          <div className="rounded-lg border overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Delivery ID</th>
                    <th className="px-4 py-3 text-left font-medium">Notification ID</th>
                    <th className="px-4 py-3 text-left font-medium">Channel</th>
                    <th className="px-4 py-3 text-left font-medium">Recipient</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Retries</th>
                    <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{log.id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.notificationId}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {log.channel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">{log.recipient}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={log.status === 'DELIVERED' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">{log.retryCount}</td>
                      <td className="px-4 py-3 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>Version {template.version}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Subject</p>
                    <p className="text-sm font-mono">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Variables</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.map((v) => (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{new Date(template.updatedAt).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{webhook.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">{webhook.url}</CardDescription>
                    </div>
                    <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                      {webhook.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Event Types</p>
                    <div className="flex flex-wrap gap-1">
                      {webhook.eventTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Retry Policy</p>
                      <p>
                        Max {webhook.retryPolicy.maxRetries} retries, {webhook.retryPolicy.retryDelayMs}ms delay
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Timeout</p>
                      <p>{webhook.timeout}ms</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
