import type { RoleData } from '@/components/admin/roles-table';

let rolesStore: RoleData[] = [];

export function seedAdminRoles(records: RoleData[]) {
  if (rolesStore.length > 0) return;
  rolesStore = records.map((item) => ({ ...item }));
}

export function getAdminRoles() {
  return rolesStore.map((item) => ({ ...item }));
}

export function updateAdminRole(id: string, patch: Partial<RoleData>) {
  const index = rolesStore.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updated = {
    ...rolesStore[index],
    ...patch,
  };
  rolesStore = [...rolesStore.slice(0, index), updated, ...rolesStore.slice(index + 1)];
  return { ...updated };
}
