"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockContestantProfile } from "@/lib/contestant-profile-mock";
import { mockEvents } from "@/lib/events-mock";
import { getContestantsForEvent } from "@/lib/mock-data-generator";
import { slugify } from "@/lib/slug";
import { useAuth } from "@/context/AuthContext";

interface WalletSnapshot {
  isPhoneVerified: boolean;
  phoneNumber?: string;
  freeVotes?: Array<{
    eventSlug?: string;
    categoryId?: string;
    isUsed?: boolean;
  }>;
}

export default function FreeVoteCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading, isAuthenticated, userRole } = useAuth();
  const eventSlug = params.eventSlug as string;
  const contestantSlug = params.contestantSlug as string;
  const currentPath = `/events/${eventSlug}/contestant/${contestantSlug}/vote/free`;
  const loginPath = `/login?next=${encodeURIComponent(currentPath)}`;
  const signupPath = `/signup/voter?next=${encodeURIComponent(currentPath)}`;
  const verifyPath = `/verify-phone?next=${encodeURIComponent(currentPath)}`;

  const event = mockEvents.find((e) => e.slug === eventSlug);
  const selectedContestant = getContestantsForEvent(eventSlug).find(
    (item) => item.slug === contestantSlug
  );
  const contestant = selectedContestant || mockContestantProfile;
  const categoryName = String(
    selectedContestant?.category || (contestant as any).category_name || "General"
  );
  const categoryId = `${eventSlug}:${slugify(categoryName)}`;

  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [isFreeVoteLoading, setIsFreeVoteLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(loginPath);
      return;
    }

    if (userRole !== "voter") {
      router.replace(signupPath);
      return;
    }

    const loadWallet = async () => {
      setWalletLoading(true);
      try {
        const response = await fetch("/api/voter/wallet", {
          method: "GET",
          credentials: "same-origin",
        });
        const payload = (await response.json().catch(() => null)) as WalletSnapshot | null;

        if (!response.ok) {
          if (response.status === 401) {
            router.replace(loginPath);
            return;
          }
          if (response.status === 403) {
            router.replace(signupPath);
            return;
          }
          throw new Error("Unable to load voter wallet");
        }

        setWallet(payload);
        if (!payload?.isPhoneVerified) {
          router.replace(verifyPath);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load voter wallet."
        );
      } finally {
        setWalletLoading(false);
      }
    };

    void loadWallet();
  }, [isLoading, isAuthenticated, userRole, router, loginPath, signupPath, verifyPath]);

  const eligibility = useMemo(() => {
    const usedForCategory = Boolean(
      wallet?.freeVotes?.find(
        (item) => item?.eventSlug === eventSlug && item?.categoryId === categoryId && item?.isUsed
      )
    );

    return {
      freeEligible: Boolean(wallet?.isPhoneVerified),
      freeUsed: usedForCategory,
    };
  }, [wallet, eventSlug, categoryId]);

  const handleClaimFreeVote = useCallback(async () => {
    if (!eligibility.freeEligible) {
      return;
    }
    setIsFreeVoteLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const voteResponse = await fetch("/api/voter/vote", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          eventName: event?.name,
          categoryId,
          categoryName,
          contestantName: contestant.name,
          isPaid: false,
          quantity: 1,
        }),
      });
      const votePayload = await voteResponse.json().catch(() => null);
      if (!voteResponse.ok) {
        if (voteResponse.status === 401) {
          router.replace(loginPath);
          return;
        }
        if (voteResponse.status === 403) {
          router.replace(signupPath);
          return;
        }
        throw new Error(votePayload?.message || "Free vote failed");
      }

      const targetPath = `/events/${eventSlug}/contestant/${contestantSlug}`;
      setInfoMessage("Free vote confirmed.");
      router.replace(targetPath);
      setTimeout(() => {
        if (window.location.pathname.includes("/vote/free")) {
          window.location.assign(targetPath);
        }
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to confirm your free vote right now. Please retry."
      );
    } finally {
      setIsFreeVoteLoading(false);
    }
  },
  [
    eventSlug,
    contestantSlug,
    router,
    categoryId,
    categoryName,
    contestant.name,
    event?.name,
    loginPath,
    signupPath,
  ]
  );

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  if (isLoading || walletLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Free Vote</h1>
        <p className="mt-1 text-sm text-slate-600">{contestant.name}</p>
        <p className="text-sm text-slate-600">{categoryName}</p>

        {eligibility.freeEligible && !eligibility.freeUsed && (
          <button
            onClick={handleClaimFreeVote}
            disabled={isFreeVoteLoading}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isFreeVoteLoading ? "Submitting..." : "Cast Free Vote"}
          </button>
        )}

        {eligibility.freeUsed && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Free vote already used for this category.
          </p>
        )}

        {!eligibility.freeEligible && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Free vote is not available.
          </p>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {infoMessage && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {infoMessage}
          </div>
        )}
        <div className="mt-4">
          <button
            onClick={() => router.push(`/events/${eventSlug}/contestant/${contestantSlug}`)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
