'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Heart } from 'lucide-react';
import type { PublicContestant } from '@/types/public-contestant';

interface ContestantCardProps {
  contestant: PublicContestant;
  categoryId: string;
}

export function ContestantCard({ contestant, categoryId }: ContestantCardProps) {
  const fullName = `${contestant.first_name} ${contestant.last_name}`;
  const contestantSlug = contestant.slug || contestant.id;
  const eventSlug = contestant.event_slug || contestant.eventSlug || 'miss-africa-2024';
  const profileHref = `/events/${eventSlug}/contestant/${contestantSlug}`;
  const voteHref = `${profileHref}/vote`;

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md border border-border hover:border-accent/30">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        <Image
          src={contestant.profile_image_url}
          alt={fullName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />

        {/* Verified Badge */}
        {contestant.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
            <CheckCircle2 className="h-4 w-4 fill-accent text-accent" />
            <span className="text-xs font-semibold text-accent">Verified</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Content Container */}
      <div className="p-4">
        {/* Header with name and country */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {fullName}
            </h3>
            <p className="text-sm text-muted-foreground">{contestant.country}</p>
          </div>
        </div>

        {/* Vote Count */}
        <div className="mb-4 flex items-center gap-2 rounded-md bg-secondary/60 p-2.5">
          <Heart className="h-4 w-4 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Total Votes</p>
            <p className="font-bold text-primary">
              {contestant.total_votes.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={profileHref}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
          >
            View Profile
          </Link>
          <Link
            href={voteHref}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium border border-accent bg-accent/10 text-accent hover:bg-accent/20 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:scale-95"
          >
            Vote
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Category: {categoryId}
        </p>
      </div>
    </div>
  );
}
