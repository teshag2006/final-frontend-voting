'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationSeverityBadge } from './notification-severity-badge';
import { type AlertRule } from '@/types/notifications';
import { Edit2, ToggleLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AlertRulesTableProps {
  rules: AlertRule[];
  isLoading?: boolean;
  onEdit?: (rule: AlertRule) => void;
  onToggle?: (id: string, enabled: boolean) => void;
  onDelete?: (id: string) => void;
}

export function AlertRulesTable({ rules, isLoading, onEdit, onToggle, onDelete }: AlertRulesTableProps) {
  const [toggledRuleIds, setToggledRuleIds] = useState<Set<string>>(new Set());

  const handleToggle = (rule: AlertRule) => {
    setToggledRuleIds((prev) => {
      const next = new Set(prev);
      next.has(rule.id) ? next.delete(rule.id) : next.add(rule.id);
      return next;
    });
    onToggle?.(rule.id, !rule.enabled);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Rule Name</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Trigger Condition</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead>Last Triggered</TableHead>
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
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
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
            <TableHead className="whitespace-nowrap">Rule Name</TableHead>
            <TableHead className="whitespace-nowrap">Module</TableHead>
            <TableHead className="whitespace-nowrap">Trigger Condition</TableHead>
            <TableHead className="whitespace-nowrap">Severity</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Channels</TableHead>
            <TableHead className="whitespace-nowrap">Last Triggered</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium whitespace-nowrap">{rule.name}</TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline" className="text-xs">
                  {rule.module}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm max-w-xs truncate">{rule.triggerCondition}</TableCell>
              <TableCell className="whitespace-nowrap">
                <NotificationSeverityBadge severity={rule.severity} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-xs">
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs">
                <div className="flex gap-1 flex-wrap">
                  {rule.channels.map((channel) => (
                    <Badge key={channel} variant="outline" className="text-xs">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(rule)}
                    className="h-8 w-8 p-0"
                    title={rule.enabled ? 'Disable' : 'Enable'}
                  >
                    <ToggleLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(rule)}
                    className="h-8 w-8 p-0"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(rule.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

