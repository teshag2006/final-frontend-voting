'use client';

import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type AuditActionType =
  | 'USER_CREATED'
  | 'USER_DELETED'
  | 'ROLE_ASSIGNED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_MODIFIED'
  | 'PRIVILEGE_ESCALATION'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | 'PASSWORD_RESET'
  | 'FORCE_LOGOUT';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  actor: string;
  target: string;
  details: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface RoleAuditTableProps {
  entries: AuditEntry[];
  isLoading?: boolean;
}

const actionLabels: Record<AuditActionType, string> = {
  USER_CREATED: 'User Created',
  USER_DELETED: 'User Deleted',
  ROLE_ASSIGNED: 'Role Assigned',
  ROLE_CHANGED: 'Role Changed',
  PERMISSION_MODIFIED: 'Permission Modified',
  PRIVILEGE_ESCALATION: 'Privilege Escalation',
  '2FA_ENABLED': '2FA Enabled',
  '2FA_DISABLED': '2FA Disabled',
  PASSWORD_RESET: 'Password Reset',
  FORCE_LOGOUT: 'Force Logout',
};

const riskColors: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export function RoleAuditTable({ entries, isLoading = false }: RoleAuditTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No audit records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase">LOW Risk</p>
          <p className="text-lg font-bold text-green-800">{entries.filter((e) => e.riskLevel === 'LOW').length}</p>
        </div>
        <div className="bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-600 font-semibold uppercase">MEDIUM Risk</p>
          <p className="text-lg font-bold text-yellow-800">{entries.filter((e) => e.riskLevel === 'MEDIUM').length}</p>
        </div>
        <div className="bg-red-50 px-4 py-3 rounded-lg border border-red-200">
          <p className="text-xs text-red-600 font-semibold uppercase">HIGH Risk</p>
          <p className="text-lg font-bold text-red-800">{entries.filter((e) => e.riskLevel === 'HIGH').length}</p>
        </div>
      </div>

      {/* Audit Log */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Actor</th>
              <th className="px-4 py-3 text-left font-semibold">Target</th>
              <th className="px-4 py-3 text-left font-semibold">Details</th>
              <th className="px-4 py-3 text-left font-semibold">Risk</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-sm">{actionLabels[entry.action]}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{entry.actor}</td>
                <td className="px-4 py-3 font-mono text-xs">{entry.target}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{entry.details}</td>
                <td className="px-4 py-3">
                  <Badge className={`${riskColors[entry.riskLevel]} text-xs font-semibold`}>
                    {entry.riskLevel === 'HIGH' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {entry.riskLevel}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

