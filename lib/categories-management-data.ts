import { CategoryData } from '@/components/admin/categories-table';
import type { EventOption } from '@/components/admin/event-selector';
import { apiFetchPaginated } from '@/lib/api';

type BackendCategoryRow = {
  id?: string | number;
  name?: string;
  event_id?: string | number;
  eventId?: string | number;
  event_name?: string;
  eventName?: string;
  status?: string;
  total_contestants?: number;
  contestants_count?: number;
  contestant_count?: number;
  total_votes?: number;
  vote_count?: number;
  revenue?: number;
  total_revenue?: number;
  created_at?: string;
};

type BackendEventRow = {
  id?: string | number;
  name?: string;
  status?: string;
};

function mapStatusToUi(value: unknown): CategoryData['status'] {
  const raw = String(value || '').toLowerCase();
  if (raw === 'inactive' || raw === 'disabled' || raw === 'closed') return 'INACTIVE';
  return 'ACTIVE';
}

function mapEventStatus(value: unknown): EventOption['status'] {
  const raw = String(value || '').toLowerCase();
  if (raw === 'active') return 'ACTIVE';
  if (raw === 'closed' || raw === 'completed') return 'CLOSED';
  return 'UPCOMING';
}

function toCategoryData(row: BackendCategoryRow): CategoryData {
  return {
    id: String(row.id ?? ''),
    name: String(row.name || 'Untitled Category'),
    eventId: String(row.event_id ?? row.eventId ?? ''),
    eventName: String(row.event_name || row.eventName || ''),
    status: mapStatusToUi(row.status),
    totalContestants: Number(
      row.total_contestants ?? row.contestants_count ?? row.contestant_count ?? 0
    ),
    totalVotes: Number(row.total_votes ?? row.vote_count ?? 0),
    revenue: Number(row.total_revenue ?? row.revenue ?? 0),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export async function generateMockCategories(eventId?: string): Promise<CategoryData[]> {
  const query = new URLSearchParams();
  query.set('page', '1');
  query.set('limit', '250');
  if (eventId) query.set('eventId', eventId);

  const result = await apiFetchPaginated<BackendCategoryRow>(
    `/categories?${query.toString()}`
  ).catch(() => null);
  if (!result) return [];

  return result.items.map(toCategoryData);
}

export function filterCategoriesByEvent(
  categories: CategoryData[],
  eventId: string
): CategoryData[] {
  return categories.filter((cat) => cat.eventId === eventId);
}

export function sortCategories(
  categories: CategoryData[],
  sortBy: string,
  sortOrder: string
): CategoryData[] {
  const sorted = [...categories];

  sorted.sort((a, b) => {
    let aValue: any = a.name;
    let bValue: any = b.name;

    if (sortBy === 'created') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    } else if (sortBy === 'status') {
      aValue = a.status;
      bValue = b.status;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

// Mock events for the event selector
export async function generateMockEvents(): Promise<EventOption[]> {
  const result = await apiFetchPaginated<BackendEventRow>(
    '/events?page=1&limit=100'
  ).catch(() => null);

  if (!result) return [];

  return result.items.map((row) => ({
    id: String(row.id ?? ''),
    name: String(row.name || 'Untitled Event'),
    status: mapEventStatus(row.status),
  }));
}
