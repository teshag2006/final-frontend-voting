import { AdminEvent, EventStatus } from '@/types/admin-event';

export function generateAdminEventsMockData(): AdminEvent[] {
  const now = new Date();
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const events: AdminEvent[] = [
    {
      id: 'event-001',
      name: 'Anderson Idol 2024',
      description: 'Annual singing competition with multiple categories',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
      totalVotes: 6230,
      totalRevenue: 6230 * 1.5, // Assuming $1.50 per vote
      createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'event-002',
      name: 'Summer Showdown 2023',
      description: 'Summer talent competition featuring various performances',
      status: 'UPCOMING',
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
      totalVotes: 0,
      totalRevenue: 0,
      createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'event-003',
      name: 'Winter Finale 2023',
      description: 'End of year competition celebrating top performers',
      status: 'CLOSED',
      startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      endDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      totalVotes: 15200,
      totalRevenue: 15200 * 1.5, // Assuming $1.50 per vote
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'event-004',
      name: 'Spring Festival 2024',
      description: 'Spring celebration with regional competitions',
      status: 'ARCHIVED',
      startDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
      endDate: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(), // 150 days ago
      totalVotes: 8950,
      totalRevenue: 8950 * 1.5,
      createdAt: new Date(now.getTime() - 210 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return events;
}

/**
 * Generate a single event for testing
 */
export function generateSingleAdminEvent(
  overrides?: Partial<AdminEvent>
): AdminEvent {
  const now = new Date();

  const baseEvent: AdminEvent = {
    id: `event-${Date.now()}`,
    name: 'New Event',
    description: 'Event description',
    status: 'UPCOMING' as EventStatus,
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000).toISOString(),
    totalVotes: 0,
    totalRevenue: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  return { ...baseEvent, ...overrides };
}
