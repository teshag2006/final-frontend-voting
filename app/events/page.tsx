import { Metadata } from 'next';
import { PublicEventsHomepage } from '@/components/events/public-events-homepage';

export const metadata: Metadata = {
  title: 'Events | Enterprise Voting & Sponsorship Platform',
  description:
    'Where Influence Meets Integrity. Explore live voting events, leaderboard momentum, verified sponsors, and transparent results.',
  openGraph: {
    title: 'Events | Enterprise Voting & Sponsorship Platform',
    description:
      'Africa’s trusted voting and sponsorship ecosystem with real-time integrity monitoring.',
  },
};

export const runtime = 'edge';

export default function EventsPage() {
  return <PublicEventsHomepage />;
}
