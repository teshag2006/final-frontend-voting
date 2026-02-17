'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleBadge, type RoleType } from './role-badge';

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
  onPermissionChange?: (role: RoleType, module: string, action: PermissionAction, value: boolean) => void;
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

export function PermissionsMatrix({
  roles,
  permissions,
  isLoading = false,
  onPermissionChange,
  readOnly = false,
}: PermissionsMatrixProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <div className="min-w-full inline-block align-middle">
        <div className="grid gap-0.5 bg-border" style={{ gridTemplateColumns: `150px repeat(${roles.length * 4}, 1fr)` }}>
          {/* Header */}
          <div className="bg-muted/50 px-4 py-3 font-semibold sticky left-0 z-10">Module</div>
          {roles.map((role) => (
            <div key={role} colSpan={4} className="bg-muted/50 px-4 py-3 font-semibold text-center border-l border-border">
              <RoleBadge role={role} size="sm" />
            </div>
          ))}

          {/* Headers for actions */}
          {modules.length > 0 && (
            <>
              <div />
              {roles.map((role) => (
                <div key={`${role}-header`} className="contents">
                  <div className="bg-muted px-2 py-2 text-xs text-center border-l border-border">View</div>
                  <div className="bg-muted px-2 py-2 text-xs text-center border-l border-border">Create</div>
                  <div className="bg-muted px-2 py-2 text-xs text-center border-l border-border">Update</div>
                  <div className="bg-muted px-2 py-2 text-xs text-center border-l border-border">Delete</div>
                </div>
              ))}
            </>
          )}

          {/* Rows */}
          {modules.map((module) => (
            <div key={module} className="contents">
              <div className="bg-card px-4 py-3 font-medium text-sm border-t border-border sticky left-0 z-10 flex items-center gap-2">
                <span>{module}</span>
              </div>
              {roles.map((role) => {
                const rolePerms = permissions[role]?.find((p) => p.module === module);
                return (
                  <div key={`${role}-${module}`} className="contents">
                    {(['view', 'create', 'update', 'delete'] as const).map((action) => (
                      <div
                        key={`${role}-${module}-${action}`}
                        className="bg-card px-2 py-3 border-t border-l border-border flex justify-center"
                      >
                        <Checkbox
                          checked={rolePerms?.[action] ?? false}
                          onCheckedChange={(checked) => onPermissionChange?.(role, module, action, checked as boolean)}
                          disabled={readOnly}
                          className="cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Sensitive Actions Legend */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border text-sm text-muted-foreground">
        <p className="font-semibold mb-2">Sensitive Actions (Require Audit Log):</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Creating SUPER_ADMIN user</li>
          <li>Modifying role permissions</li>
          <li>Disabling 2FA</li>
          <li>Removing SUPER_ADMIN access</li>
          <li>Privilege escalation</li>
        </ul>
      </div>
    </div>
  );
}
