// @ts-nocheck
import type { Metadata } from 'next';
import Link from 'next/link';
import { getVoterVotes } from '@/lib/api';
import { mockVoterVotes } from '@/lib/voter-mock';
import { VoteCard } from '@/components/voter/vote-card';
import { VoterSidebarNav } from '@/components/voter/voter-sidebar-nav';
import { Button } from '@/components/ui/button';
import { Vote } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Votes | Miss & Mr Africa',
  description: 'Track your voting activity and see who you voted for',
};

export default async function MyVotesPage() {
  const apiData = await getVoterVotes();
  const data = apiData || mockVoterVotes;
  const votes = data.votes;

  // Group votes by event
  const votesByEvent = votes.reduce(
    (acc, vote) => {
      if (!acc[vote.eventName]) {
        acc[vote.eventName] = [];
      }
      acc[vote.eventName].push(vote);
      return acc;
    },
    {} as Record<string, typeof votes>
  );

  const totalVotes = votes.reduce((sum, v) => sum + v.totalVotes, 0);
  const totalFreeVotes = votes.reduce((sum, v) => sum + v.freeVotes, 0);
  const totalPaidVotes = votes.reduce((sum, v) => sum + v.paidVotes, 0);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <VoterSidebarNav />
        <div className="min-w-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Votes</h1>
          <p className="text-muted-foreground">Track your voting activity</p>
        </div>

        {/* Stats */}
        {votes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Votes</p>
              <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Free Votes Used</p>
              <p className="text-2xl font-bold text-green-600">{totalFreeVotes}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Paid Votes</p>
              <p className="text-2xl font-bold text-blue-600">{totalPaidVotes}</p>
            </div>
          </div>
        )}

        {/* Votes */}
        {votes.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(votesByEvent).map(([eventName, eventVotes]) => (
              <div key={eventName}>
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  {eventName}
                </h2>
                <div className="space-y-3">
                  {eventVotes.map((vote, index) => (
                    <VoteCard key={`${eventName}-${index}`} vote={vote} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border border-dashed bg-muted/20 p-12 text-center">
            <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              You haven't voted yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start voting for your favorite contestants and your voting activity will
              appear here.
            </p>
            <Link href="/category/1">
              <Button className="gap-2">
                <Vote className="w-4 h-4" />
                Browse Contestants
              </Button>
            </Link>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}

