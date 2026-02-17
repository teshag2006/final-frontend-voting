'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { VoteCounter } from '@/components/common/vote-counter'
import { BulkActionToolbar } from '@/components/common/bulk-action-toolbar'
import { Badge } from '@/components/ui/badge'
import { Trash2, Send } from 'lucide-react'

interface ContestantVote {
  contestantId: string
  contestantName: string
  votes: number
  voteType: 'free' | 'paid'
}

interface BulkVoteInterfaceProps {
  contestants: Array<{ id: string; name: string }>
  onSubmitVotes: (votes: ContestantVote[]) => Promise<void>
  maxFreVotes?: number
  maxPaidVotes?: number
}

export function BulkVoteInterface({
  contestants,
  onSubmitVotes,
  maxFreVotes = 10,
  maxPaidVotes = 999,
}: BulkVoteInterfaceProps) {
  const [voteSelections, setVoteSelections] = useState<Map<string, ContestantVote>>(new Map())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)

  const handleToggleSelect = (id: string) => {
    const updated = new Set(selectedIds)
    if (updated.has(id)) {
      updated.delete(id)
    } else {
      updated.add(id)
    }
    setSelectedIds(updated)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === contestants.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contestants.map((c) => c.id)))
    }
  }

  const handleVoteChange = (contestantId: string, votes: number) => {
    if (votes === 0) {
      const updated = new Map(voteSelections)
      updated.delete(contestantId)
      setVoteSelections(updated)
    } else {
      const contestant = contestants.find((c) => c.id === contestantId)
      if (contestant) {
        const updated = new Map(voteSelections)
        updated.set(contestantId, {
          contestantId,
          contestantName: contestant.name,
          votes,
          voteType: 'free',
        })
        setVoteSelections(updated)
      }
    }
  }

  const handleVoteTypeChange = (contestantId: string, voteType: 'free' | 'paid') => {
    const vote = voteSelections.get(contestantId)
    if (vote) {
      const updated = new Map(voteSelections)
      updated.set(contestantId, { ...vote, voteType })
      setVoteSelections(updated)
    }
  }

  const handleRemoveVote = (contestantId: string) => {
    const updated = new Map(voteSelections)
    updated.delete(contestantId)
    setVoteSelections(updated)
  }

  const handleClearAll = () => {
    setVoteSelections(new Map())
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmitVotes(Array.from(voteSelections.values()))
      setVoteSelections(new Map())
      setSelectedIds(new Set())
      setReviewMode(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalVotes = Array.from(voteSelections.values()).reduce((sum, v) => sum + v.votes, 0)
  const selectedVoteCount = voteSelections.size

  if (reviewMode && selectedVoteCount > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Your Votes</CardTitle>
          <CardDescription>
            You are about to submit {totalVotes} votes to {selectedVoteCount} contestant{selectedVoteCount !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Array.from(voteSelections.values()).map((vote) => (
              <div
                key={vote.contestantId}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <div>
                  <p className="font-medium text-sm">{vote.contestantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {vote.votes} {vote.voteType === 'paid' ? 'paid' : 'free'} vote{vote.votes !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
            All votes are permanent and will be recorded on the blockchain. They cannot be reversed.
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setReviewMode(false)} disabled={isSubmitting}>
              Back to Editing
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Votes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cast Bulk Votes</CardTitle>
          <CardDescription>Select contestants and enter vote counts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded">
            <Checkbox
              checked={selectedIds.size === contestants.length && contestants.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label className="text-sm font-medium cursor-pointer">
              Select All ({selectedIds.size} / {contestants.length})
            </label>
          </div>

          {/* Contestant List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contestants.map((contestant) => (
              <div key={contestant.id} className="flex items-center gap-3 p-3 border rounded hover:bg-muted/50">
                <Checkbox
                  checked={selectedIds.has(contestant.id)}
                  onCheckedChange={() => handleToggleSelect(contestant.id)}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{contestant.name}</p>
                </div>
                {voteSelections.has(contestant.id) && (
                  <VoteCounter
                    value={voteSelections.get(contestant.id)!.votes}
                    onChange={(votes) => handleVoteChange(contestant.id, votes)}
                    min={1}
                    max={maxPaidVotes}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vote Review */}
      {selectedVoteCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vote Summary</CardTitle>
            <CardDescription>{selectedVoteCount} contestant(s) selected • {totalVotes} total votes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {Array.from(voteSelections.values()).map((vote) => (
                <div key={vote.contestantId} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{vote.contestantName}</p>
                    <p className="text-xs text-muted-foreground">{vote.votes} votes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={vote.voteType === 'paid' ? 'default' : 'secondary'}>
                      {vote.voteType}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVote(vote.contestantId)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClearAll} className="flex-1">
                Clear All
              </Button>
              <Button onClick={() => setReviewMode(true)} className="flex-1 gap-2">
                <Send className="h-4 w-4" />
                Review & Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
