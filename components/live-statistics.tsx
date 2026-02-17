"use client";

import { Globe2, CheckCircle2, Clock } from "lucide-react";
import type { EventSummary } from "@/types/event";
import { useEffect, useState } from "react";

interface LiveStatisticsProps {
  summary: EventSummary | null;
  closesAt?: string;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculateTimeLeft() {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span className="text-sm font-semibold text-foreground tabular-nums">
      {timeLeft.days} Days {String(timeLeft.hours).padStart(2, "0")}:
      {String(timeLeft.minutes).padStart(2, "0")}.
      {String(timeLeft.seconds).padStart(2, "0")}
    </span>
  );
}

// Flag emoji helper
const FLAG_MAP: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}",
  KE: "\u{1F1F0}\u{1F1EA}",
  US: "\u{1F1FA}\u{1F1F8}",
  GB: "\u{1F1EC}\u{1F1E7}",
  GH: "\u{1F1EC}\u{1F1ED}",
  ZA: "\u{1F1FF}\u{1F1E6}",
};

export function LiveStatistics({ summary, closesAt }: LiveStatisticsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-sky-500" />
          <h3 className="text-sm font-bold text-foreground">Live Statistics</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        </div>
      </div>

      {/* Total Votes */}
      <div className="border-b border-border px-5 py-4">
        <p className="text-xs font-medium text-muted-foreground">Total Votes</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {summary?.total_votes?.toLocaleString() ?? "--"}
        </p>
      </div>

      {/* Active Countries */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-medium text-muted-foreground">Active Countries</span>
        </div>
        <div className="flex items-center gap-2">
          {summary?.country_codes?.slice(0, 4).map((code) => (
            <span key={code} className="text-base" role="img" aria-label={code}>
              {FLAG_MAP[code] ?? code}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {summary?.active_countries ?? "--"}
        </span>
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      </div>

      {/* Blockchain Anchored */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-muted-foreground">Blockchain Anchored</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span className="text-sm font-bold text-foreground">
            {summary?.blockchain_batches ?? "--"}
          </span>
          <span className="text-xs text-muted-foreground">Batches</span>
        </div>
      </div>

      {/* Countdown */}
      {closesAt && (
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Closes in:</span>
          </div>
          <CountdownTimer targetDate={closesAt} />
        </div>
      )}
    </div>
  );
}
