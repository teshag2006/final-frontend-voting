export interface AdminContestantRecord {
  id: string;
  name: string;
  bio?: string;
  category: string;
  categoryId: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'DISABLED';
  totalVotes: number;
  revenue: number;
  createdAt: string;
  avatar?: string;
  galleryImages?: string[];
  email?: string;
}

let contestantsStore: AdminContestantRecord[] = [];

export function seedAdminContestants(records: AdminContestantRecord[]) {
  if (contestantsStore.length > 0) return;
  contestantsStore = records.map((item) => ({ ...item }));
}

export function getAdminContestants() {
  return contestantsStore.map((item) => ({ ...item }));
}

export function createAdminContestant(payload: AdminContestantRecord) {
  contestantsStore = [{ ...payload }, ...contestantsStore];
  return { ...payload };
}

export function updateAdminContestant(
  id: string,
  patch: Partial<AdminContestantRecord>
) {
  const index = contestantsStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: AdminContestantRecord = {
    ...contestantsStore[index],
    ...patch,
  };
  contestantsStore = [
    ...contestantsStore.slice(0, index),
    updated,
    ...contestantsStore.slice(index + 1),
  ];
  return { ...updated };
}

export function deleteAdminContestant(id: string) {
  const before = contestantsStore.length;
  contestantsStore = contestantsStore.filter((item) => item.id !== id);
  return contestantsStore.length !== before;
}
