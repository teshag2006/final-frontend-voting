"use client";

import { useState } from "react";
import { Lock, Shield, CheckCircle2, Hash, Vote } from "lucide-react";
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
    packages.find((p) => p.popular)?.id || packages[0]?.id || ""
  );
  const [contact, setContact] = useState("");

  const selected = packages.find((p) => p.id === selectedPackage);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">
            Vote for {contestantName}
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Support {eventName} Contestant
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("free")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "free"
              ? "border-b-2 border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Free Vote
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "paid"
              ? "border-b-2 border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Paid Vote
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {activeTab === "free" ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              1 free SMS-verified vote per event for Ethiopian voters.
            </p>
            <button
              disabled={!isActive}
              className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActive ? "Cast Free Vote" : "Voting Closed"}
            </button>
          </div>
        ) : (
          <>
            {/* Package options */}
            <div className="flex flex-col gap-2">
              {packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/30 hover:bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        selectedPackage === pkg.id
                          ? "border-primary"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selectedPackage === pkg.id && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {pkg.votes} Votes
                    </span>
                    {pkg.popular && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        <Hash className="inline h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    ${pkg.price}
                    <span className="ml-1 text-accent text-xs">
                      <CheckCircle2 className="inline h-3.5 w-3.5" />
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

            {/* Contact input */}
            <div className="mt-4">
              <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40">
                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground shrink-0">1</span>
                <input
                  type="text"
                  placeholder="Enter your phone or email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              disabled={!isActive || !selected}
              className="mt-4 w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-accent-foreground shadow-md transition-all hover:bg-accent/90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isActive
                ? `Secure Vote - $${selected?.price ?? 0}`
                : "Voting Closed"}
            </button>

            {/* Security badges */}
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">SSL Secure.</span>{" "}
                  956 Bit Encryption
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">Fraud Protected.</span>{" "}
                  Fraud Monitoring
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">Blockchain Anchored.</span>{" "}
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
