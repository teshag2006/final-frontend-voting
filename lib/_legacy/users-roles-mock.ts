import type { AdminUserData } from '@/components/admin/admin-users-table';
import type { RoleData } from '@/components/admin/roles-table';
import type { SessionData } from '@/components/admin/active-sessions-table';
import type { AuditEntry } from '@/components/admin/role-audit-table';
import type { PermissionData, RoleType } from '@/components/admin/permissions-matrix';

const userFirstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa'];
const userLastNames = ['Admin', 'Manager', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
const roles: RoleType[] = ['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'FRAUD_ADMIN', 'MEDIA_ADMIN', 'VIEW_ONLY_ADMIN'];

export function generateMockAdminUsers(count: number): AdminUserData[] {
  const users: AdminUserData[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = userFirstNames[i % userFirstNames.length];
    const lastName = userLastNames[i % userLastNames.length];
    const role = roles[i % roles.length];

    users.push({
      id: `USR-${String(i + 1).padStart(5, '0')}`,
      fullName: `${firstName} ${lastName} ${i > 0 ? i : ''}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}@anderson.local`,
      role,
      is2FAEnabled: i % 3 !== 0, // 2 out of 3 have 2FA
      status: i % 10 === 0 ? 'DISABLED' : i % 20 === 0 ? 'LOCKED' : 'ACTIVE',
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return users;
}

export function generateMockRoles(): RoleData[] {
  const roleDescriptions: Record<RoleType, string> = {
    SUPER_ADMIN: 'Full system control and administration',
    ADMIN: 'General administrative access',
    FINANCE_ADMIN: 'Financial management and reporting',
    FRAUD_ADMIN: 'Fraud monitoring and investigation',
    MEDIA_ADMIN: 'Media and content management',
    VIEW_ONLY_ADMIN: 'Read-only access for monitoring',
  };

  return roles.map((role, index) => ({
    id: `ROLE-${String(index + 1).padStart(3, '0')}`,
    name: role,
    description: roleDescriptions[role],
    userCount: Math.floor(Math.random() * 15) + (role === 'SUPER_ADMIN' ? 1 : 0),
    isSystemRole: true,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

export function generateMockSessions(count: number): SessionData[] {
  const devices = ['Chrome - Windows', 'Safari - macOS', 'Firefox - Linux', 'Edge - Windows', 'Chrome - Mobile'];
  const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Berlin, Germany', 'Sydney, Australia'];

  const sessions: SessionData[] = [];
  const users = generateMockAdminUsers(5);

  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    sessions.push({
      id: `SESSION-${String(i + 1).padStart(6, '0')}`,
      userId: user.id,
      userName: user.fullName,
      role: user.role,
      ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      device: devices[i % devices.length],
      location: locations[i % locations.length],
      lastActivity: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000 - Math.random() * 20 * 60 * 60 * 1000).toISOString(),
    });
  }

  return sessions;
}

export function generateMockAuditEntries(count: number): AuditEntry[] {
  const actions: AuditEntry['action'][] = [
    'USER_CREATED',
    'USER_DELETED',
    'ROLE_ASSIGNED',
    'ROLE_CHANGED',
    'PERMISSION_MODIFIED',
    'PRIVILEGE_ESCALATION',
    '2FA_ENABLED',
    '2FA_DISABLED',
    'PASSWORD_RESET',
    'FORCE_LOGOUT',
  ];

  const riskMap: Record<AuditEntry['action'], 'LOW' | 'MEDIUM' | 'HIGH'> = {
    USER_CREATED: 'MEDIUM',
    USER_DELETED: 'HIGH',
    ROLE_ASSIGNED: 'MEDIUM',
    ROLE_CHANGED: 'HIGH',
    PERMISSION_MODIFIED: 'HIGH',
    PRIVILEGE_ESCALATION: 'HIGH',
    '2FA_ENABLED': 'LOW',
    '2FA_DISABLED': 'HIGH',
    PASSWORD_RESET: 'MEDIUM',
    FORCE_LOGOUT: 'MEDIUM',
  };

  const entries: AuditEntry[] = [];
  const users = generateMockAdminUsers(10);

  for (let i = 0; i < count; i++) {
    const action = actions[i % actions.length];
    entries.push({
      id: `AUDIT-${String(i + 1).padStart(6, '0')}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      action,
      actor: users[i % users.length].fullName,
      target: users[(i + 1) % users.length].email,
      details: `${action} executed at 2024-03-15 ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      riskLevel: riskMap[action],
    });
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const modules = ['Dashboard', 'Events', 'Categories', 'Contestants', 'Votes', 'Payments', 'Fraud', 'Reports', 'Blockchain', 'Audit Logs', 'Users', 'Settings', 'Jobs', 'Cache', 'Health'];

export function generateMockPermissions(): Record<RoleType, PermissionData[]> {
  const permissions: Record<RoleType, PermissionData[]> = {
    SUPER_ADMIN: modules.map((module) => ({
      module,
      view: true,
      create: true,
      update: true,
      delete: true,
      isSensitive: ['Users', 'Settings', 'Audit Logs'].includes(module),
    })),
    ADMIN: modules.map((module) => ({
      module,
      view: true,
      create: !['Users', 'Settings', 'Blockchain'].includes(module),
      update: !['Users', 'Settings', 'Blockchain'].includes(module),
      delete: !['Users', 'Settings', 'Blockchain', 'Audit Logs'].includes(module),
      isSensitive: ['Users', 'Settings'].includes(module),
    })),
    FINANCE_ADMIN: modules.map((module) => ({
      module,
      view: ['Payments', 'Reports', 'Dashboard', 'Votes', 'Contestants'].includes(module),
      create: ['Payments', 'Reports'].includes(module),
      update: ['Payments', 'Reports'].includes(module),
      delete: false,
      isSensitive: false,
    })),
    FRAUD_ADMIN: modules.map((module) => ({
      module,
      view: true,
      create: ['Fraud', 'Reports'].includes(module),
      update: ['Fraud', 'Reports'].includes(module),
      delete: false,
      isSensitive: ['Fraud', 'Users'].includes(module),
    })),
    MEDIA_ADMIN: modules.map((module) => ({
      module,
      view: ['Dashboard', 'Contestants', 'Events', 'Categories', 'Reports'].includes(module),
      create: ['Contestants'].includes(module),
      update: ['Contestants'].includes(module),
      delete: false,
      isSensitive: false,
    })),
    VIEW_ONLY_ADMIN: modules.map((module) => ({
      module,
      view: true,
      create: false,
      update: false,
      delete: false,
      isSensitive: false,
    })),
  };

  return permissions;
}
