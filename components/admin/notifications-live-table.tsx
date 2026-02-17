'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationSeverityBadge } from './notification-severity-badge';
import { type Notification } from '@/types/notifications';
import { Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface NotificationsLiveTableProps {
  notifications: Notification[];
  isLoading?: boolean;
  onViewDetails: (notification: Notification) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function NotificationsLiveTable({
  notifications,
  isLoading,
  onViewDetails,
  onStatusChange,
}: NotificationsLiveTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Notification ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Triggered By</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="whitespace-nowrap">Notification ID</TableHead>
            <TableHead className="whitespace-nowrap">Type</TableHead>
            <TableHead className="whitespace-nowrap">Severity</TableHead>
            <TableHead className="whitespace-nowrap">Title</TableHead>
            <TableHead className="whitespace-nowrap">Module</TableHead>
            <TableHead className="whitespace-nowrap">Triggered By</TableHead>
            <TableHead className="whitespace-nowrap">Timestamp</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((notification) => (
            <TableRow
              key={notification.id}
              className={`hover:bg-muted/50 transition-colors ${notification.status === 'NEW' ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
            >
              <TableCell className="font-mono text-xs whitespace-nowrap">{notification.id}</TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline" className="text-xs">
                  {notification.type}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <NotificationSeverityBadge severity={notification.severity} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm max-w-xs truncate">{notification.title}</TableCell>
              <TableCell className="whitespace-nowrap text-sm">{notification.module}</TableCell>
              <TableCell className="whitespace-nowrap text-sm">{notification.triggeredBy}</TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {new Date(notification.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge
                  variant={
                    notification.status === 'NEW'
                      ? 'default'
                      : notification.status === 'RESOLVED'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="text-xs"
                >
                  {notification.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(notification)}
                    className="h-8 w-8 p-0"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {notification.status === 'NEW' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStatusChange?.(notification.id, 'READ')}
                      className="h-8 w-8 p-0"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
