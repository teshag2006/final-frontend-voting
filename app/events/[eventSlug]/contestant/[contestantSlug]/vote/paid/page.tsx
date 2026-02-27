"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PaidVoteEntryRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading, isAuthenticated, userRole } = useAuth();

  const eventSlug = String(params.eventSlug || "").trim();
  const contestantSlug = String(params.contestantSlug || "").trim();

  useEffect(() => {
    const currentPath = `/events/${eventSlug}/contestant/${contestantSlug}/vote/paid`;
    const loginPath = `/login?next=${encodeURIComponent(currentPath)}`;
    const signupPath = `/signup/voter?next=${encodeURIComponent(currentPath)}`;

    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(loginPath);
      return;
    }

    if (userRole !== "voter") {
      router.replace(signupPath);
      return;
    }

    const params = new URLSearchParams({
      eventSlug,
      contestantSlug,
      quantity: "1",
    });
    router.replace(`/vote/checkout?${params.toString()}`);
  }, [isLoading, isAuthenticated, userRole, eventSlug, contestantSlug, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-600">Redirecting to checkout...</p>
    </div>
  );
}

