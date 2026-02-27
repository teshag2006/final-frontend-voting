'use client';

import Image from 'next/image';

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
    <div className="grid gap-8 items-center">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-slate-200 flex-shrink-0">
            <Image src={contestantImage} alt={contestantName} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{contestantName}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-block h-5 w-5 rounded-full bg-yellow-400 text-center text-xs font-bold leading-5 text-gray-900">
                ??
              </span>
              <span>{eventName}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Event:</span>
            <span className="font-semibold text-slate-900">{eventName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Category:</span>
            <span className="font-semibold text-slate-900">{category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rank:</span>
            <span className="font-semibold text-slate-900">#{rank}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Total Votes:</span>
            <span className="font-semibold text-slate-900">{totalVotes.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="mb-1 text-sm text-slate-500">Price per vote</div>
          <div className="text-2xl font-bold text-accent">${pricePerVote.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
