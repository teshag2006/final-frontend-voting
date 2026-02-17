'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EligibilityStatus {
  isEligible: boolean;
  voteCount: number;
  votingWindow: {
    isActive: boolean;
    startsAt?: string;
    endsAt?: string;
  };
  region: {
    allowed: boolean;
    restrictedTo?: string[];
    userRegion?: string;
  };
  accountAge: {
    met: boolean;
    requiresMinAge?: number;
    accountAgeInDays?: number;
  };
  deviceVerification: {
    verified: boolean;
    status: 'verified' | 'pending' | 'unverified';
  };
  customMessage?: string;
}

interface VoteEligibilityCheckProps {
  status: EligibilityStatus;
  className?: string;
}

export function VoteEligibilityCheck({ status, className }: VoteEligibilityCheckProps) {
  if (status.isEligible) {
    return (
      <Alert className={cn('border-green-200 bg-green-50', className)}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">You're eligible to vote</AlertTitle>
        <AlertDescription className="text-green-800">
          You can cast your vote for this contestant.
        </AlertDescription>
      </Alert>
    );
  }

  const reasons: Array<{
    icon: React.ReactNode;
    title: string;
    message: string;
    severity: 'error' | 'warning';
  }> = [];

  // Voting window check
  if (!status.votingWindow.isActive) {
    reasons.push({
      icon: <Clock className="h-4 w-4" />,
      title: 'Voting is not active',
      message: status.votingWindow.startsAt
        ? `Voting opens at ${new Date(status.votingWindow.startsAt).toLocaleString()}`
        : 'This event is not currently accepting votes',
      severity: 'error',
    });
  }

  // Region check
  if (!status.region.allowed) {
    reasons.push({
      icon: <MapPin className="h-4 w-4" />,
      title: 'Vote not allowed in your region',
      message: status.region.restrictedTo
        ? `Voting is only available in: ${status.region.restrictedTo.join(', ')}`
        : 'Your region is not eligible for voting',
      severity: 'error',
    });
  }

  // Account age check
  if (!status.accountAge.met) {
    reasons.push({
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Account not old enough',
      message: `Your account must be at least ${status.accountAge.requiresMinAge} days old. Current: ${status.accountAge.accountAgeInDays} days`,
      severity: 'warning',
    });
  }

  // Device verification check
  if (status.deviceVerification.status === 'unverified') {
    reasons.push({
      icon: <Smartphone className="h-4 w-4" />,
      title: 'Device verification required',
      message: 'Please verify your device before voting',
      severity: 'warning',
    });
  } else if (status.deviceVerification.status === 'pending') {
    reasons.push({
      icon: <Smartphone className="h-4 w-4" />,
      title: 'Device verification pending',
      message: 'Your device verification is being processed',
      severity: 'warning',
    });
  }

  return (
    <div className={cn('space-y-3', className)}>
      {status.customMessage && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Notice</AlertTitle>
          <AlertDescription className="text-blue-800">{status.customMessage}</AlertDescription>
        </Alert>
      )}

      {reasons.map((reason, idx) => (
        <Alert
          key={idx}
          className={cn(
            reason.severity === 'error'
              ? 'border-red-200 bg-red-50'
              : 'border-yellow-200 bg-yellow-50'
          )}
        >
          <div
            className={cn(
              reason.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
            )}
          >
            {reason.icon}
          </div>
          <div>
            <AlertTitle
              className={cn(
                'text-sm',
                reason.severity === 'error' ? 'text-red-900' : 'text-yellow-900'
              )}
            >
              {reason.title}
            </AlertTitle>
            <AlertDescription
              className={cn(
                'text-sm',
                reason.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
              )}
            >
              {reason.message}
            </AlertDescription>
          </div>
        </Alert>
      ))}

      {/* Summary Badge */}
      <div className="flex items-center gap-2 pt-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {reasons.filter((r) => r.severity === 'error').length} blocking issue
          {reasons.filter((r) => r.severity === 'error').length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
