'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VoteBreadcrumb } from '@/components/vote-selection/vote-breadcrumb';
import { FreeVoteHero } from '@/components/vote-selection/free-vote-hero';
import { PaidVoteHero } from '@/components/vote-selection/paid-vote-hero';
import { PaidVoteSection } from '@/components/vote-selection/paid-vote-section';
import { VoteLimitsInfo } from '@/components/vote-selection/vote-limits-info';
import { PaidVotesSummary } from '@/components/vote-selection/paid-votes-summary';
import { VotingSecurityNotice } from '@/components/vote-selection/voting-security-notice';
import { EventStatusGuard } from '@/components/event-status-guard';
import { getContestantProfile, getEventBySlug, getVoterWallet } from '@/lib/api';
import { authService } from '@/lib/services/authService';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_PRICE_PER_VOTE = 1.0;
const voteLimits = { maxPerTransaction: 100, dailyVotesRemaining: 1000 };

const DEFAULT_ELIGIBILITY = {
  country: 'US',
  freeEligible: false,
  freeUsed: false,
  paidVotesUsed: 0,
  paidVotesRemaining: 0,
  dailyVotesRemaining: 0,
  maxPerTransaction: 0,
};

export default function VoteSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const eventSlug = params.eventSlug as string;
  const contestantSlug = params.contestantSlug as string;

  const { isAuthenticated, isLoading: authLoading, userRole } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [contestant, setContestant] = useState<any>(null);
  const [eligibility, setEligibility] = useState(DEFAULT_ELIGIBILITY);
  const [quantity, setQuantity] = useState(1);
  const [isFreeVoteLoading, setIsFreeVoteLoading] = useState(false);
  const [isPaidVoteLoading, setIsPaidVoteLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const nextPath = encodeURIComponent(
        `/events/${eventSlug}/contestant/${contestantSlug}/vote`
      );
      router.replace(`/login?next=${nextPath}`);
      return;
    }
    if (userRole !== 'voter') {
      router.replace('/signup/voter');
      return;
    }

    const load = async () => {
      const token = authService.getToken() || undefined;
      const [eventRes, contestantRes, walletRes] = await Promise.all([
        getEventBySlug(eventSlug),
        getContestantProfile(eventSlug, contestantSlug),
        getVoterWallet(token),
      ]);

      setEvent(eventRes);
      setContestant(contestantRes);

      const freeCategory = Array.isArray(walletRes?.freeVotes)
        ? walletRes?.freeVotes?.find((item: any) => String(item.categoryId || item.category_id))
        : null;
      setEligibility({
        country: String(walletRes?.country || 'US'),
        freeEligible: Boolean(walletRes?.isPhoneVerified),
        freeUsed: freeCategory ? Number(freeCategory.remaining || 0) <= 0 : false,
        paidVotesUsed: Number(walletRes?.totalVotesUsed || 0),
        paidVotesRemaining: Number(walletRes?.paidVotesRemaining || 0),
        dailyVotesRemaining: Number(walletRes?.dailyVotesRemaining || 0),
        maxPerTransaction: Number(walletRes?.maxPerTransaction || 100),
      });
    };
    void load();
  }, [authLoading, isAuthenticated, userRole, eventSlug, contestantSlug, router]);

  const estimatedTotalCost = (quantity * DEFAULT_PRICE_PER_VOTE).toFixed(2);

  const handleClaimFreeVote = useCallback(async () => {
    if (!eligibility.freeEligible) return;
    setIsFreeVoteLoading(true);
    router.push(`/events/${eventSlug}/contestant/${contestantSlug}/vote/free`);
  }, [eligibility.freeEligible, eventSlug, contestantSlug, router]);

  const handleProceedToCheckout = useCallback(async () => {
    setIsPaidVoteLoading(true);
    setErrorMessage(null);
    try {
      if (eligibility.paidVotesRemaining <= 0) {
        setErrorMessage('Your paid wallet has insufficient balance. Buy a vote package first.');
        router.push('/vote/checkout?quantity=10');
        return;
      }
      router.push(`/events/${eventSlug}/contestant/${contestantSlug}/vote/paid`);
    } catch {
      setErrorMessage('Checkout is temporarily unavailable. Please try again.');
    } finally {
      setIsPaidVoteLoading(false);
    }
  }, [eventSlug, contestantSlug, router]);

  if (!event || !contestant || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto px-4 py-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <VoteBreadcrumb contestant={contestant} eventSlug={eventSlug} contestantSlug={contestantSlug} />
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <EventStatusGuard
            status={event.status}
            eventSlug={eventSlug}
            allowedStatuses={['LIVE', 'active']}
          >
            {eligibility.freeEligible && (
              <section className="mb-12 space-y-6">
                <FreeVoteHero
                  eligibility={eligibility}
                  onClaim={handleClaimFreeVote}
                  isLoading={isFreeVoteLoading}
                  contestantImage={contestant?.photo_url}
                />
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <button
                    onClick={handleClaimFreeVote}
                    disabled={isFreeVoteLoading}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isFreeVoteLoading ? 'Processing...' : 'Claim Free Vote'}
                  </button>
                </div>
              </section>
            )}

            {eligibility.freeEligible && (
              <div className="relative my-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-slate-600">
                    Or purchase additional votes
                  </span>
                </div>
              </div>
            )}

            <section className="space-y-6">
              <PaidVoteHero
                eligibility={eligibility}
                onProceed={handleProceedToCheckout}
                isLoading={isPaidVoteLoading}
                pricePerVote={DEFAULT_PRICE_PER_VOTE}
              />
              <VoteLimitsInfo limits={voteLimits} />
              <PaidVoteSection eligibility={eligibility} onQuantityChange={setQuantity} />
              <PaidVotesSummary
                eligibility={eligibility}
                quantity={quantity}
                totalCost={estimatedTotalCost}
              />
              <p className="text-xs text-slate-500">
                Estimated amount shown. Final pricing and limits are confirmed by backend at checkout.
              </p>
              <button
                onClick={handleProceedToCheckout}
                disabled={isPaidVoteLoading || quantity < 1}
                className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isPaidVoteLoading
                  ? 'Processing...'
                  : `Proceed to Checkout (${quantity} vote${quantity !== 1 ? 's' : ''})`}
              </button>
            </section>
            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <VotingSecurityNotice />
          </EventStatusGuard>
        </div>
      </main>
    </div>
  );
}
