'use client';

import Image from 'next/image';
import { LeaderboardContestant } from '@/types/leaderboard';
import { Badge } from '@/components/ui/badge';

interface LeaderboardPodiumProps {
  first: LeaderboardContestant;
  second: LeaderboardContestant;
  third: LeaderboardContestant;
}

export function LeaderboardPodium({
  first,
  second,
  third,
}: LeaderboardPodiumProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
      {/* 2nd Place - Silver */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 order-2 md:order-1">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-100 rounded-2xl shadow-md"></div>
          <Image
            src={second.profileImageUrl}
            alt={`${second.firstName} ${second.lastName}`}
            fill
            className="object-cover rounded-2xl p-1"
          />
          <div className="absolute -top-3 -right-3 text-4xl">🥈</div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 order-1 md:order-2">{second.firstName} {second.lastName}</h3>
        <p className="text-sm text-slate-600 mb-2 order-3">{second.categoryName}</p>
        <p className="text-2xl font-bold text-slate-900 order-4">{second.totalVotes.toLocaleString()}</p>
        <p className="text-xs text-slate-500 order-5">Votes</p>
      </div>

      {/* 1st Place - Gold */}
      <div className="flex flex-col items-center -mt-8">
        <div className="relative w-40 h-40 md:w-48 md:h-48 mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-200 to-yellow-100 rounded-2xl shadow-lg ring-4 ring-yellow-300"></div>
          <Image
            src={first.profileImageUrl}
            alt={`${first.firstName} ${first.lastName}`}
            fill
            className="object-cover rounded-2xl p-2"
          />
          <div className="absolute -top-4 -right-4 text-5xl">🥇</div>
        </div>
        <h3 className="text-xl font-bold text-slate-900">{first.firstName} {first.lastName}</h3>
        <p className="text-sm text-slate-600 mb-2">{first.categoryName}</p>
        <p className="text-3xl font-bold text-yellow-600">{first.totalVotes.toLocaleString()}</p>
        <p className="text-xs text-slate-500">Votes</p>
      </div>

      {/* 3rd Place - Bronze */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 order-2 md:order-1">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-200 to-orange-100 rounded-2xl shadow-md"></div>
          <Image
            src={third.profileImageUrl}
            alt={`${third.firstName} ${third.lastName}`}
            fill
            className="object-cover rounded-2xl p-1"
          />
          <div className="absolute -top-3 -left-3 text-4xl">🥉</div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 order-1 md:order-2">{third.firstName} {third.lastName}</h3>
        <p className="text-sm text-slate-600 mb-2 order-3">{third.categoryName}</p>
        <p className="text-2xl font-bold text-slate-900 order-4">{third.totalVotes.toLocaleString()}</p>
        <p className="text-xs text-slate-500 order-5">Votes</p>
      </div>
    </div>
  );
}
