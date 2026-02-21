'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, Zap } from 'lucide-react';
import { applyMockLeaderboardEffects, getMockLeaderboardData } from '@/lib/leaderboard-mock';

const EVENT_ID = 'media-broadcast';
const LIVE_TICK_MS = 8000;

type Row = {
  contestantId: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  categoryName: string;
  totalVotes: number;
  rank: number;
};

type ColumnTheme = {
  shell: string;
  shellBorder: string;
  title: string;
  navText: string;
  tabsWrap: string;
  tabActive: string;
  tabIdle: string;
  chipText: string;
  row: string;
  rowText: string;
  rowSubtext: string;
};

const themes: ColumnTheme[] = [
  {
    shell: 'bg-gradient-to-b from-slate-900 to-slate-950',
    shellBorder: 'border-slate-700',
    title: 'text-white',
    navText: 'text-slate-300',
    tabsWrap: 'bg-slate-800',
    tabActive: 'bg-blue-600 text-white',
    tabIdle: 'text-slate-300',
    chipText: 'text-white',
    row: 'bg-slate-800 border border-slate-700',
    rowText: 'text-slate-100',
    rowSubtext: 'text-slate-400',
  },
  {
    shell: 'bg-gradient-to-b from-slate-900 to-slate-950',
    shellBorder: 'border-slate-700',
    title: 'text-white',
    navText: 'text-slate-300',
    tabsWrap: 'bg-slate-800',
    tabActive: 'bg-blue-600 text-white',
    tabIdle: 'text-slate-300',
    chipText: 'text-white',
    row: 'bg-slate-800 border border-slate-700',
    rowText: 'text-slate-100',
    rowSubtext: 'text-slate-400',
  },
  {
    shell: 'bg-gradient-to-b from-slate-900 to-slate-950',
    shellBorder: 'border-slate-700',
    title: 'text-white',
    navText: 'text-slate-300',
    tabsWrap: 'bg-slate-800',
    tabActive: 'bg-blue-600 text-white',
    tabIdle: 'text-slate-300',
    chipText: 'text-white',
    row: 'bg-slate-800 border border-slate-700',
    rowText: 'text-slate-100',
    rowSubtext: 'text-slate-400',
  },
];

function toRows(): Row[] {
  const data = getMockLeaderboardData(EVENT_ID);
  return [...(data.leaderboard || [])]
    .sort((a: any, b: any) => Number(b.totalVotes || 0) - Number(a.totalVotes || 0))
    .map((item: any, index: number) => ({
      contestantId: item.contestantId,
      firstName: item.firstName,
      lastName: item.lastName,
      profileImageUrl: item.profileImageUrl,
      categoryName: item.categoryName,
      totalVotes: Number(item.totalVotes || 0),
      rank: index + 1,
    }));
}

function formatVotes(votes: number): string {
  return votes.toLocaleString();
}

function scoreByCategory(row: Row, categoryName: string): number {
  const matchBoost = row.categoryName === categoryName ? 1.15 : 0.88;
  return Math.round(row.totalVotes * matchBoost);
}

function AnimatedVoteNumber({ value, className }: { value: number; className?: string }) {
  const previousValueRef = useRef(value);
  const [changedDigitIndexes, setChangedDigitIndexes] = useState<Set<number>>(new Set());
  const [changeTick, setChangeTick] = useState(0);

  const nextText = formatVotes(value);

  useEffect(() => {
    const prevText = formatVotes(previousValueRef.current);
    const changed = new Set<number>();

    for (let idx = 0; idx < nextText.length; idx += 1) {
      const nextChar = nextText[idx];
      const prevIdx = idx - (nextText.length - prevText.length);
      const prevChar = prevIdx >= 0 ? prevText[prevIdx] : '';
      const isDigit = nextChar >= '0' && nextChar <= '9';
      if (isDigit && nextChar !== prevChar) {
        changed.add(idx);
      }
    }

    setChangedDigitIndexes(changed);
    setChangeTick((t) => t + 1);
    previousValueRef.current = value;

    const id = window.setTimeout(() => {
      setChangedDigitIndexes(new Set());
    }, 380);
    return () => window.clearTimeout(id);
  }, [value, nextText]);

  return (
    <span className={className || ''}>
      {nextText.split('').map((char, idx) => {
        const changed = changedDigitIndexes.has(idx);
        return (
          <span
            key={changed ? `${idx}-${changeTick}` : `${idx}-steady`}
            className={
              changed
                ? 'inline-block text-yellow-100 tabular-nums [animation:digit-slide_320ms_cubic-bezier(0.22,1,0.36,1)]'
                : 'inline-block tabular-nums'
            }
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}

function LeaderboardColumn({
  rows,
  theme,
  categoryName,
  categories,
  onCategoryChange,
}: {
  rows: Row[];
  theme: ColumnTheme;
  categoryName: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}) {
  const topThree = rows.slice(0, 3);
  const listRows = rows.slice(3, 10);
  const center = topThree[0];
  const left = topThree[1];
  const right = topThree[2];
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousRects = useRef<Record<string, DOMRect>>({});
  const previousRanks = useRef<Record<string, number>>({});
  const previousCategory = useRef(categoryName);
  const [voteDeltas, setVoteDeltas] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    // When category is changed manually, avoid animating the entire column.
    if (previousCategory.current !== categoryName) {
      previousCategory.current = categoryName;
      const snapshot: Record<string, DOMRect> = {};
      rows.forEach((entry) => {
        const element = itemRefs.current[entry.contestantId];
        if (!element) return;
        snapshot[entry.contestantId] = element.getBoundingClientRect();
      });
      previousRects.current = snapshot;
      previousRanks.current = rows.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.contestantId] = entry.rank;
        return acc;
      }, {});
      return;
    }

    const nextRects: Record<string, DOMRect> = {};
    const nextRanks: Record<string, number> = {};
    rows.forEach((entry) => {
      const element = itemRefs.current[entry.contestantId];
      if (!element) return;
      nextRects[entry.contestantId] = element.getBoundingClientRect();
      nextRanks[entry.contestantId] = entry.rank;
    });

    rows.forEach((entry) => {
      const element = itemRefs.current[entry.contestantId];
      const nextRect = nextRects[entry.contestantId];
      const prevRect = previousRects.current[entry.contestantId];
      const prevRank = previousRanks.current[entry.contestantId];
      if (!element || !nextRect || !prevRect) return;
      if (prevRank === entry.rank) return;

      const deltaX = prevRect.left - nextRect.left;
      const deltaY = prevRect.top - nextRect.top;
      if (!deltaX && !deltaY) return;

      element.style.transition = 'transform 0s';
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      requestAnimationFrame(() => {
        element.style.transition = 'transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)';
        element.style.transform = 'translate(0, 0)';
      });
    });

    previousRects.current = nextRects;
    previousRanks.current = nextRanks;
  }, [rows]);

  useEffect(() => {
    setVoteDeltas((current) => {
      const next: Record<string, number> = {};
      rows.forEach((entry) => {
        const prevVotes = current[`prev-${entry.contestantId}`] ?? entry.totalVotes;
        const diff = entry.totalVotes - prevVotes;
        if (diff > 0) {
          next[entry.contestantId] = diff;
        }
        next[`prev-${entry.contestantId}`] = entry.totalVotes;
      });
      return next;
    });

    const id = window.setTimeout(() => {
      setVoteDeltas((current) => {
        const next: Record<string, number> = {};
        Object.keys(current).forEach((key) => {
          if (key.startsWith('prev-')) {
            next[key] = current[key];
          }
        });
        return next;
      });
    }, 900);

    return () => window.clearTimeout(id);
  }, [rows]);

  return (
    <div className={`rounded-3xl border p-5 shadow-2xl ${theme.shell} ${theme.shellBorder}`}>
      <div className="mb-4 flex items-center justify-center">
        <Select value={categoryName} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-9 w-[190px] border-slate-600 bg-slate-900/90 text-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900 text-slate-100">
            {categories.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="grid grid-cols-3 items-end gap-3">
          {[left, center, right].map((entry, index) => {
            if (!entry) return <div key={`empty-${index}`} />;
            const isCenter = index === 1;
            return (
              <div
                key={entry.contestantId}
                className="text-center"
                ref={(node) => {
                  itemRefs.current[entry.contestantId] = node;
                }}
              >
                <div className={`mx-auto ${isCenter ? 'h-20 w-20' : 'h-14 w-14'}`}>
                  <Avatar className="h-full w-full border-4 border-white/60 shadow-lg">
                    <AvatarImage src={entry.profileImageUrl} alt={`${entry.firstName} ${entry.lastName}`} />
                    <AvatarFallback>{entry.firstName[0]}{entry.lastName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <Badge className="mt-2 bg-black/25 text-white">#{entry.rank}</Badge>
                <p className={`mt-1 text-xl font-bold ${theme.chipText}`}>
                  <AnimatedVoteNumber value={entry.totalVotes} />
                </p>
                {voteDeltas[entry.contestantId] ? (
                  <p className="text-xs font-semibold text-emerald-300 [animation:delta-pop_820ms_ease-out]">
                    +{formatVotes(voteDeltas[entry.contestantId])}
                  </p>
                ) : null}
                <p className={`truncate text-sm ${theme.chipText}`}>{entry.firstName} {entry.lastName}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {listRows.map((entry) => (
          <div
            key={entry.contestantId}
            className={`flex items-center justify-between rounded-xl px-3 py-3 ${theme.row}`}
            ref={(node) => {
              itemRefs.current[entry.contestantId] = node;
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={`w-6 text-lg font-bold ${theme.rowText}`}>{entry.rank}</span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={entry.profileImageUrl} alt={`${entry.firstName} ${entry.lastName}`} />
                <AvatarFallback>{entry.firstName[0]}{entry.lastName[0]}</AvatarFallback>
              </Avatar>
              <p className={`truncate font-semibold ${theme.rowText}`}>{entry.firstName} {entry.lastName}</p>
            </div>
            <p className={`text-lg font-bold ${theme.rowText}`}>
              <AnimatedVoteNumber value={entry.totalVotes} /> <span className={`text-xs font-medium ${theme.rowSubtext}`}>votes</span>
            </p>
            {voteDeltas[entry.contestantId] ? (
              <span className="ml-2 text-xs font-semibold text-emerald-300 [animation:delta-pop_820ms_ease-out]">
                +{formatVotes(voteDeltas[entry.contestantId])}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MediaLeaderboardExperience() {
  const [rows, setRows] = useState<Row[]>(() => toRows());
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setRows((current) => applyMockLeaderboardEffects(current));
    }, LIVE_TICK_MS);
    return () => clearInterval(id);
  }, [autoPlay]);

  const categoryOrder = useMemo(() => {
    const totals = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.categoryName] = (acc[row.categoryName] || 0) + row.totalVotes;
      return acc;
    }, {});

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [rows]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (categoryOrder.length === 0) return;
    setSelectedCategories((current) => {
      const seeded = [...current];
      for (let i = 0; i < 3; i += 1) {
        const currentChoice = seeded[i];
        if (!currentChoice || !categoryOrder.includes(currentChoice)) {
          seeded[i] = categoryOrder[i] || categoryOrder[0];
        }
      }
      return seeded.slice(0, 3);
    });
  }, [categoryOrder]);

  const categoryColumns = useMemo(() => {
    return selectedCategories.map((categoryName) => {
      const categoryRows = rows
        .map((row) => ({
          ...row,
          totalVotes: scoreByCategory(row, categoryName),
        }))
        .sort((a, b) => b.totalVotes - a.totalVotes)
        .slice(0, 10)
        .map((row, index) => ({ ...row, rank: index + 1 }));
      return { categoryName, rows: categoryRows };
    });
  }, [rows, selectedCategories]);

  return (
    <main className="mx-auto w-full max-w-[1920px] space-y-5 px-4 py-5 xl:px-8">
      <style jsx>{`
        @keyframes digit-slide {
          0% { transform: translateY(90%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes delta-pop {
          0% { transform: translateY(6px); opacity: 0; }
          20% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-4px); opacity: 0; }
        }
      `}</style>
      <div className="flex items-center justify-end gap-2">
        <Badge className="border-emerald-400/50 bg-emerald-500/20 px-3 py-1 text-emerald-200">
          <Radio className="mr-1 h-3.5 w-3.5" /> On Air
        </Badge>
        <Button
          size="sm"
          variant={autoPlay ? 'default' : 'outline'}
          onClick={() => setAutoPlay((v) => !v)}
          className={autoPlay ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-200'}
        >
          <Zap className="mr-1 h-4 w-4" /> {autoPlay ? 'Live Feed: ON' : 'Live Feed: OFF'}
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {themes.map((theme, index) => {
          const column = categoryColumns[index];
          if (!column) return null;
          return (
            <LeaderboardColumn
              key={`column-${index}`}
              rows={column.rows}
              categoryName={column.categoryName}
              categories={categoryOrder}
              onCategoryChange={(value) => {
                setSelectedCategories((current) => {
                  const next = [...current];
                  next[index] = value;
                  return next;
                });
              }}
              theme={theme}
            />
          );
        })}
      </section>
    </main>
  );
}
