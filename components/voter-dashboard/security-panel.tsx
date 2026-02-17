'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Globe } from 'lucide-react';

interface SecurityPanelProps {
  device: string;
  lastLogin: string;
  location: string;
  riskStatus: 'low' | 'review' | 'blocked';
  onManageSessionsClick?: () => void;
  onReVerifyClick?: () => void;
}

export function SecurityPanel({
  device,
  lastLogin,
  location,
  riskStatus,
  onManageSessionsClick,
  onReVerifyClick,
}: SecurityPanelProps) {
  const getRiskBadge = () => {
    switch (riskStatus) {
      case 'low':
        return (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs font-medium text-green-700">Low Risk</p>
              <p className="text-xs text-green-600">Your account is secure</p>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-xs font-medium text-orange-700">Review Required</p>
              <p className="text-xs text-orange-600">
                Unusual activity detected. Please verify your phone.
              </p>
            </div>
          </div>
        );
      case 'blocked':
        return (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xs font-medium text-red-700">Account Restricted</p>
              <p className="text-xs text-red-600">
                Your account is temporarily restricted. Contact support.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          Your Device & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Status */}
        {getRiskBadge()}

        {/* Device Info */}
        <div className="space-y-3 rounded-lg bg-secondary/30 p-4">
          <div className="flex items-start justify-between text-sm">
            <span className="text-muted-foreground">Device</span>
            <span className="font-medium text-foreground text-right">{device}</span>
          </div>
          <div className="flex items-start justify-between text-sm">
            <span className="text-muted-foreground">Last Login</span>
            <span className="font-medium text-foreground text-right">{lastLogin}</span>
          </div>
          <div className="flex items-start justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-foreground text-right">{location}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={onManageSessionsClick}
            className="flex-1"
          >
            Manage Sessions
          </Button>
          {riskStatus !== 'low' && (
            <Button
              size="sm"
              onClick={onReVerifyClick}
              className="flex-1"
            >
              Re-Verify Phone
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
