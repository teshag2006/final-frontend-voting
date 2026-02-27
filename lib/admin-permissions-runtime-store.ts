import type { PermissionData, RoleType } from '@/components/admin/permissions-matrix';

type PermissionMap = Record<RoleType, PermissionData[]>;

let permissionsStore: PermissionMap | null = null;

export function seedAdminPermissions(records: PermissionMap) {
  if (permissionsStore) return;
  permissionsStore = structuredClone(records);
}

export function getAdminPermissions(): PermissionMap {
  return structuredClone(permissionsStore || ({} as PermissionMap));
}

export function updateAdminPermission(
  role: RoleType,
  module: string,
  action: 'view' | 'create' | 'update' | 'delete',
  value: boolean
) {
  if (!permissionsStore || !permissionsStore[role]) return null;
  let matched = false;
  permissionsStore = {
    ...permissionsStore,
    [role]: permissionsStore[role].map((item) =>
      item.module === module
        ? (() => {
            matched = true;
            return { ...item, [action]: value };
          })()
        : item
    ),
  };
  if (!matched) return null;
  return getAdminPermissions();
}
