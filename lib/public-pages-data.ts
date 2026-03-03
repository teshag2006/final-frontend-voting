import { getAllEvents, getEventContestantsPaginated } from '@/lib/api';

export const FEATURED_EVENTS: any[] = [];
export const UPCOMING_EVENTS: any[] = [];
export const LEADERBOARD_CONTESTANTS: any[] = [];
export const HOME_PAGE_STATS = {
  totalVoters: 0,
  totalVotesCast: 0,
  totalPlatformRevenue: 0,
  activeContestants: 0,
  upcomingEvents: 0,
  liveEvents: 0,
};
export const CATEGORIES: any[] = [];

export async function getFeaturedEvents() {
  const result = await getAllEvents({ page: 1, limit: 6, status: 'active' });
  return result.items;
}

export async function getUpcomingEvents() {
  const result = await getAllEvents({ page: 1, limit: 6, status: 'upcoming' });
  return result.items;
}

export async function getLeaderboardContestants(eventSlug: string) {
  const result = await getEventContestantsPaginated(eventSlug, { page: 1, limit: 20 });
  return result.items;
}
