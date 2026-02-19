import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockTopContestants } from '@/lib/media-mock';

export const metadata = {
  title: 'Live Leaderboard | Media Dashboard',
  description: 'Real-time leaderboard rankings for media broadcasting.',
};

export default function MediaLeaderboardPage() {
  return (
      <main className="space-y-6 px-4 py-6 md:px-6">
        {/* Header with Controls (single row on desktop) */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="min-w-0 shrink-0">
            <h1 className="text-2xl font-bold text-white">Live Leaderboard</h1>
            <p className="text-sm text-slate-400">Real-time contestant rankings</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:justify-end">
            <div className="relative w-full sm:w-[240px] lg:w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search contestants..."
                className="h-9 border-slate-700 bg-slate-900 pl-10 text-white placeholder:text-slate-500"
              />
            </div>

            <Select defaultValue="all">
              <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900 text-white sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-900">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="miss">Miss Africa</SelectItem>
                <SelectItem value="mr">Mr Africa</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-9 border-slate-700 px-3">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card className="border-0 bg-slate-950 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Contestant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Total Votes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Vote %</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Trend</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {mockTopContestants.slice(0, 10).map((contestant, idx) => {
                  const getTrendIcon = () => {
                    if (contestant.trend === 'up') return <TrendingUp className="h-4 w-4 text-green-400" />;
                    if (contestant.trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
                    return <Minus className="h-4 w-4 text-slate-400" />;
                  };

                  const isTopThree = idx < 3;
                  const medalEmoji = ['🥇', '🥈', '🥉'][idx];

                  return (
                    <tr
                      key={contestant.rank}
                      className={`border-b border-slate-700 transition-colors hover:bg-slate-900 ${
                        isTopThree ? 'bg-slate-900/50' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-semibold text-white">
                        <span className="mr-2">{medalEmoji}</span>#{contestant.rank}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contestant.avatar} alt={contestant.name} />
                            <AvatarFallback className="bg-slate-800 text-white text-xs">
                              {contestant.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-white">{contestant.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-400">Miss Africa</td>
                      <td className="px-4 py-4 text-right font-semibold text-white">
                        {(contestant.totalVotes / 1000).toFixed(1)}k
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${(contestant.totalVotes / 57000) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">
                            {((contestant.totalVotes / 1245330) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">{getTrendIcon()}</td>
                      <td className="px-4 py-4 text-right font-semibold text-emerald-400">
                        ${contestant.revenue.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Showing 1-10 of 250 contestants</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="border-slate-700">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700">
              Next
            </Button>
          </div>
        </div>
      </main>
  );
}
