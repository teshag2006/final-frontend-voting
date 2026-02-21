import { Metadata } from 'next';
import { MediaLeaderboardExperience } from '@/components/media/media-leaderboard-experience';

export const metadata: Metadata = {
  title: 'Live Leaderboard | Media Dashboard',
  description: 'Media-grade live leaderboard optimized for real-time broadcast and mobile screens.',
};

export default function MediaLeaderboardPage() {
  return <MediaLeaderboardExperience />;
}
