import type { AuditEntry } from '@/components/admin/role-audit-table';

let auditStore: AuditEntry[] = [];

export function seedAdminAudit(records: AuditEntry[]) {
  if (auditStore.length > 0) return;
  auditStore = records.map((item) => ({ ...item }));
}

export function getAdminAudit() {
  return auditStore.map((item) => ({ ...item }));
}

export function appendAdminAudit(
  payload: Omit<AuditEntry, 'id' | 'timestamp'>
) {
  const entry: AuditEntry = {
    id: `AUDIT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  auditStore = [entry, ...auditStore];
  return { ...entry };
}
