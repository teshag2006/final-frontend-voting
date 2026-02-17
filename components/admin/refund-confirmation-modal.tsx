'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RefundConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  paymentId: string;
  amount: number;
  contestant: string;
  isLoading?: boolean;
}

export function RefundConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  paymentId,
  amount,
  contestant,
  isLoading = false,
}: RefundConfirmationModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Refund</DialogTitle>
          <DialogDescription>
            This action will refund the payment and reverse the vote validity. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Refunding this payment will invalidate any associated votes and trigger an audit log entry.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Payment ID:</span>
            <span className="font-mono">{paymentId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Contestant:</span>
            <span>{contestant}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount to Refund:</span>
            <span className="font-bold">{formatCurrency(amount)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading} className="gap-2">
            {isLoading ? 'Processing...' : 'Confirm Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
