"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronRight, MapPin, Share2, Shield } from "lucide-react";
import type { ContestantProfile } from "@/types/contestant";

interface ProfileHeroProps {
  contestant: ContestantProfile;
}

export function ProfileHero({ contestant }: ProfileHeroProps) {
  const [copied, setCopied] = useState(false);
  const isActive = contestant.status === "active";
  const isWinner = contestant.status === "winner";
  const isEliminated = contestant.status === "eliminated";
  const totalVotes = Number(contestant.total_votes ?? 0);
  const safeTotalVotes = Number.isFinite(totalVotes) ? totalVotes : 0;
  const safeRank = contestant.rank ?? "-";
  const safeRankOverall = contestant.rank_overall ?? contestant.rank ?? "-";
  const safeCountry = contestant.country || "Pan-African";
  const safeCategory = contestant.category_name || "Contestant";
  const safePhoto = contestant.photo_url || "/images/contestant-1.jpg";
  const profilePath = `/events/${contestant.event_slug}/contestant/${contestant.slug}`;

  const handleCopyProfileLink = async () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const profileUrl = `${origin}${profilePath}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
      } else if (typeof window !== "undefined") {
        window.prompt("Copy profile link:", profileUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      if (typeof window !== "undefined") {
        window.prompt("Copy profile link:", profileUrl);
      }
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_24px_48px_-28px_rgba(33,46,105,0.55)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(120,153,255,0.2),transparent_55%),linear-gradient(110deg,rgba(255,255,255,0.9)_0%,rgba(239,244,255,0.85)_42%,rgba(228,236,255,0.9)_100%)]" />
      <div className="relative flex flex-col md:flex-row">
        <div className="relative aspect-[4/3] w-full shrink-0 md:aspect-[3/4] md:w-[38%] lg:w-[36%]">
          <Image
            src={safePhoto}
            alt={`${contestant.name} profile photo`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 48vw, 420px"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-4 left-4 flex min-w-[72px] items-center justify-center rounded-2xl bg-amber-300 px-4 py-2 text-xl font-black text-primary shadow-lg">
            #{safeRank}
          </div>
          {isWinner && (
            <div className="absolute left-4 top-4 rounded-lg bg-amber-500 px-3 py-1 text-sm font-bold text-foreground shadow-md">
              WINNER
            </div>
          )}
          {isEliminated && (
            <div className="absolute left-4 top-4 rounded-lg bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground shadow-md">
              ELIMINATED
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl lg:text-4xl text-balance">
              {contestant.name}
            </h1>
            {contestant.is_verified && (
              <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-muted-foreground md:text-lg">
            <span className="font-semibold text-foreground">{safeCategory}</span>
            <span>{contestant.tagline || "Contestant"}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {safeCountry}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground tabular-nums md:text-4xl">
              {safeTotalVotes.toLocaleString()}
            </span>
            <span className="text-base text-muted-foreground">Votes</span>
            <span className="rounded-lg bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
              #{safeRankOverall} RANKED
            </span>
          </div>

          {contestant.blockchain_hash && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Blockchain Verified</span>
              <span className="ml-1 text-sm text-emerald-600/90">
                {contestant.blockchain_hash}
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isActive ? (
              <Link
                href={`/events/${contestant.event_slug}/contestant/${contestant.slug}/vote`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-2.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-[0.98]"
              >
                Vote Now
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-6 py-2.5 text-base font-semibold text-muted-foreground cursor-not-allowed opacity-60"
              >
                {isWinner ? "Voting Complete" : isEliminated ? "Eliminated" : "Voting Closed"}
              </button>
            )}
            <button
              type="button"
              onClick={handleCopyProfileLink}
              title={`Copy ${profilePath}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white/75 px-4 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
              {copied ? "Copied link" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
