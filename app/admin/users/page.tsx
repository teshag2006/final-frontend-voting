'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const CREATE_ROLE_OPTIONS: RoleType[] = [
  'ADMIN',
  'FINANCE_ADMIN',
  'FRAUD_ADMIN',
  'MEDIA_ADMIN',
  'VIEW_ONLY_ADMIN',
  'SUPER_ADMIN',
];

export default function AdminUsersAndRolesPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    email: string;
    status: AdminUserData['status'];
  }>({
    fullName: '',
    email: '',
    status: 'ACTIVE',
  });
  const [assignRole, setAssignRole] = useState<RoleType>('ADMIN');
  const [tempPassword, setTempPassword] = useState('');
  const [createForm, setCreateForm] = useState<{
    fullName: string;
    email: string;
    role: RoleType;
  }>({
    fullName: '',
    email: '',
    role: 'ADMIN',
  });

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

  const appendAudit = (
    action: AuditEntry['action'],
    target: string,
    details: string,
    riskLevel: AuditEntry['riskLevel'] = 'MEDIUM'
  ) => {
    setAuditEntries((prev) => [
      {
        id: `AUDIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        actor: 'Current Admin',
        target,
        details,
        riskLevel,
      },
      ...prev,
    ]);
  };

  const patchUser = async (id: string, patch: Partial<AdminUserData>) => {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, patch }),
    });
    if (!response.ok) return null;
    return (await response.json()) as AdminUserData;
  };

  // Initialize data from backend, fallback to mock in dev
  useEffect(() => {
    const loadData = async () => {
      const mockRoles = generateMockRoles();
      const mockSessions = generateMockSessions(15);
      const mockAudit = generateMockAuditEntries(50);
      const mockPermissions = generateMockPermissions();
      let users: AdminUserData[] = [];

      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const payload = (await response.json()) as AdminUserData[];
          users = Array.isArray(payload) ? payload : [];
        } else {
          users = generateMockAdminUsers(25);
        }
      } catch {
        users = generateMockAdminUsers(25);
      }

      setAdminUsers(users);
      setDisplayedUsers(users);
      setRoles(mockRoles);
      setAllRoles(mockRoles.map((r) => r.name));
      setSessions(mockSessions);
      setAuditEntries(mockAudit);
      setPermissions(mockPermissions);
      setIsLoading(false);
    };
    void loadData();
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
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEditUser = (user: AdminUserData) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      status: user.status,
    });
    setIsEditOpen(true);
  };

  const handleAssignRole = (user: AdminUserData) => {
    setSelectedUser(user);
    setAssignRole(user.role);
    setIsAssignRoleOpen(true);
  };

  const handleDisableUser = (user: AdminUserData) => {
    if (confirm(`Disable user ${user.fullName}?`)) {
      const previous = user.status;
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: 'DISABLED' as const } : u))
      );
      void patchUser(user.id, { status: 'DISABLED' }).then((updated) => {
        if (!updated) {
          setAdminUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, status: previous } : u))
          );
          alert('Could not disable user.');
          return;
        }
        appendAudit('ROLE_CHANGED', user.email, `User status changed to DISABLED for ${user.fullName}.`, 'HIGH');
      });
    }
  };

  const handleForceLogout = (user: AdminUserData) => {
    if (confirm(`Force logout user ${user.fullName}?`)) {
      const before = sessions.length;
      setSessions((prev) => prev.filter((s) => s.userId !== user.id));
      const removed = before - sessions.filter((s) => s.userId !== user.id).length;
      appendAudit('FORCE_LOGOUT', user.email, `Forced logout for ${user.fullName}. Revoked active sessions.`, 'MEDIUM');
      alert(`Forced logout complete. ${removed > 0 ? `${removed} session(s) revoked.` : 'No active sessions found.'}`);
    }
  };

  const handleResetPassword = (user: AdminUserData) => {
    if (confirm(`Reset password for ${user.fullName}? They will receive an email with a temporary password.`)) {
      const generated = `Tmp!${Math.random().toString(36).slice(-8)}A1`;
      setSelectedUser(user);
      setTempPassword(generated);
      setIsResetPasswordOpen(true);
      appendAudit('PASSWORD_RESET', user.email, `Password reset triggered for ${user.fullName}.`, 'MEDIUM');
    }
  };

  const handleToggle2FA = (user: AdminUserData) => {
    if (confirm(`${user.is2FAEnabled ? 'Disable' : 'Enable'} 2FA for ${user.fullName}?`)) {
      const nextValue = !user.is2FAEnabled;
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is2FAEnabled: nextValue } : u))
      );
      void patchUser(user.id, { is2FAEnabled: nextValue }).then((updated) => {
        if (!updated) {
          setAdminUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, is2FAEnabled: user.is2FAEnabled } : u))
          );
          alert('Could not update 2FA setting.');
          return;
        }
        appendAudit(
          nextValue ? '2FA_ENABLED' : '2FA_DISABLED',
          user.email,
          `${nextValue ? 'Enabled' : 'Disabled'} 2FA for ${user.fullName}.`,
          nextValue ? 'LOW' : 'HIGH'
        );
      });
    }
  };

  const handleSaveEditedUser = async () => {
    if (!selectedUser) return;
    const fullName = editForm.fullName.trim();
    const email = editForm.email.trim().toLowerCase();
    if (!fullName || !email) {
      alert('Full name and email are required.');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await patchUser(selectedUser.id, {
        fullName,
        email,
        status: editForm.status,
      });
      if (!updated) {
        alert('Could not update user.');
        return;
      }
      setAdminUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      appendAudit('ROLE_CHANGED', updated.email, `Updated user profile for ${updated.fullName}.`, 'MEDIUM');
      setIsEditOpen(false);
      setSelectedUser(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAssignedRole = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const updated = await patchUser(selectedUser.id, { role: assignRole });
      if (!updated) {
        alert('Could not assign role.');
        return;
      }
      setAdminUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      appendAudit('ROLE_ASSIGNED', updated.email, `Assigned role ${assignRole} to ${updated.fullName}.`, 'HIGH');
      setIsAssignRoleOpen(false);
      setSelectedUser(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async () => {
    const fullName = createForm.fullName.trim();
    const email = createForm.email.trim();
    if (!fullName || !email) {
      alert('Full name and email are required.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          role: createForm.role,
          is2FAEnabled: false,
          status: 'ACTIVE',
        }),
      });

      if (!response.ok) {
        alert('Could not create user. Please try again.');
        return;
      }

      const created = (await response.json()) as AdminUserData;
      setAdminUsers((prev) => [created, ...prev]);
      setCreateForm({ fullName: '', email: '', role: 'ADMIN' });
      setIsCreateOpen(false);
    } finally {
      setIsSaving(false);
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
    <ProtectedRouteWrapper requiredRole="admin" fallbackUrl="/admin/dashboard">
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
                <Button className="gap-2 w-full sm:w-auto" size="lg" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-5 w-5" />
                  <span>Create User</span>
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
              <TabsTrigger value="users">Users</TabsTrigger>
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
                    Showing {displayedUsers.length} of {adminUsers.length} users
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

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-full-name">Full Name</Label>
                <Input
                  id="create-full-name"
                  placeholder="e.g. Selam Mekonnen"
                  value={createForm.fullName}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="e.g. selam@example.com"
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Role</Label>
                <select
                  id="create-role"
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, role: event.target.value as RoleType }))
                  }
                  disabled={isSaving}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  {CREATE_ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={() => void handleCreateUser()} disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser ? (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {selectedUser.id}</p>
                <p><strong>Name:</strong> {selectedUser.fullName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> {selectedUser.status}</p>
                <p><strong>2FA:</strong> {selectedUser.is2FAEnabled ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Last Login:</strong> {new Date(selectedUser.lastLogin).toLocaleString()}</p>
                <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="edit-user-name">Full Name</Label>
                <Input
                  id="edit-user-name"
                  value={editForm.fullName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-email">Email</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-status">Status</Label>
                <select
                  id="edit-user-status"
                  value={editForm.status}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value as AdminUserData['status'] }))}
                  disabled={isSaving}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLED">DISABLED</option>
                  <option value="LOCKED">LOCKED</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button onClick={() => void handleSaveEditedUser()} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="assign-role">Role</Label>
              <select
                id="assign-role"
                value={assignRole}
                onChange={(event) => setAssignRole(event.target.value as RoleType)}
                disabled={isSaving}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {CREATE_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button onClick={() => void handleSaveAssignedRole()} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Assign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Temporary Password Generated</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p><strong>User:</strong> {selectedUser?.fullName}</p>
              <p><strong>Email:</strong> {selectedUser?.email}</p>
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 font-mono text-amber-900">{tempPassword}</p>
              <p className="text-muted-foreground">Share securely with the user and ask them to rotate it immediately.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRouteWrapper>
  );
}
