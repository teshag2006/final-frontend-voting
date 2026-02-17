"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { VoteBreadcrumb } from "@/components/vote-selection/vote-breadcrumb";
import { FreeVoteHero } from "@/components/vote-selection/free-vote-hero";
import { PaidVoteHero } from "@/components/vote-selection/paid-vote-hero";
import { SMSVerificationModal } from "@/components/vote-selection/sms-verification-modal";
import { PaidVoteSection } from "@/components/vote-selection/paid-vote-section";
import { VoteLimitsInfo } from "@/components/vote-selection/vote-limits-info";
import { PaidVotesSummary } from "@/components/vote-selection/paid-votes-summary";
import { VotingSecurityNotice } from "@/components/vote-selection/voting-security-notice";
import { mockContestantProfile } from "@/lib/contestant-profile-mock";
import { mockVoteEligibility, voteLimits } from "@/lib/vote-eligibility-mock";

const DEFAULT_PRICE_PER_VOTE = 1.0;

export default function VoteSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const eventSlug = params.slug as string;
  const contestantSlug = params.contestantSlug as string;

  const contestant = mockContestantProfile;
  const eligibility = mockVoteEligibility;

  const [quantity, setQuantity] = useState(1);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isFreeVoteLoading, setIsFreeVoteLoading] = useState(false);
  const [isPaidVoteLoading, setIsPaidVoteLoading] = useState(false);

  const totalCost = (quantity * DEFAULT_PRICE_PER_VOTE).toFixed(2);

  // Open SMS verification for free vote (Ethiopians only)
  const handleClaimFreeVote = useCallback(async () => {
    if (!eligibility.freeEligible) {
      return;
    }
    setIsSMSModalOpen(true);
  }, [eligibility.freeEligible]);

  // Handle SMS verification and free vote submission
  const handleVerifyAndCastVote = useCallback(
    async (phoneNumber: string, otp: string) => {
      setIsFreeVoteLoading(true);
      try {
        // TODO: Call API to verify OTP and cast free vote
        // POST /api/vote/free with { phoneNumber, otp, contestantId, eventId }
        console.log("[v0] Casting free vote with phone:", phoneNumber, "OTP:", otp);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // TODO: On success, redirect to receipt page
        // router.push(`/event/${eventSlug}/contestant/${contestantSlug}/receipt/${transactionId}`);
      } catch (error) {
        console.error("[v0] Error casting free vote:", error);
        throw error;
      } finally {
        setIsFreeVoteLoading(false);
      }
    },
    [eventSlug, contestantSlug]
  );

  // Proceed to paid checkout
  const handleProceedToCheckout = useCallback(async () => {
    setIsPaidVoteLoading(true);
    try {
      // TODO: POST /api/vote/validate to verify quantity and limits
      console.log("[v0] Proceeding to checkout with quantity:", quantity);
      
      // TODO: Redirect to checkout page with session
      // router.push(`/vote/checkout?eventId=${eventSlug}&contestantId=${contestantSlug}&quantity=${quantity}`);
    } catch (error) {
      console.error("[v0] Error proceeding to checkout:", error);
    } finally {
      setIsPaidVoteLoading(false);
    }
  }, [quantity]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <VoteBreadcrumb
          contestantName={contestant.name}
          eventSlug={eventSlug}
          contestantSlug={contestantSlug}
        />

        {/* Page title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12 text-balance">
          Vote for {contestant.name}
        </h1>

        {/* Hero sections - Side by side layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free vote hero (Ethiopian voters only) */}
          {eligibility.freeEligible && (
            <FreeVoteHero
              eligibility={eligibility}
              onClaim={handleClaimFreeVote}
              isLoading={isFreeVoteLoading}
              contestantImage={contestant.imageUrl}
            />
          )}

          {/* Paid vote hero */}
          <PaidVoteHero
            eligibility={eligibility}
            onProceed={handleProceedToCheckout}
            isLoading={isPaidVoteLoading}
            pricePerVote={DEFAULT_PRICE_PER_VOTE}
          />
        </div>

        {/* Paid voting details section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Purchase Votes</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <PaidVoteSection
              eligibility={eligibility}
              pricePerVote={DEFAULT_PRICE_PER_VOTE}
              onQuantityChange={setQuantity}
              isLoading={isPaidVoteLoading}
            />

            <VoteLimitsInfo limits={voteLimits} />
          </div>

          <PaidVotesSummary
            eligibility={eligibility}
            quantity={quantity}
            totalCost={totalCost}
          />
        </div>

        {/* Security notice */}
        <div className="mt-12">
          <VotingSecurityNotice />
        </div>
      </div>

      {/* SMS Verification Modal */}
      <SMSVerificationModal
        isOpen={isSMSModalOpen}
        onClose={() => setIsSMSModalOpen(false)}
        onVerify={handleVerifyAndCastVote}
        contestantName={contestant.name}
      />
    </main>
  );
}
