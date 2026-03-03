import type { ContestantData } from '@/components/admin/contestants-table';
import type { ContestantStatus } from '@/components/admin/contestant-status-badge';
import type { ContestantGender } from '@/lib/contestant-gender';
import { apiFetchPaginated } from '@/lib/api';

export interface CategoryOption {
  id: string;
  name: string;
}

type BackendContestantRow = {
  id?: string | number;
  name?: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  biography?: string;
  category_name?: string;
  category_id?: string | number;
  status?: string;
  total_votes?: number;
  vote_count?: number;
  total_revenue?: number;
  created_at?: string;
  profile_image_url?: string;
  photo_url?: string;
  email?: string;
  gender?: string;
};

function mapStatusToUi(value: unknown): ContestantStatus {
  const raw = String(value || '').toLowerCase();
  if (raw === 'approved') return 'APPROVED';
  if (raw === 'rejected') return 'REJECTED';
  if (raw === 'disqualified') return 'DISABLED';
  if (raw === 'active') return 'ACTIVE';
  return 'PENDING';
}

function mapGenderToUi(value: unknown): ContestantGender {
  const raw = String(value || '').toLowerCase();
  if (raw === 'female') return 'female';
  if (raw === 'male') return 'male';
  if (raw === 'non_binary') return 'non_binary';
  return 'prefer_not_to_say';
}

function toContestantData(row: BackendContestantRow): ContestantData {
  const firstName = String(row.first_name || '').trim();
  const lastName = String(row.last_name || '').trim();
  const fullName = String(row.name || `${firstName} ${lastName}`.trim() || 'Contestant');

  return {
    id: String(row.id ?? ''),
    name: fullName,
    age: Number(row.age ?? 18),
    bio: row.biography || '',
    category: String(row.category_name || 'Uncategorized'),
    categoryId: String(row.category_id ?? ''),
    status: mapStatusToUi(row.status),
    totalVotes: Number(row.total_votes ?? row.vote_count ?? 0),
    revenue: Number(row.total_revenue ?? 0),
    createdAt: String(row.created_at || new Date().toISOString()),
    avatar: row.photo_url || row.profile_image_url || undefined,
    email: row.email || undefined,
    gender: mapGenderToUi(row.gender),
  };
}

export async function generateMockContestants(
  count: number = 120
): Promise<ContestantData[]> {
  const limit = Math.max(1, Math.min(100, count));
  let page = 1;
  let pages = 1;
  const collected: ContestantData[] = [];

  while (page <= pages && collected.length < count) {
    const result = await apiFetchPaginated<BackendContestantRow>(
      `/contestants?page=${page}&limit=${limit}`
    ).catch(() => null);

    if (!result) break;
    const rows = result.items.map(toContestantData);
    collected.push(...rows);
    pages = Number(result.pagination.pages || 1);
    page += 1;
  }

  return collected.slice(0, count);
}

export function filterContestants(
  contestants: ContestantData[],
  filters: {
    search?: string;
    category?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): ContestantData[] {
  return contestants.filter((contestant) => {
    // Search filter (name or ID)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !contestant.name.toLowerCase().includes(searchLower) &&
        !contestant.id.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Category filter
    if (filters.category && contestant.categoryId !== filters.category) {
      return false;
    }

    // Status filter
    if (filters.status && contestant.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      if (new Date(contestant.createdAt) < fromDate) {
        return false;
      }
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(contestant.createdAt) > toDate) {
        return false;
      }
    }

    return true;
  });
}

export function sortContestants(
  contestants: ContestantData[],
  sortBy: 'name' | 'category' | 'status' | 'created' | 'votes' | 'revenue' = 'created',
  sortOrder: 'asc' | 'desc' = 'desc'
): ContestantData[] {
  const sorted = [...contestants];

  sorted.sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'category':
        compareValue = a.category.localeCompare(b.category);
        break;
      case 'created':
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      case 'votes':
        compareValue = a.totalVotes - b.totalVotes;
        break;
      case 'revenue':
        compareValue = a.revenue - b.revenue;
        break;
      default:
        compareValue = 0;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
}

export function paginateContestants(
  contestants: ContestantData[],
  page: number = 1,
  perPage: number = 10
): { items: ContestantData[]; total: number; page: number; perPage: number } {
  const total = contestants.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    items: contestants.slice(start, end),
    total,
    page,
    perPage,
  };
}

export async function getCategories(contestants?: ContestantData[]): Promise<CategoryOption[]> {
  const source = contestants && contestants.length > 0
    ? contestants
    : await generateMockContestants(200);

  const map = new Map<string, string>();
  source.forEach((row) => {
    if (row.categoryId) {
      map.set(row.categoryId, row.category || 'Uncategorized');
    }
  });

  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategoryName(categoryId: string): string {
  return categoryId || 'Unknown';
}

