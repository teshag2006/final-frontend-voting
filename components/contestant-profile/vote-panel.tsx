"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Phone, Shield, Sparkles, Vote } from "lucide-react";
import type { VotePackage } from "@/types/contestant";

interface VotePanelProps {
  contestantName: string;
  eventName: string;
  packages: VotePackage[];
  isActive: boolean;
}

export function VotePanel({
  contestantName,
  eventName,
  packages,
  isActive,
}: VotePanelProps) {
  const [activeTab, setActiveTab] = useState<"free" | "paid">("paid");
  const [selectedPackage, setSelectedPackage] = useState<string>(
    packages.find((pkg) => pkg.popular)?.id || packages[0]?.id || ""
  );
  const [contact, setContact] = useState("");

  const selected = packages.find((pkg) => pkg.id === selectedPackage);

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
              1 free SMS-verified vote per event for Ethiopian voters.
            </p>
            <button
              disabled={!isActive}
              className="mt-4 w-full rounded-xl bg-accent px-4 py-2.5 text-base font-semibold text-accent-foreground transition-all hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isActive ? "Cast Free Vote" : "Voting Closed"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                    selectedPackage === pkg.id
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/35"
                      : "border-border/90 bg-white hover:border-primary/30 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        selectedPackage === pkg.id
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selectedPackage === pkg.id && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-base font-medium text-foreground">
                      {pkg.votes} Votes
                    </span>
                    {pkg.popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        <Sparkles className="h-3 w-3" />
                        Best Value
                      </span>
                    )}
                  </div>
                  <span className="text-base font-bold tabular-nums text-foreground">
                    ${Number(pkg.price).toLocaleString()}
                    <span className="ml-1 text-base text-accent">
                      <CheckCircle2 className="inline h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="votePackage"
                    value={pkg.id}
                    checked={selectedPackage === pkg.id}
                    onChange={() => setSelectedPackage(pkg.id)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="shrink-0 text-base text-muted-foreground">+1</span>
                <input
                  type="text"
                  placeholder="Enter your phone or email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            <button
              disabled={!isActive || !selected}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-accent to-emerald-500 px-4 py-3 text-base font-bold text-accent-foreground shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isActive ? `Secure Vote - $${selected?.price ?? 0}` : "Voting Closed"}
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
