'use client';

import { useState } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type ActionType = 'mark_reviewed' | 'block_ip' | 'block_device' | 'override' | 'escalate';

const actionConfig: Record<ActionType, { title: string; description: string; severity: 'warning' | 'danger' }> = {
  mark_reviewed: {
    title: 'Mark as Reviewed',
    description: 'This case will be marked as reviewed but no action will be taken.',
    severity: 'warning',
  },
  block_ip: {
    title: 'Block IP Address',
    description: 'All voting activity from this IP will be blocked. This is a critical action.',
    severity: 'danger',
  },
  block_device: {
    title: 'Block Device',
    description: 'All voting activity from this device fingerprint will be blocked.',
    severity: 'danger',
  },
  override: {
    title: 'Override Risk Score',
    description: 'This will override the fraud detection. This action requires audit logging.',
    severity: 'danger',
  },
  escalate: {
    title: 'Escalate to Security Team',
    description: 'This case will be escalated for manual review by the security team.',
    severity: 'warning',
  },
};

interface FraudActionModalProps {
  isOpen: boolean;
  action?: ActionType;
  targetId?: string;
  targetName?: string;
  onConfirm?: (notes: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function FraudActionModal({
  isOpen,
  action,
  targetId,
  targetName,
  onConfirm,
  onCancel,
  isLoading = false,
}: FraudActionModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!action) return null;

  const config = actionConfig[action];
  const isDanger = config.severity === 'danger';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm?.(notes);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNotes('');
    onCancel?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${isDanger ? 'bg-red-100' : 'bg-amber-100'}`}>
              {isDanger ? (
                <AlertTriangle className={`h-5 w-5 ${isDanger ? 'text-red-600' : 'text-amber-600'}`} />
              ) : (
                <Lock className={`h-5 w-5 text-amber-600`} />
              )}
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {targetName && <code>{targetName}</code>}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className={`p-3 rounded-lg border ${isDanger ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`text-sm ${isDanger ? 'text-red-800' : 'text-amber-800'}`}>
              {config.description}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block">Internal Notes (Required)</label>
            <Textarea
              placeholder="Document your reasoning for this action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting || isLoading}
              className="text-xs resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              All actions are logged with your admin ID for audit purposes.
            </p>
          </div>

          {isDanger && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <Lock className="h-4 w-4 flex-shrink-0" />
              This action may require senior admin approval.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting || isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!notes.trim() || isSubmitting || isLoading}
            variant={isDanger ? 'destructive' : 'default'}
          >
            {isSubmitting ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
