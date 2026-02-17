'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import Link from 'next/link';
import { AdminUsersTable, type AdminUserData } from '@/components/admin/admin-users-table';
import { RolesTable, type RoleData } from '@/components/admin/roles-table';
import { PermissionsMatrix, type PermissionData, type RoleType } from '@/components/admin/permissions-matrix';
import { ActiveSessionsTable, type SessionData } from '@/components/admin/active-sessions-table';
import { RoleAuditTable, type AuditEntry } from '@/components/admin/role-audit-table';
import {
  generateMockAdminUsers,
  generateMockRoles,
  generateMockSessions,
  generateMockAuditEntries,
  generateMockPermissions,
} from '@/lib/users-roles-mock';

export default function AdminUsersAndRolesPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);

  // Admin Users Tab State
  const [adminUsers, setAdminUsers] = useState<AdminUserData[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<AdminUserData[]>([]);
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');

  // Roles Tab State
  const [roles, setRoles] = useState<RoleData[]>([]);

  // Permissions Matrix State
  const [allRoles, setAllRoles] = useState<RoleType[]>([]);
  const [permissions, setPermissions] = useState<Record<RoleType, PermissionData[]>>({} as any);

  // Sessions Tab State
  const [sessions, setSessions] = useState<SessionData[]>([]);

  // Audit Tab State
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  // Initialize mock data
  useEffect(() => {
    setTimeout(() => {
      const mockUsers = generateMockAdminUsers(25);
      const mockRoles = generateMockRoles();
      const mockSessions = generateMockSessions(15);
      const mockAudit = generateMockAuditEntries(50);
      const mockPermissions = generateMockPermissions();

      setAdminUsers(mockUsers);
      setDisplayedUsers(mockUsers);
      setRoles(mockRoles);
      setAllRoles(mockRoles.map((r) => r.name));
      setSessions(mockSessions);
      setAuditEntries(mockAudit);
      setPermissions(mockPermissions);
      setIsLoading(false);
    }, 800);
  }, []);

  // Apply sorting for users
  useEffect(() => {
    let sorted = [...adminUsers];
    sorted.sort((a, b) => {
      let aVal = a[userSortBy as keyof AdminUserData];
      let bVal = b[userSortBy as keyof AdminUserData];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (userSortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });
    setDisplayedUsers(sorted);
  }, [adminUsers, userSortBy, userSortOrder]);

  // User Actions
  const handleViewUser = (user: AdminUserData) => {
    console.log('View user:', user);
  };

  const handleEditUser = (user: AdminUserData) => {
    console.log('Edit user:', user);
  };

  const handleAssignRole = (user: AdminUserData) => {
    console.log('Assign role to:', user);
  };

  const handleDisableUser = (user: AdminUserData) => {
    if (confirm(`Disable user ${user.fullName}?`)) {
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: 'DISABLED' as const } : u))
      );
    }
  };

  const handleForceLogout = (user: AdminUserData) => {
    if (confirm(`Force logout user ${user.fullName}?`)) {
      console.log('Force logout:', user);
    }
  };

  const handleResetPassword = (user: AdminUserData) => {
    if (confirm(`Reset password for ${user.fullName}? They will receive an email with a temporary password.`)) {
      console.log('Reset password:', user);
    }
  };

  const handleToggle2FA = (user: AdminUserData) => {
    if (confirm(`${user.is2FAEnabled ? 'Disable' : 'Enable'} 2FA for ${user.fullName}?`)) {
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is2FAEnabled: !u.is2FAEnabled } : u))
      );
    }
  };

  // Session Actions
  const handleForceLogoutSession = (session: SessionData) => {
    if (confirm(`Force logout session ${session.id.slice(0, 8)}?`)) {
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    }
  };

  const handleRevokeAllSessions = (userId: string) => {
    if (confirm('Revoke all sessions for this user?')) {
      setSessions((prev) => prev.filter((s) => s.userId !== userId));
    }
  };

  // Permission Changes
  const handlePermissionChange = (role: RoleType, module: string, action: string, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: prev[role].map((p) =>
        p.module === module ? { ...p, [action]: value } : p
      ),
    }));
  };

  return (
    <ProtectedRouteWrapper requiredRole="admin" autoSignInWith="admin" fallbackUrl="/admin/dashboard">
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Admin Control Panel</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Users & Roles</h1>
                </div>
              </div>

              {activeTab === 'users' && (
                <Button className="gap-2 w-full sm:w-auto" size="lg">
                  <Plus className="h-5 w-5" />
                  <span>Create Admin</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
              <TabsTrigger value="users">Admin Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            {/* Admin Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Showing {displayedUsers.length} of {adminUsers.length} admin users
                  </p>
                </div>
              </div>
              <AdminUsersTable
                users={displayedUsers}
                isLoading={isLoading}
                sortBy={userSortBy}
                sortOrder={userSortOrder}
                onSortChange={(col, order) => {
                  setUserSortBy(col);
                  setUserSortOrder(order as 'asc' | 'desc');
                }}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onAssignRole={handleAssignRole}
                onDisable={handleDisableUser}
                onForceLogout={handleForceLogout}
                onResetPassword={handleResetPassword}
                onToggle2FA={handleToggle2FA}
              />
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> System roles (SUPER_ADMIN, ADMIN, etc.) cannot be deleted. You can manage their permissions using the Permissions tab.
                </p>
              </div>
              <RolesTable
                roles={roles}
                isLoading={isLoading}
                onEdit={(role) => console.log('Edit role:', role)}
                onAssignPermissions={(role) => console.log('Assign permissions:', role)}
                onDeactivate={(role) => console.log('Deactivate role:', role)}
              />
            </TabsContent>

            {/* Permissions Matrix Tab */}
            <TabsContent value="permissions" className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-amber-900">
                  <strong>Security Notice:</strong> Permission changes are high-risk actions and will be logged to the Audit Log. All changes require confirmation.
                </p>
              </div>
              <PermissionsMatrix
                roles={allRoles}
                permissions={permissions}
                isLoading={isLoading}
                onPermissionChange={handlePermissionChange}
                readOnly={false}
              />
            </TabsContent>

            {/* Active Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <ActiveSessionsTable
                sessions={sessions}
                isLoading={isLoading}
                onForceLogout={handleForceLogoutSession}
                onRevokeAllUserSessions={handleRevokeAllSessions}
              />
            </TabsContent>

            {/* Audit History Tab */}
            <TabsContent value="audit" className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-gray-900">
                  <strong>Read-Only:</strong> This audit log cannot be modified. It provides a complete history of all role and permission changes.
                </p>
              </div>
              <RoleAuditTable entries={auditEntries} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRouteWrapper>
  );
}
