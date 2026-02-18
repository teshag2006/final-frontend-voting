// @ts-nocheck
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
import { EventStatusGuard } from "@/components/event-status-guard";
import { mockContestantProfile } from "@/lib/contestant-profile-mock";
import { mockVoteEligibility, voteLimits } from "@/lib/vote-eligibility-mock";
import { mockEvents } from "@/lib/events-mock";

const DEFAULT_PRICE_PER_VOTE = 1.0;

export default function VoteSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const eventSlug = params.eventSlug as string;
  const contestantSlug = params.contestantSlug as string;

  // Find event
  const event = mockEvents.find((e) => e.slug === eventSlug);
  const contestant = mockContestantProfile;
  const eligibility = mockVoteEligibility;

  const [quantity, setQuantity] = useState(1);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isFreeVoteLoading, setIsFreeVoteLoading] = useState(false);
  const [isPaidVoteLoading, setIsPaidVoteLoading] = useState(false);

  const totalCost = (quantity * DEFAULT_PRICE_PER_VOTE).toFixed(2);

  // Open SMS verification for free vote
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
        // TODO: Call API with event and contestant context
        // POST /api/vote/free with { phoneNumber, otp, contestantId, eventSlug }
        console.log(
          "[v0] Casting free vote with phone:",
          phoneNumber,
          "OTP:",
          otp,
          "Event:",
          eventSlug,
          "Contestant:",
          contestantSlug
        );

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // TODO: Redirect to receipt page
        // router.push(`/events/${eventSlug}/contestant/${contestantSlug}/receipt/${transactionId}`);
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
      // TODO: Call API to validate quantity and limits with event context
      // POST /api/vote/validate with { quantity, eventSlug, contestantId }
      console.log(
        "[v0] Proceeding to checkout with quantity:",
        quantity,
        "Event:",
        eventSlug
      );

      // TODO: Redirect to checkout page with event and contestant context
      // router.push(`/vote/checkout?eventSlug=${eventSlug}&contestantSlug=${contestantSlug}&quantity=${quantity}`);
    } catch (error) {
      console.error("[v0] Error proceeding to checkout:", error);
    } finally {
      setIsPaidVoteLoading(false);
    }
  }, [quantity, eventSlug, contestantSlug]);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <VoteBreadcrumb
            contestant={contestant}
            eventSlug={eventSlug}
            contestantSlug={contestantSlug}
          />
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EventStatusGuard
            status={event.status}
            eventSlug={eventSlug}
            allowedStatuses={["LIVE", "active"]}
          >
            {/* Free Vote Section */}
            {eligibility.freeEligible && (
              <section className="mb-12 space-y-6">
                <FreeVoteHero />
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <button
                    onClick={handleClaimFreeVote}
                    disabled={isFreeVoteLoading}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isFreeVoteLoading ? "Processing..." : "Claim Free Vote"}
                  </button>
                </div>
              </section>
            )}

            {/* SMS Verification Modal */}
            <SMSVerificationModal
              isOpen={isSMSModalOpen}
              onClose={() => setIsSMSModalOpen(false)}
              onVerify={handleVerifyAndCastVote}
              isLoading={isFreeVoteLoading}
            />

            {/* Divider */}
            {eligibility.freeEligible && (
              <div className="relative my-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-slate-600">
                    Or purchase additional votes
                  </span>
                </div>
              </div>
            )}

            {/* Paid Vote Section */}
            <section className="space-y-6">
              <PaidVoteHero />
              <VoteLimitsInfo limits={voteLimits} />
              <PaidVoteSection
                quantity={quantity}
                onQuantityChange={setQuantity}
                totalCost={totalCost}
              />
              <PaidVotesSummary quantity={quantity} totalCost={totalCost} />
              <button
                onClick={handleProceedToCheckout}
                disabled={isPaidVoteLoading || quantity < 1}
                className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isPaidVoteLoading
                  ? "Processing..."
                  : `Proceed to Checkout (${quantity} vote${quantity !== 1 ? "s" : ""})`}
              </button>
            </section>

            {/* Security Notice */}
            <VotingSecurityNotice />
          </EventStatusGuard>
        </div>
      </main>
    </div>
  );
}


