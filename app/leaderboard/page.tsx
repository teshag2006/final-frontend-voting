import { redirect } from 'next/navigation';
import { mockEvents } from '@/lib/events-mock';

export default function LeaderboardIndexPage() {
  const preferredEvent =
    mockEvents.find((event) => event.status === 'LIVE' || event.status === 'active') || mockEvents[0];

  if (preferredEvent?.slug) {
    redirect(`/events/${preferredEvent.slug}/leaderboard`);
  }

  redirect('/events');
}

