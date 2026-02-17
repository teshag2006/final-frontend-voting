'use client';

import { MoreVertical, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatTime } from '@/lib/utils';
import { RoleBadge, type RoleType } from './role-badge';

export interface SessionData {
  id: string;
  userId: string;
  userName: string;
  role: RoleType;
  ipAddress: string;
  device: string;
  location: string;
  lastActivity: string;
  expiresAt: string;
}

interface ActiveSessionsTableProps {
  sessions: SessionData[];
  isLoading?: boolean;
  onForceLogout?: (session: SessionData) => void;
  onRevokeAllUserSessions?: (userId: string) => void;
}

export function ActiveSessionsTable({
  sessions,
  isLoading = false,
  onForceLogout,
  onRevokeAllUserSessions,
}: ActiveSessionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No active sessions</p>
      </div>
    );
  }

  const uniqueUsers = Array.from(new Set(sessions.map((s) => s.userId)));

  return (
    <div className="space-y-4">
      {/* Session Count Summary */}
      <div className="bg-muted/50 px-4 py-3 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>{sessions.length}</strong> active sessions from <strong>{uniqueUsers.length}</strong> unique users
        </p>
      </div>

      {/* Sessions Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Session ID</th>
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">IP Address</th>
              <th className="px-4 py-3 text-left font-semibold">Device</th>
              <th className="px-4 py-3 text-left font-semibold">Location</th>
              <th className="px-4 py-3 text-left font-semibold">Last Activity</th>
              <th className="px-4 py-3 text-left font-semibold">Expires</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{session.id.slice(0, 8)}...</td>
                <td className="px-4 py-3 font-medium">{session.userName}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={session.role} size="sm" />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{session.ipAddress}</td>
                <td className="px-4 py-3 text-sm">{session.device}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{session.location}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatTime(session.lastActivity)} ({formatDate(session.lastActivity)})
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(session.expiresAt)}</td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onForceLogout?.(session)} className="cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        Force Logout
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRevokeAllUserSessions?.(session.userId)}
                        className="cursor-pointer text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Revoke All Sessions
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
