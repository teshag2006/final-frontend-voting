import { apiFetch, apiFetchPaginated } from '@/lib/api';
import type {
  AdminEvent,
  AdminEventApiResponse,
  EventStatus,
} from '@/types/admin-event';

function mapBackendStatusToUi(status: unknown): EventStatus {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'active') return 'ACTIVE';
  if (normalized === 'completed') return 'CLOSED';
  if (normalized === 'cancelled') return 'ARCHIVED';
  return 'UPCOMING';
}

function normalizeAdminEvent(row: AdminEventApiResponse): AdminEvent {
  return {
    id: String(row.id),
    name: String(row.name || 'Untitled Event'),
    description: row.description || '',
    status: mapBackendStatusToUi(row.status),
    registrationStart:
      row.registration_start ||
      row.voting_start ||
      row.start_date ||
      '',
    registrationEnd:
      row.registration_end ||
      row.voting_start ||
      row.start_date ||
      '',
    votingStart: row.voting_start || row.start_date || '',
    votingEnd: row.voting_end || row.end_date || '',
    startDate: row.start_date || row.voting_start || '',
    endDate: row.end_date || row.voting_end || '',
    totalVotes:
      typeof row.total_votes === 'number' ? row.total_votes : 0,
    totalRevenue:
      typeof row.total_revenue === 'number' ? row.total_revenue : 0,
    createdAt:
      row.created_at ||
      row.updated_at ||
      new Date().toISOString(),
    updatedAt:
      row.updated_at ||
      row.created_at ||
      new Date().toISOString(),
  };
}

export async function generateAdminEventsMockData(params?: {
  page?: number;
  limit?: number;
  status?: string;
  token?: string;
}): Promise<AdminEvent[]> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);

  const endpoint = `/events${query.toString() ? `?${query.toString()}` : ''}`;
  const result = await apiFetchPaginated<AdminEventApiResponse>(
    endpoint,
    {},
    params?.token
  ).catch(() => null);

  if (!result) return [];
  return result.items.map(normalizeAdminEvent);
}

export async function generateSingleAdminEvent(
  overrides?: Partial<AdminEvent>,
  token?: string
): Promise<AdminEvent> {
  const now = new Date().toISOString();

  if (overrides?.id) {
    const found = await apiFetch<AdminEventApiResponse>(
      `/events/${encodeURIComponent(String(overrides.id))}`,
      {},
      token
    ).catch(() => null);
    if (found) {
      return { ...normalizeAdminEvent(found), ...overrides };
    }
  }

  const first = await generateAdminEventsMockData({ page: 1, limit: 1, token });
  const base = first[0] || {
    id: '',
    name: '',
    description: '',
    status: 'UPCOMING' as EventStatus,
    registrationStart: '',
    registrationEnd: '',
    votingStart: '',
    votingEnd: '',
    startDate: '',
    endDate: '',
    totalVotes: 0,
    totalRevenue: 0,
    createdAt: now,
    updatedAt: now,
  };

  return { ...base, ...overrides };
}
