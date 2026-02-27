import type { Sponsor } from '@/types/contestant';

let sponsorsStore: Sponsor[] = [];

export function seedAdminSponsors(records: Sponsor[]) {
  if (sponsorsStore.length > 0) return;
  sponsorsStore = records.map((item) => ({ ...item }));
}

export function getAdminSponsors() {
  return sponsorsStore.map((item) => ({ ...item }));
}

export function updateAdminSponsor(id: string, patch: Partial<Sponsor>) {
  const index = sponsorsStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = {
    ...sponsorsStore[index],
    ...patch,
  };
  sponsorsStore = [...sponsorsStore.slice(0, index), updated, ...sponsorsStore.slice(index + 1)];
  return { ...updated };
}
