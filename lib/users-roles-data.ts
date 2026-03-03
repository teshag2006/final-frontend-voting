import type { AdminUserData } from '@/components/admin/admin-users-table';
import type { RoleData } from '@/components/admin/roles-table';
import type { SessionData } from '@/components/admin/active-sessions-table';
import type { AuditEntry } from '@/components/admin/role-audit-table';
import type { PermissionData, RoleType } from '@/components/admin/permissions-matrix';
import { fetchAdminData } from '@/lib/admin-data-client';

export async function generateMockAdminUsers(count: number): Promise<AdminUserData[]> {
  const response = await fetchAdminData<AdminUserData[]>(
    `/api/admin/users?page=1&limit=${Math.max(1, count)}`
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function generateMockRoles(): Promise<RoleData[]> {
  const response = await fetchAdminData<RoleData[]>('/api/admin/roles');
  return Array.isArray(response.data) ? response.data : [];
}

export async function generateMockSessions(count: number): Promise<SessionData[]> {
  const response = await fetchAdminData<SessionData[]>(
    `/api/admin/sessions?page=1&limit=${Math.max(1, count)}`
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function generateMockAuditEntries(count: number): Promise<AuditEntry[]> {
  const response = await fetchAdminData<AuditEntry[]>(
    `/api/admin/audit?page=1&limit=${Math.max(1, count)}`
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function generateMockPermissions(): Promise<Record<RoleType, PermissionData[]>> {
  const response = await fetchAdminData<Record<RoleType, PermissionData[]>>('/api/admin/permissions');
  return (response.data || {}) as Record<RoleType, PermissionData[]>;
}
