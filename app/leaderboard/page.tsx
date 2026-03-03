import { redirect } from 'next/navigation';
import { getAllEvents } from '@/lib/api';

export default async function LeaderboardIndexPage() {
  const events = await getAllEvents({ page: 1, limit: 100 });
  const preferredEvent =
    events.items.find((event) => event.status === 'LIVE' || event.status === 'active') ||
    events.items[0];

  if (preferredEvent?.slug) {
    redirect(`/events/${preferredEvent.slug}/leaderboard`);
  }

  redirect('/events');
}
