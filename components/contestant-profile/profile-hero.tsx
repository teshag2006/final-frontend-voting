"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Share2, Shield } from "lucide-react";
import type { ContestantProfile } from "@/types/contestant";

interface ProfileHeroProps {
  contestant: ContestantProfile;
}

export function ProfileHero({ contestant }: ProfileHeroProps) {
  const isActive = contestant.status === "active";
  const isWinner = contestant.status === "winner";
  const isEliminated = contestant.status === "eliminated";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col md:flex-row">
        {/* Photo */}
        <div className="relative aspect-[3/4] w-full md:w-80 lg:w-96 shrink-0">
          <Image
            src={contestant.photo_url}
            alt={`${contestant.name} profile photo`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 384px"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Rank badge */}
          <div className="absolute bottom-4 left-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg">
            #{contestant.rank}
          </div>
          {/* Winner / Eliminated overlay */}
          {isWinner && (
            <div className="absolute top-4 left-4 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-foreground shadow-md">
              WINNER
            </div>
          )}
          {isEliminated && (
            <div className="absolute top-4 left-4 rounded-lg bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground shadow-md">
              ELIMINATED
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          {/* Name + Verified */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl lg:text-4xl text-balance">
              {contestant.name}
            </h1>
            {contestant.is_verified && (
              <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
            )}
          </div>

          {/* Category + Country */}
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            <span className="font-semibold text-foreground">{contestant.category_name}</span>
            {" "}
            {contestant.tagline || "Contestant"}
            {" "}
            <span className="inline-block">
              {"  "}
              {contestant.country}
            </span>
          </p>

          {/* Vote count */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground tabular-nums md:text-4xl">
              {contestant.total_votes.toLocaleString()}
            </span>
            <span className="text-base text-muted-foreground">Votes</span>
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              #{contestant.rank_overall} RANKED
            </span>
          </div>

          {/* Blockchain badge */}
          {contestant.blockchain_hash && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-accent">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Blockchain Verified</span>
              <span className="text-xs text-muted-foreground ml-1">
                {contestant.blockchain_hash}
              </span>
            </div>
          )}

          {/* CTA buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isActive ? (
              <Link
                href={`/events/${contestant.event_slug}/contestant/${contestant.slug}/vote`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.97]"
              >
                Vote Now
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-6 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed opacity-60"
              >
                {isWinner ? "Voting Complete" : isEliminated ? "Eliminated" : "Voting Closed"}
              </button>
            )}
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
