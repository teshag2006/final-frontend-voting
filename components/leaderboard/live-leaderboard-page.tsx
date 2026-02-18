'use client'

import { useMemo, useState } from 'react'
import { LeaderboardPodium } from '@/components/leaderboard/leaderboard-podium'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { LeaderboardFilters } from '@/components/leaderboard/leaderboard-filters'
import { LiveStatusBadge } from '@/components/leaderboard/live-status-badge'
import { BlockchainVerification } from '@/components/leaderboard/blockchain-verification'
import { useLiveLeaderboard } from '@/hooks/use-live-leaderboard'

type EventModel = {
  id: string
  name: string
  status: string
  end_date?: string
}

interface LiveLeaderboardPageProps {
  event: EventModel
  initialData: any
}

function statusToBadge(status: string): 'live' | 'pending' | 'closed' {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'live' || normalized === 'active') return 'live'
  if (normalized === 'upcoming' || normalized === 'pending') return 'pending'
  return 'closed'
}

function formatCountdown(totalSeconds?: number): string {
  if (typeof totalSeconds !== 'number' || totalSeconds <= 0) return '00:00'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function LiveLeaderboardPage({ event, initialData }: LiveLeaderboardPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const { data, error, isLoading, isValidating, changedContestantIds, leaderChanged, isFinalMinutes } =
    useLiveLeaderboard(event.id, initialData)

  const leaderboardRows = useMemo(() => {
    const rows = data?.leaderboard || []
    if (!selectedCategory) return rows
    const selectedCategoryName = data?.categories?.find((cat: any) => cat.id === selectedCategory)?.name
    return rows.filter((row: any) => {
      const nameMatch = row.categoryName?.toLowerCase() === String(selectedCategoryName || '').toLowerCase()
      const idMatch = row.categoryId?.toLowerCase?.() === selectedCategory.toLowerCase()
      return nameMatch || idMatch
    })
  }, [data?.leaderboard, selectedCategory])

  const topFive = leaderboardRows.slice(0, 5)
  const podiumRows = (data?.leaderboard || []).slice(0, 3)

  const stats = useMemo(() => {
    return {
      totalVotes: Number(data?.totalVotes || 0),
      totalContestants: Number(topFive.length || 0),
      activeCategories: Number(data?.categories?.length || 0),
    }
  }, [data?.totalVotes, data?.categories, topFive.length])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{event.name}</h1>
              <p className="mt-1 text-slate-600">Live Leaderboard</p>
            </div>
            <LiveStatusBadge
              status={statusToBadge(data?.event?.status || event.status)}
              countdownSeconds={data?.event?.countdownSeconds}
              lastUpdated={data?.lastUpdated}
              generatedAt={data?.generatedAt}
              updateFrequencySeconds={180}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isFinalMinutes && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Event-night mode enabled. Refresh frequency increased for final minutes.
            <span className="ml-2 font-semibold">Countdown: {formatCountdown(data?.event?.countdownSeconds)}</span>
          </div>
        )}

        {leaderChanged && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Rank #1 changed. Standings are updating in real time.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            Leaderboard is temporarily delayed. Showing the latest available snapshot.
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Total Votes (Top 5)</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalVotes.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Contestants Shown</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalContestants}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Active Categories</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.activeCategories}</p>
          </div>
        </div>

        <LeaderboardFilters categories={data?.categories || []} onCategoryChange={setSelectedCategory} isLoading={isValidating} />

        {podiumRows.length >= 3 && (
          <LeaderboardPodium first={podiumRows[0]} second={podiumRows[1]} third={podiumRows[2]} />
        )}

        <div className="mt-12 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <h2 className="text-2xl font-bold text-slate-900">Top 5 Standings</h2>
            {(isLoading || isValidating) && <span className="text-sm text-slate-500">Refreshing...</span>}
          </div>
          <LeaderboardTable contestants={topFive} highlightedContestantIds={changedContestantIds} />
        </div>

        <div className="mt-8">
          <BlockchainVerification />
        </div>
      </div>
    </main>
  )
}
