import { Metadata } from 'next';
import { LiveLeaderboardPage } from '@/components/leaderboard/live-leaderboard-page';
import { getEventBySlug, getEventLeaderboard } from '@/lib/api';

interface LeaderboardPageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: LeaderboardPageProps): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);

  return {
    title: `Live Leaderboard - ${event?.name || 'Event'}`,
    description: 'View real-time voting leaderboard and standings',
    robots: { index: true, follow: true },
    alternates: { canonical: `/events/${eventSlug}/leaderboard` },
  };
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { eventSlug } = await params;
  const [event, rows] = await Promise.all([
    getEventBySlug(eventSlug),
    getEventLeaderboard(eventSlug, 100),
  ]);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  const categoriesMap = new Map<string, string>();
  rows.forEach((row) => {
    if (row.categoryId && row.categoryName) {
      categoriesMap.set(row.categoryId, row.categoryName);
    }
  });

  const initialData = {
    event: {
      id: event.id,
      slug: event.slug,
      name: event.name,
      status: event.status,
      countdownSeconds: undefined as number | undefined,
    },
    categories: Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name })),
    leaderboard: rows,
    totalVotes: rows.reduce((sum, row) => sum + Number(row.totalVotes || 0), 0),
    generatedAt: new Date().toISOString(),
    podium: {
      first: rows[0],
      second: rows[1],
      third: rows[2],
    },
  };

  return <LiveLeaderboardPage event={initialData.event} initialData={initialData} />;
}
