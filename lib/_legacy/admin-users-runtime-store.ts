export type AdminUserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'FINANCE_ADMIN'
  | 'FRAUD_ADMIN'
  | 'MEDIA_ADMIN'
  | 'VIEW_ONLY_ADMIN';

export type AdminUserStatus = 'ACTIVE' | 'DISABLED' | 'LOCKED';

export interface AdminUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
  is2FAEnabled: boolean;
  status: AdminUserStatus;
  lastLogin: string;
  createdAt: string;
}

let usersStore: AdminUserRecord[] = [];

export function seedAdminUsers(records: AdminUserRecord[]) {
  if (usersStore.length > 0) return;
  usersStore = records.map((item) => ({ ...item }));
}

export function getAdminUsers() {
  return usersStore.map((item) => ({ ...item }));
}

export function createAdminUser(payload: Omit<AdminUserRecord, 'id' | 'createdAt' | 'lastLogin'>) {
  const now = new Date().toISOString();
  const nextId = `USR-${String(Date.now()).slice(-7)}`;
  const created: AdminUserRecord = {
    id: nextId,
    createdAt: now,
    lastLogin: now,
    ...payload,
  };
  usersStore = [created, ...usersStore];
  return { ...created };
}

export function updateAdminUser(id: string, patch: Partial<AdminUserRecord>) {
  const index = usersStore.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updated = {
    ...usersStore[index],
    ...patch,
  };
  usersStore = [...usersStore.slice(0, index), updated, ...usersStore.slice(index + 1)];
  return { ...updated };
}

