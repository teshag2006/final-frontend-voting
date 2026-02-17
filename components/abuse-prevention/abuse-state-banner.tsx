'use client';

import { AlertCircle, Lock, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type AbuseStateType = 
  | 'vote-limit-reached'
  | 'free-vote-used'
  | 'payment-review'
  | 'suspicious-activity'
  | 'too-many-otp-attempts'
  | 'none';

interface AbuseStateBannerProps {
  state: AbuseStateType;
  onRetry?: () => void;
}

export function AbuseStateBanner({ state, onRetry }: AbuseStateBannerProps) {
  if (state === 'none') return null;

  let bgColor = 'bg-red-50 border-red-200';
  let Icon = AlertCircle;
  let title = 'Action Required';
  let message = '';
  let actionText = '';

  switch (state) {
    case 'vote-limit-reached':
      bgColor = 'bg-amber-50 border-amber-200';
      Icon = Lock;
      title = 'Vote Limit Reached';
      message = 'You have reached the maximum number of votes for this category today. Please try again tomorrow.';
      break;

    case 'free-vote-used':
      bgColor = 'bg-blue-50 border-blue-200';
      Icon = Clock;
      title = 'Free Vote Already Used';
      message = 'You have already used your free vote for this category. Purchase additional votes to continue.';
      actionText = 'Buy Votes';
      break;

    case 'payment-review':
      bgColor = 'bg-yellow-50 border-yellow-200';
      Icon = Clock;
      title = 'Payment Under Review';
      message = 'Your recent payment is being processed and verified. Your votes will be credited shortly.';
      break;

    case 'suspicious-activity':
      bgColor = 'bg-red-50 border-red-200';
      Icon = XCircle;
      title = 'Suspicious Activity Detected';
      message = 'We detected unusual activity on your account. Voting has been temporarily disabled for security.';
      actionText = 'Contact Support';
      break;

    case 'too-many-otp-attempts':
      bgColor = 'bg-red-50 border-red-200';
      Icon = Lock;
      title = 'Too Many Login Attempts';
      message = 'You have attempted to log in too many times. Please wait 15 minutes before trying again.';
      break;
  }

  return (
    <div className={`border rounded-lg p-4 ${bgColor}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-700 mt-1">{message}</p>
          {actionText && onRetry && (
            <div className="mt-3">
              <Button
                size="sm"
                onClick={onRetry}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {actionText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
