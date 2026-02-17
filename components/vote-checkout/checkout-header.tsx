'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface CheckoutHeaderProps {
  contestantImage: string;
  contestantName: string;
  eventName: string;
  category: string;
  rank: number;
  totalVotes: number;
  pricePerVote: number;
}

export function CheckoutHeader({
  contestantImage,
  contestantName,
  eventName,
  category,
  rank,
  totalVotes,
  pricePerVote,
}: CheckoutHeaderProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {/* Left: Contestant Summary Card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
        {/* Profile Image + Name */}
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
            <Image
              src={contestantImage}
              alt={contestantName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{contestantName}</h2>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span className="inline-block w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                🏆
              </span>
              <span>{eventName}</span>
            </div>
          </div>
        </div>

        {/* Event & Category Info */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Event:</span>
            <span className="font-semibold text-white">{eventName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Category:</span>
            <span className="font-semibold text-white">{category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Rank:</span>
            <span className="font-semibold text-white">#{rank}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Total Votes:</span>
            <span className="font-semibold text-white">{totalVotes.toLocaleString()}</span>
          </div>
        </div>

        {/* Price Info */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-sm text-white/60 mb-1">Price per vote</div>
          <div className="text-2xl font-bold text-accent">${pricePerVote.toFixed(2)}</div>
        </div>
      </div>

      {/* Right: Large Contestant Image (Hero) */}
      <div className="hidden md:block relative h-96 rounded-xl overflow-hidden">
        <Image
          src={contestantImage}
          alt={contestantName}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
    </div>
  );
}
