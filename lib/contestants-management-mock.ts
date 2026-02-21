import type { ContestantData } from '@/components/admin/contestants-table';
import type { ContestantStatus } from '@/components/admin/contestant-status-badge';

// Mock category data
export interface CategoryOption {
  id: string;
  name: string;
}

const mockCategories: CategoryOption[] = [
  { id: 'cat-1', name: 'Solo Vocalists' },
  { id: 'cat-2', name: 'Duet Performers' },
  { id: 'cat-3', name: 'Youth Talent (Under 18)' },
  { id: 'cat-4', name: 'Group Acts' },
  { id: 'cat-5', name: 'Comedy & Performance' },
];

// Sample contestant names for variety
const firstNames = [
  'Sophie',
  'Jacob',
  'Emily',
  'Jack',
  'Olivia',
  'David',
  'Mia',
  'Ethan',
  'Ava',
  'Liam',
];

const lastNames = [
  'Turner',
  'Rodriguez',
  'Chen',
  'Miller',
  'Parker',
  'Martinez',
  'Johnson',
  'Williams',
  'Brown',
  'Davis',
];

const statuses: ContestantStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ACTIVE',
  'DISABLED',
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockContestants(count: number = 120): ContestantData[] {
  const contestants: ContestantData[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const id = `#${String(5000 + i).padStart(4, '0')}`;
    const category = getRandomElement(mockCategories);
    const status = getRandomElement(statuses);

    // Higher votes for ACTIVE/APPROVED contestants
    let votesMultiplier = 1;
    if (status === 'ACTIVE') votesMultiplier = 2.5;
    else if (status === 'APPROVED') votesMultiplier = 1.8;
    else if (status === 'REJECTED') votesMultiplier = 0.1;

    const totalVotes = Math.floor(getRandomInt(100, 2000) * votesMultiplier);
    const revenue = totalVotes * getRandomInt(0.3, 0.8);

    const createdDaysAgo = getRandomInt(0, 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);

    contestants.push({
      id,
      name: `${firstName} ${lastName}`,
      bio: `Talented performer from the ${category.name} category.`,
      category: category.name,
      categoryId: category.id,
      status,
      totalVotes,
      revenue,
      createdAt: createdAt.toISOString(),
      avatar: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${firstName}%20${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    });
  }

  return contestants;
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
  sortBy: 'name' | 'created' | 'votes' | 'revenue' = 'created',
  sortOrder: 'asc' | 'desc' = 'desc'
): ContestantData[] {
  const sorted = [...contestants];

  sorted.sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'created':
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

export function getCategories(): CategoryOption[] {
  return mockCategories;
}

export function getCategoryName(categoryId: string): string {
  return mockCategories.find((c) => c.id === categoryId)?.name || 'Unknown';
}

