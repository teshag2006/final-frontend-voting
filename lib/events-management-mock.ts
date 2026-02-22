import { EventData } from '@/components/admin/events-table';

export function generateMockEvents(): EventData[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  return [
    {
      id: '1',
      name: 'Anderson Idol 2024',
      description: 'Annual singing competition',
      status: 'ACTIVE',
      registrationStart: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      registrationEnd: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString(),
      votingStart: thirtyDaysAgo.toISOString(),
      votingEnd: thirtyDaysFromNow.toISOString(),
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: thirtyDaysFromNow.toISOString().split('T')[0],
      totalVotes: 6230,
      totalRevenue: 15575,
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Summer Showdown 2023',
      description: 'Dance and performance showcase',
      status: 'CLOSED',
      registrationStart: new Date('2023-05-01T00:00:00Z').toISOString(),
      registrationEnd: new Date('2023-05-31T23:59:00Z').toISOString(),
      votingStart: new Date('2023-06-05T00:00:00Z').toISOString(),
      votingEnd: new Date('2023-07-10T21:00:00Z').toISOString(),
      startDate: new Date('2023-06-05').toISOString().split('T')[0],
      endDate: new Date('2023-07-10').toISOString().split('T')[0],
      totalVotes: 0,
      totalRevenue: 0,
      createdAt: new Date('2023-03-08').toISOString(),
    },
    {
      id: '3',
      name: 'Winter Finale 2024',
      description: 'Grand finale talent showcase',
      status: 'UPCOMING',
      registrationStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      registrationEnd: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      votingStart: thirtyDaysFromNow.toISOString(),
      votingEnd: ninetyDaysFromNow.toISOString(),
      startDate: thirtyDaysFromNow.toISOString().split('T')[0],
      endDate: ninetyDaysFromNow.toISOString().split('T')[0],
      totalVotes: 0,
      totalRevenue: 0,
      createdAt: now.toISOString(),
    },
  ];
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
