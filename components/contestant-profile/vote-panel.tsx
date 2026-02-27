"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, Shield, Vote } from "lucide-react";

interface VotePanelProps {
  contestantName: string;
  eventName: string;
  eventSlug: string;
  contestantSlug: string;
  isActive: boolean;
}

export function VotePanel({
  contestantName,
  eventName,
  eventSlug,
  contestantSlug,
  isActive,
}: VotePanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 shadow-[0_18px_38px_-24px_rgba(33,46,105,0.55)] backdrop-blur">
      <div className="border-b border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(241,245,255,0.92)_100%)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Vote for {contestantName}</h3>
        </div>
        <p className="mt-0.5 text-base text-muted-foreground">
          Support {eventName} Contestant
        </p>
      </div>

      <div className="grid grid-cols-2 gap-0 border-b border-border bg-secondary/40 p-1.5">
        <button
          onClick={() => setActiveTab("free")}
          className={`rounded-lg bg-gradient-to-r from-primary to-primary/80 py-2.5 text-base font-semibold text-primary-foreground transition-all ${
            activeTab === "free"
              ? "opacity-100 shadow-sm"
              : "opacity-60 hover:opacity-85"
          }`}
        >
          Free Vote
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`rounded-lg bg-gradient-to-r from-primary to-primary/80 py-2.5 text-base font-semibold text-primary-foreground transition-all ${
            activeTab === "paid"
              ? "opacity-100 shadow-sm"
              : "opacity-60 hover:opacity-85"
          }`}
        >
          Paid Vote
        </button>
      </div>

      <div className="p-5">
        {activeTab === "free" ? (
          <div className="rounded-xl border border-border/80 bg-secondary/40 px-4 py-6 text-center">
            <p className="text-base text-muted-foreground">
              1 free SMS-verified vote per category per event for Ethiopian voters.
            </p>
            <button
              onClick={() =>
                router.push(`/events/${eventSlug}/contestant/${contestantSlug}/vote/free`)
              }
              disabled={!isActive}
              className="mt-4 w-full rounded-xl bg-accent px-4 py-2.5 text-base font-semibold text-accent-foreground transition-all hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isActive ? "Cast Free Vote" : "Voting Closed"}
            </button>
          </div>
        ) : (
          <>
            <p className="rounded-xl border border-border/80 bg-secondary/35 px-4 py-3 text-sm text-muted-foreground">
              Paid voting is handled in secure checkout. Select your quantity and payment method on the next page.
            </p>

            <button
              onClick={() =>
                router.push(
                  `/events/${eventSlug}/contestant/${contestantSlug}/vote/paid`
                )
              }
              disabled={!isActive}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-accent to-emerald-500 px-4 py-3 text-base font-bold text-accent-foreground shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isActive ? "Proceed to Checkout" : "Voting Closed"}
            </button>

            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border/80 bg-secondary/35 px-3 py-3">
              <div className="flex items-center gap-2 text-base text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold text-foreground">SSL Secure.</span>{" "}
                  Industry-standard TLS encryption
                </span>
              </div>
              <div className="flex items-center gap-2 text-base text-muted-foreground">
                <Shield className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold text-foreground">Fraud Protected.</span>{" "}
                  Fraud Monitoring
                </span>
              </div>
              <div className="flex items-center gap-2 text-base text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span>
                  <span className="font-semibold text-foreground">Blockchain Verification.</span>{" "}
                  Verified
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
