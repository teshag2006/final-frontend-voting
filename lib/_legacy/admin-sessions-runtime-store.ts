import type { SessionData } from '@/components/admin/active-sessions-table';

let sessionsStore: SessionData[] = [];

export function seedAdminSessions(records: SessionData[]) {
  if (sessionsStore.length > 0) return;
  sessionsStore = records.map((item) => ({ ...item }));
}

export function getAdminSessions() {
  return sessionsStore.map((item) => ({ ...item }));
}

export function revokeSession(id: string) {
  const before = sessionsStore.length;
  sessionsStore = sessionsStore.filter((item) => item.id !== id);
  return before - sessionsStore.length;
}

export function revokeAllUserSessions(userId: string) {
  const before = sessionsStore.length;
  sessionsStore = sessionsStore.filter((item) => item.userId !== userId);
  return before - sessionsStore.length;
}
