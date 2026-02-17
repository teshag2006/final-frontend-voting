'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RateLimitCounter } from '@/types/cache-monitor';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface CacheRateLimitsTabProps {
  counters: RateLimitCounter[];
  isLoading?: boolean;
  onResetCounter?: (id: string) => Promise<void>;
  onBlockIP?: (ip: string) => Promise<void>;
}

export function CacheRateLimitsTab({
  counters,
  isLoading = false,
  onResetCounter,
  onBlockIP,
}: CacheRateLimitsTabProps) {
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [blockingIP, setBlockingIP] = useState<string | null>(null);

  const handleReset = async (id: string) => {
    if (!onResetCounter) return;
    setResettingId(id);
    try {
      await onResetCounter(id);
    } catch (error) {
      console.error('Failed to reset counter:', error);
    } finally {
      setResettingId(null);
    }
  };

  const handleBlock = async (ip: string) => {
    if (!onBlockIP) return;
    setBlockingIP(ip);
    try {
      await onBlockIP(ip);
    } catch (error) {
      console.error('Failed to block IP:', error);
    } finally {
      setBlockingIP(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESET':
        return 'bg-green-50 border-green-200';
      case 'ACTIVE':
        return 'bg-blue-50 border-blue-200';
      case 'APPROACHING':
        return 'bg-yellow-50 border-yellow-200';
      case 'EXCEEDED':
        return 'bg-red-50 border-red-200';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESET':
        return <Badge variant="outline">Reset</Badge>;
      case 'ACTIVE':
        return <Badge variant="secondary">Active</Badge>;
      case 'APPROACHING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Approaching</Badge>;
      case 'EXCEEDED':
        return <Badge variant="destructive">Exceeded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="h-96 rounded-lg bg-muted animate-pulse" />;
  }

  const exceededCount = counters.filter((c) => c.status === 'EXCEEDED').length;
  const approachingCount = counters.filter((c) => c.status === 'APPROACHING').length;

  return (
    <div className="space-y-4">
      {/* Alert Cards */}
      {exceededCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive">{exceededCount} IPs have exceeded their rate limits</p>
              <p className="text-sm text-muted-foreground">These IPs should be monitored or blocked</p>
            </div>
          </CardContent>
        </Card>
      )}

      {approachingCount > 0 && (
        <Card className="border-yellow-200/50 bg-yellow-50/50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">{approachingCount} IPs are approaching their limits</p>
              <p className="text-sm text-yellow-700">Consider monitoring these IPs closely</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Overview</CardTitle>
          <CardDescription>Active rate limiting counters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Active</p>
              <p className="text-2xl font-bold">{counters.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exceeded</p>
              <p className="text-2xl font-bold text-destructive">{exceededCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approaching Limit</p>
              <p className="text-2xl font-bold text-yellow-600">{approachingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP Address</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead className="text-center">Usage</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Reset Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {counters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No active rate limit counters
                </TableCell>
              </TableRow>
            ) : (
              counters.map((counter) => (
                <TableRow key={counter.id} className={getStatusColor(counter.status)}>
                  <TableCell className="font-mono text-sm">{counter.ipAddress}</TableCell>
                  <TableCell className="text-sm">{counter.endpoint}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(counter.requestCount / counter.limit) * 100}
                        className="w-24"
                      />
                      <span className="text-sm whitespace-nowrap">
                        {counter.requestCount}/{counter.limit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{counter.remaining}</TableCell>
                  <TableCell className="text-sm">
                    {counter.resetTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(counter.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Reset counter"
                            disabled={resettingId === counter.id}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Rate Limit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Reset the rate limit counter for {counter.ipAddress}? The request count will be reset to 0.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end gap-2">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReset(counter.id)}>
                              Reset
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
