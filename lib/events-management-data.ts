import { EventData } from '@/components/admin/events-table';
import { apiFetchPaginated } from '@/lib/api';

type BackendEventRow = {
  id?: string | number;
  name?: string;
  description?: string | null;
  status?: string;
  registration_start?: string | null;
  registration_end?: string | null;
  voting_start?: string | null;
  voting_end?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  total_votes?: number | null;
  vote_count?: number | null;
  total_revenue?: number | null;
  revenue?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function mapStatusToUi(value: unknown): EventData['status'] {
  const raw = String(value || '').toLowerCase();
  if (raw === 'active') return 'ACTIVE';
  if (raw === 'closed' || raw === 'completed') return 'CLOSED';
  if (raw === 'archived' || raw === 'cancelled') return 'ARCHIVED';
  return 'UPCOMING';
}

function toIsoOrNow(value: unknown): string {
  const raw = String(value || '').trim();
  if (!raw) return new Date().toISOString();
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function toDateOnly(value: unknown): string {
  return toIsoOrNow(value).split('T')[0];
}

function toEventData(row: BackendEventRow): EventData {
  const registrationStart =
    row.registration_start || row.voting_start || row.start_date || row.created_at;
  const registrationEnd =
    row.registration_end || row.voting_start || row.start_date || row.updated_at;
  const votingStart = row.voting_start || row.start_date || row.created_at;
  const votingEnd = row.voting_end || row.end_date || row.updated_at;
  const createdAt = row.created_at || row.updated_at || new Date().toISOString();

  return {
    id: String(row.id ?? ''),
    name: String(row.name || 'Untitled Event'),
    description: row.description || '',
    status: mapStatusToUi(row.status),
    registrationStart: toIsoOrNow(registrationStart),
    registrationEnd: toIsoOrNow(registrationEnd),
    votingStart: toIsoOrNow(votingStart),
    votingEnd: toIsoOrNow(votingEnd),
    startDate: toDateOnly(row.start_date || votingStart),
    endDate: toDateOnly(row.end_date || votingEnd),
    totalVotes: Number(row.total_votes ?? row.vote_count ?? 0),
    totalRevenue: Number(row.total_revenue ?? row.revenue ?? 0),
    createdAt: toIsoOrNow(createdAt),
  };
}

export async function generateMockEvents(): Promise<EventData[]> {
  const collected: EventData[] = [];
  let page = 1;
  let pages = 1;

  while (page <= pages) {
    const result = await apiFetchPaginated<BackendEventRow>(
      `/events?page=${page}&limit=100`
    ).catch(() => null);
    if (!result) break;

    collected.push(...result.items.map(toEventData));
    pages = Number(result.pagination.pages || 1);
    page += 1;
  }

  return collected;
}

export function filterEventsByStatus(
  events: EventData[],
  status: 'all' | 'active' | 'upcoming' | 'closed'
): EventData[] {
  if (status === 'all') return events;

  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    upcoming: 'UPCOMING',
    closed: 'CLOSED',
  };

  return events.filter((event) => event.status === statusMap[status]);
}

export function sortEvents(
  events: EventData[],
  sortBy: string = 'created',
  sortOrder: string = 'desc'
): EventData[] {
  const sorted = [...events].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'created':
      default:
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}
