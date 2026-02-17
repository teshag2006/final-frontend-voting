'use client';

import { MoreVertical, Edit2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { RoleBadge, type RoleType } from './role-badge';

export interface RoleData {
  id: string;
  name: RoleType;
  description: string;
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
}

interface RolesTableProps {
  roles: RoleData[];
  isLoading?: boolean;
  onEdit?: (role: RoleData) => void;
  onAssignPermissions?: (role: RoleData) => void;
  onDeactivate?: (role: RoleData) => void;
}

export function RolesTable({ roles, isLoading = false, onEdit, onAssignPermissions, onDeactivate }: RolesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No roles found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Role Name</th>
            <th className="px-4 py-3 text-left font-semibold">Description</th>
            <th className="px-4 py-3 text-center font-semibold">Users</th>
            <th className="px-4 py-3 text-left font-semibold">Type</th>
            <th className="px-4 py-3 text-left font-semibold">Created</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <RoleBadge role={role.name} size="sm" />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{role.description}</td>
              <td className="px-4 py-3 text-center font-semibold">{role.userCount}</td>
              <td className="px-4 py-3">
                <span className="text-xs font-semibold bg-muted px-2 py-1 rounded">
                  {role.isSystemRole ? 'System' : 'Custom'}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(role.createdAt)}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {!role.isSystemRole && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit?.(role)} className="cursor-pointer">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => onAssignPermissions?.(role)} className="cursor-pointer">
                      <Lock className="h-4 w-4 mr-2" />
                      Manage Permissions
                    </DropdownMenuItem>
                    {!role.isSystemRole && role.userCount === 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDeactivate?.(role)} className="cursor-pointer text-destructive">
                          <Lock className="h-4 w-4 mr-2" />
                          Deactivate Role
                        </DropdownMenuItem>
                      </>
                    )}
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
