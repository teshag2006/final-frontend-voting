'use client';

import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleBadge, type RoleType } from './role-badge';
export type { RoleType };

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

export interface PermissionData {
  module: string;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  isSensitive?: boolean;
}

export interface RolePermissionData {
  role: RoleType;
  permissions: PermissionData[];
}

interface PermissionsMatrixProps {
  roles: RoleType[];
  permissions: Record<RoleType, PermissionData[]>;
  isLoading?: boolean;
  onPermissionChange?: (
    role: RoleType,
    module: string,
    action: PermissionAction,
    value: boolean
  ) => void;
  readOnly?: boolean;
}

const modules = [
  'Dashboard',
  'Events',
  'Categories',
  'Contestants',
  'Votes',
  'Payments',
  'Fraud',
  'Reports',
  'Blockchain',
  'Audit Logs',
  'Users',
  'Settings',
  'Jobs',
  'Cache',
  'Health',
];

const roleLabels: Record<RoleType, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  FINANCE_ADMIN: 'Finance Admin',
  FRAUD_ADMIN: 'Fraud Admin',
  MEDIA_ADMIN: 'Media Admin',
  VIEW_ONLY_ADMIN: 'View Only',
};

const allowedRoles: RoleType[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'FINANCE_ADMIN',
  'FRAUD_ADMIN',
  'MEDIA_ADMIN',
  'VIEW_ONLY_ADMIN',
];

export function PermissionsMatrix({
  roles,
  permissions,
  isLoading = false,
  onPermissionChange,
  readOnly = false,
}: PermissionsMatrixProps) {
  const availableRoles = useMemo(
    () => roles.filter((role): role is RoleType => allowedRoles.includes(role)),
    [roles]
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        No roles available for permission mapping.
      </div>
    );
  }

  return (
    <Tabs defaultValue={availableRoles[0]} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {availableRoles.map((role) => (
          <TabsTrigger key={role} value={role}>
            {roleLabels[role]}
          </TabsTrigger>
        ))}
      </TabsList>

      {availableRoles.map((role) => (
        <TabsContent key={role} value={role} className="space-y-3">
          <div className="flex items-center gap-2">
            <RoleBadge role={role} size="sm" />
            <p className="text-sm text-muted-foreground">
              Configure module permissions for this role.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Module</th>
                  <th className="px-4 py-3 text-center font-semibold">View</th>
                  <th className="px-4 py-3 text-center font-semibold">Create</th>
                  <th className="px-4 py-3 text-center font-semibold">Update</th>
                  <th className="px-4 py-3 text-center font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => {
                  const rolePerms = permissions[role]?.find((p) => p.module === module);
                  return (
                    <tr key={`${role}-${module}`} className="border-b border-border/60">
                      <td className="px-4 py-3 font-medium">{module}</td>
                      {(['view', 'create', 'update', 'delete'] as const).map((action) => (
                        <td key={`${role}-${module}-${action}`} className="px-4 py-3 text-center">
                          <Checkbox
                            checked={rolePerms?.[action] ?? false}
                            onCheckedChange={(checked) =>
                              onPermissionChange?.(role, module, action, checked as boolean)
                            }
                            disabled={readOnly}
                            className="mx-auto"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      ))}

      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p className="mb-2 font-semibold">Sensitive Actions (Require Audit Log):</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Creating SUPER_ADMIN user</li>
          <li>Modifying role permissions</li>
          <li>Disabling 2FA</li>
          <li>Removing SUPER_ADMIN access</li>
          <li>Privilege escalation</li>
        </ul>
      </div>
    </Tabs>
  );
}
