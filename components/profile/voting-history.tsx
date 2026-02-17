'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Filter, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vote {
  id: string;
  contestantName: string;
  contestantPhoto?: string;
  category: string;
  voteAmount: number;
  timestamp: string;
  eventName: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface VotingHistoryProps {
  votes: Vote[];
  onExport?: () => void;
  isLoading?: boolean;
}

const statusColors = {
  pending: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function VotingHistory({ votes, onExport, isLoading = false }: VotingHistoryProps) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'amount'>('recent');

  const filteredAndSortedVotes = useMemo(() => {
    let result = [...votes];

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter((v) => v.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return b.voteAmount - a.voteAmount;
      }
    });

    return result;
  }, [votes, filterCategory, sortBy]);

  const categories = Array.from(new Set(votes.map((v) => v.category)));
  const totalVotes = votes.reduce((sum, v) => sum + v.voteAmount, 0);
  const totalAmount = votes.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Voting History</h3>
          <p className="text-sm text-muted-foreground">
            {totalAmount} votes • {totalVotes.toLocaleString()} total vote count
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="amount">Highest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Votes List */}
      <div className="space-y-2">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading votes...
            </CardContent>
          </Card>
        ) : filteredAndSortedVotes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {votes.length === 0 ? 'No voting history yet' : 'No votes match your filters'}
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedVotes.map((vote) => (
            <Card key={vote.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-4 px-4">
                <div className="flex items-center gap-4">
                  {/* Contestant Photo */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={vote.contestantPhoto} />
                    <AvatarFallback>
                      {vote.contestantName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{vote.contestantName}</p>
                      <Badge variant="outline" className="text-xs">
                        {vote.category}
                      </Badge>
                      <Badge className={cn('text-xs', statusColors[vote.status])}>
                        {vote.status.charAt(0).toUpperCase() + vote.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vote.eventName} • {new Date(vote.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Vote Amount */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold">
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                      {vote.voteAmount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(vote.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredAndSortedVotes.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-4 px-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">
                  {filteredAndSortedVotes.reduce((sum, v) => sum + v.voteAmount, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vote Count</p>
                <p className="text-2xl font-bold">{filteredAndSortedVotes.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Per Vote</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredAndSortedVotes.reduce((sum, v) => sum + v.voteAmount, 0) / Math.max(filteredAndSortedVotes.length, 1))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
