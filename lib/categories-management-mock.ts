import { CategoryData } from '@/components/admin/categories-table';

export function generateMockCategories(eventId?: string): CategoryData[] {
  const now = new Date();
  const baseCategoryData: CategoryData[] = [
    {
      id: '1',
      name: 'Solo Vocalists',
      eventId: '1',
      eventName: 'Anderson Idol 2024',
      status: 'ACTIVE',
      totalContestants: 50,
      totalVotes: 3200,
      revenue: 8000,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Duet Performers',
      eventId: '1',
      eventName: 'Anderson Idol 2024',
      status: 'ACTIVE',
      totalContestants: 24,
      totalVotes: 2560,
      revenue: 6400,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Youth Talent (Under 18)',
      eventId: '1',
      eventName: 'Anderson Idol 2024',
      status: 'ACTIVE',
      totalContestants: 72,
      totalVotes: 1920,
      revenue: 4800,
      createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      name: 'Group Acts',
      eventId: '1',
      eventName: 'Anderson Idol 2024',
      status: 'ACTIVE',
      totalContestants: 18,
      totalVotes: 600,
      revenue: 1500,
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      name: 'Instrumentalists',
      eventId: '1',
      eventName: 'Anderson Idol 2024',
      status: 'INACTIVE',
      totalContestants: 32,
      totalVotes: 1200,
      revenue: 3000,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  if (eventId) {
    return baseCategoryData.filter((cat) => cat.eventId === eventId);
  }

  return baseCategoryData;
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
export function generateMockEvents() {
  return [
    { id: '1', name: 'Anderson Idol 2024', status: 'ACTIVE' as const },
    { id: '2', name: 'Summer Showdown 2023', status: 'CLOSED' as const },
    { id: '3', name: 'Winter Finale 2024', status: 'UPCOMING' as const },
  ];
}
