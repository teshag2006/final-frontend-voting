'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Phone } from 'lucide-react';

interface PhoneVerificationProps {
  isVerified: boolean;
  phoneNumber?: string;
  onVerifyClick?: () => void;
}

export function PhoneVerification({
  isVerified,
  phoneNumber,
  onVerifyClick,
}: PhoneVerificationProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="pt-1">
          {isVerified ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Phone Verification</h3>

          {isVerified ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Your phone number has been verified.
              </p>
              {phoneNumber && (
                <p className="text-sm font-medium text-foreground mb-4">
                  {phoneNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground mb-4">
                Your phone is verified and you receive security notifications.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Verify your phone number to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4 ml-4">
                <li>• Receive your free vote for each category</li>
                <li>• Enable two-factor authentication</li>
                <li>• Secure your account</li>
              </ul>
              <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mb-4">
                Without phone verification, you will not be able to claim your free vote.
              </p>
            </>
          )}

          <Link
            href="/verify-phone"
            onClick={onVerifyClick}
            className="inline-block"
          >
            <Button
              variant={isVerified ? 'outline' : 'default'}
              size="sm"
              className="gap-2"
            >
              <Phone className="w-4 h-4" />
              {isVerified ? 'Update Phone' : 'Verify Phone'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
