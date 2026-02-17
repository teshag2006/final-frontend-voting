'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface VoteConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  contestantName: string
  voteCount: number
  voteType: string
  totalCost?: number
}

export function VoteConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  contestantName,
  voteCount,
  voteType,
  totalCost,
}: VoteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <DialogTitle>Confirm Your Vote</DialogTitle>
              <DialogDescription>Please review the details before proceeding</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Contestant</p>
              <p className="font-semibold">{contestantName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vote Count</p>
              <p className="font-semibold">{voteCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vote Type</p>
              <p className="font-semibold capitalize">{voteType}</p>
            </div>
            {totalCost && (
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="font-semibold">${totalCost.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
            Your vote will be permanently recorded on the blockchain and cannot be reversed.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm Vote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
