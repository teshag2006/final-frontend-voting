import { makeUniqueSlug, slugify } from '@/lib/slug';

export interface AdminContestantRecord {
  id: string;
  slug?: string;
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
  introVideoUrl?: string;
}

let contestantsStore: AdminContestantRecord[] = [];

function getUsedSlugSet(excludeId?: string) {
  const used = new Set<string>();
  contestantsStore.forEach((item) => {
    if (excludeId && item.id === excludeId) return;
    if (item.slug) used.add(item.slug);
  });
  return used;
}

export function seedAdminContestants(records: AdminContestantRecord[]) {
  if (contestantsStore.length > 0) return;
  const used = new Set<string>();
  contestantsStore = records.map((item) => {
    const slug = makeUniqueSlug(item.slug || item.name || item.id, used, 'contestant');
    return { ...item, slug };
  });
}

export function getAdminContestants() {
  return contestantsStore.map((item) => ({ ...item }));
}

export function createAdminContestant(payload: AdminContestantRecord) {
  const used = getUsedSlugSet();
  const slug = makeUniqueSlug(payload.slug || payload.name || payload.id, used, 'contestant');
  const next = { ...payload, slug };
  contestantsStore = [next, ...contestantsStore];
  return { ...next };
}

export function updateAdminContestant(
  id: string,
  patch: Partial<AdminContestantRecord>
) {
  const index = contestantsStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = contestantsStore[index];
  const merged: AdminContestantRecord = { ...current, ...patch };

  if (patch.slug !== undefined || patch.name !== undefined) {
    const used = getUsedSlugSet(id);
    const requestedSlug = patch.slug || slugify(merged.name || current.name || id);
    merged.slug = makeUniqueSlug(requestedSlug, used, 'contestant');
  } else if (!merged.slug) {
    const used = getUsedSlugSet(id);
    merged.slug = makeUniqueSlug(merged.name || id, used, 'contestant');
  }

  const updated: AdminContestantRecord = merged;
  contestantsStore = [
    ...contestantsStore.slice(0, index),
    updated,
    ...contestantsStore.slice(index + 1),
  ];
  return { ...updated };
}

export function getAdminContestantById(id: string) {
  const found = contestantsStore.find((item) => item.id === id);
  return found ? { ...found } : null;
}

export function updateAdminContestantIntroVideo(id: string, introVideoUrl: string) {
  return updateAdminContestant(id, { introVideoUrl });
}

export function deleteAdminContestant(id: string) {
  const before = contestantsStore.length;
  contestantsStore = contestantsStore.filter((item) => item.id !== id);
  return contestantsStore.length !== before;
}
