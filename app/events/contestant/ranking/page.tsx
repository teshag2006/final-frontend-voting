import type { Metadata } from 'next';
import { getRankingData } from '@/lib/api';
import { mockRankingData } from '@/lib/dashboard-mock';

export const metadata: Metadata = {
  title: 'Ranking | Contestant Portal',
  description: 'View your ranking and position',
};

export default async function RankingPage() {
  const data = (await getRankingData()) || mockRankingData;
  const movement = Number(data.rank_movement || 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Ranking</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Current Rank" value={`#${data.current_rank}`} />
        <Card title="Total Contestants" value={`${data.total_contestants}`} />
        <Card
          title="Rank Movement"
          value={`${movement > 0 ? '+' : ''}${movement}`}
          accent={movement > 0 ? 'text-emerald-600' : movement < 0 ? 'text-red-600' : 'text-slate-900'}
        />
        <Card title="Vote Share" value={`${Number(data.vote_share_percentage).toFixed(1)}%`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Position Details</h2>
          <p className="text-sm text-slate-600">Current standing in this category</p>
          <p className="mt-3 text-5xl font-semibold text-blue-700">#{data.current_rank}</p>
          <p className="mt-2 text-sm text-slate-600">
            {data.current_rank === 1 ? "You are currently leading." : `${data.current_rank - 1} place(s) to reach #1.`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Category Share</h2>
          <p className="text-sm text-slate-600">Your portion of verified votes</p>
          <div className="mt-4">
            <div className="h-3 w-full rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(100, Number(data.vote_share_percentage) || 0)}%` }}
              />
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-900">
              {Number(data.vote_share_percentage).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, accent = 'text-slate-900' }: { title: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-2 text-4xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
