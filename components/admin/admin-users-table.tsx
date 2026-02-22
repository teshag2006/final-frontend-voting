'use client';

import { MoreVertical, Eye, Edit2, Shield, Lock, LogOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleBadge, type RoleType } from './role-badge';
import { AdminStatusBadge, type AdminStatusType } from './admin-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export interface AdminUserData {
  id: string;
  fullName: string;
  email: string;
  role: RoleType;
  is2FAEnabled: boolean;
  status: AdminStatusType;
  lastLogin: string;
  createdAt: string;
}

interface AdminUsersTableProps {
  users: AdminUserData[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (column: string, order: string) => void;
  onView?: (user: AdminUserData) => void;
  onEdit?: (user: AdminUserData) => void;
  onAssignRole?: (user: AdminUserData) => void;
  onDisable?: (user: AdminUserData) => void;
  onForceLogout?: (user: AdminUserData) => void;
  onResetPassword?: (user: AdminUserData) => void;
  onToggle2FA?: (user: AdminUserData) => void;
}

export function AdminUsersTable({
  users,
  isLoading = false,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange,
  onView,
  onEdit,
  onAssignRole,
  onDisable,
  onForceLogout,
  onResetPassword,
  onToggle2FA,
}: AdminUsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">User ID</th>
            <th className="px-4 py-3 text-left font-semibold">Full Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Role</th>
            <th className="px-4 py-3 text-center font-semibold">2FA</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Last Login</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{user.id}</td>
              <td className="px-4 py-3 font-medium">{user.fullName}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <RoleBadge role={user.role} size="sm" />
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-lg">{user.is2FAEnabled ? '✓' : '✗'}</span>
              </td>
              <td className="px-4 py-3">
                <AdminStatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(user.lastLogin)}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onView?.(user)} className="cursor-pointer">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(user)} className="cursor-pointer">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAssignRole?.(user)} className="cursor-pointer">
                      <Shield className="h-4 w-4 mr-2" />
                      Assign Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onResetPassword?.(user)} className="cursor-pointer">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggle2FA?.(user)} className="cursor-pointer">
                      <Lock className="h-4 w-4 mr-2" />
                      {user.is2FAEnabled ? 'Disable' : 'Enable'} 2FA
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onForceLogout?.(user)} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Force Logout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDisable?.(user)} className="cursor-pointer text-destructive">
                      <Lock className="h-4 w-4 mr-2" />
                      Disable User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
