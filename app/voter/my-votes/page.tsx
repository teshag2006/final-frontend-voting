'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getVoterVotes } from '@/lib/api';
import { VoteCard } from '@/components/voter/vote-card';
import { VoterUnifiedShell } from '@/components/voter/voter-unified-shell';
import { Button } from '@/components/ui/button';
import { Vote } from 'lucide-react';
import { authService } from '@/lib/services/authService';

export default function MyVotesPage() {
  const [votes, setVotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const token = authService.getToken() || undefined;
      const apiData = await getVoterVotes(token);
      setVotes(Array.isArray(apiData?.votes) ? apiData.votes : []);
      setIsLoading(false);
    };
    void load();
  }, []);

  const votesByEvent = useMemo(
    () =>
      votes.reduce((acc: Record<string, any[]>, vote: any) => {
        const key = String(vote.eventName || vote.event_name || 'Event');
        if (!acc[key]) acc[key] = [];
        acc[key].push(vote);
        return acc;
      }, {}),
    [votes]
  );

  const totalVotes = votes.reduce((sum, v) => sum + Number(v.totalVotes || v.total_votes || 0), 0);
  const totalFreeVotes = votes.reduce((sum, v) => sum + Number(v.freeVotes || v.free_votes || 0), 0);
  const totalPaidVotes = votes.reduce((sum, v) => sum + Number(v.paidVotes || v.paid_votes || 0), 0);

  return (
    <VoterUnifiedShell>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">My Votes</h1>
        <p className="text-muted-foreground">Track your voting activity</p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading vote activity...
        </div>
      ) : votes.length > 0 ? (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-1 text-sm text-muted-foreground">Total Votes</p>
              <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-1 text-sm text-muted-foreground">Free Votes Used</p>
              <p className="text-2xl font-bold text-green-600">{totalFreeVotes}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-1 text-sm text-muted-foreground">Paid Votes</p>
              <p className="text-2xl font-bold text-blue-600">{totalPaidVotes}</p>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(votesByEvent).map(([eventName, eventVotes]) => (
              <div key={eventName}>
                <h2 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-foreground">
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
        </>
      ) : (
        <div className="rounded-lg border border-border border-dashed bg-muted/20 p-12 text-center">
          <Vote className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">You have not voted yet</h2>
          <p className="mb-6 text-muted-foreground">
            Start voting for your favorite contestants and your activity will appear here.
          </p>
          <Link href="/events">
            <Button className="gap-2">
              <Vote className="h-4 w-4" />
              Browse Events
            </Button>
          </Link>
        </div>
      )}
    </VoterUnifiedShell>
  );
}
