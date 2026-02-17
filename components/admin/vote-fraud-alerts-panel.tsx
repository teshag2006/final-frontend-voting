'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FraudAlert, SuspiciousIP } from '@/types/vote-monitoring';
import { AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface VoteFraudAlertsPanelProps {
  alerts: FraudAlert[];
  suspiciousIps: SuspiciousIP[];
  isLoading?: boolean;
  onMarkReviewed?: (alertId: string) => void;
  onBlockIp?: (ipAddress: string) => void;
}

export function VoteFraudAlertsPanel({
  alerts,
  suspiciousIps,
  isLoading,
  onMarkReviewed,
  onBlockIp,
}: VoteFraudAlertsPanelProps) {
  const getSeverityColor = (severity: string) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800',
    };
    return colors[severity as keyof typeof colors] || colors.LOW;
  };

  const getRiskLevelColor = (risk: string) => {
    const colors = {
      LOW: 'border-l-green-500',
      MEDIUM: 'border-l-yellow-500',
      HIGH: 'border-l-red-500',
    };
    return colors[risk as keyof typeof colors] || colors.LOW;
  };

  return (
    <div className="space-y-4">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Active Fraud Alerts
          </CardTitle>
          <CardDescription>Immediate attention required</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-slate-500">No active alerts</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.alertId} className="p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{alert.type.replace(/_/g, ' ')}</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {alert.reviewed && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{alert.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {alert.affectedCount} affected • {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {!alert.reviewed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkReviewed?.(alert.alertId)}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Suspicious IPs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            High-Risk IPs
          </CardTitle>
          <CardDescription>Flagged for suspicious activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : suspiciousIps.length === 0 ? (
            <p className="text-sm text-slate-500">No suspicious IPs detected</p>
          ) : (
            suspiciousIps.map((ip) => (
              <div key={ip.ipAddress} className={`p-3 border rounded-lg ${getRiskLevelColor(ip.riskLevel)} border-l-4`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-semibold">{ip.ipAddress}</code>
                      <Badge variant="outline" className={getSeverityColor(ip.riskLevel)}>
                        {ip.riskLevel}
                      </Badge>
                      {ip.blocked && (
                        <Badge variant="destructive" className="text-xs">
                          BLOCKED
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {ip.voteCount} votes in {ip.timeWindow}s window
                    </p>
                  </div>
                  {!ip.blocked && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => onBlockIp?.(ip.ipAddress)}
                    >
                      Block
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
