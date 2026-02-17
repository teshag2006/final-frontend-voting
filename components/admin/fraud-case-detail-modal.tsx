'use client';

import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FraudRiskBadge } from './fraud-risk-badge';
import { FraudCaseStatusBadge } from './fraud-case-status-badge';
import { formatDate } from '@/lib/fraud-monitoring-utils';

interface FraudCaseDetail {
  id: string;
  caseId: string;
  type: 'VOTE' | 'PAYMENT' | 'LOGIN';
  userId: string;
  contestant?: string;
  event: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  deviceFingerprint: string;
  status: 'OPEN' | 'REVIEWED' | 'BLOCKED' | 'OVERRIDDEN';
  timestamp: string;
  metadata?: {
    votingVelocity?: number;
    ipGeoCountry?: string;
    deviceFingerprints?: string[];
    previousFlags?: number;
    linkedVotes?: string[];
    linkedPayments?: string[];
    proxyDetected?: boolean;
  };
}

interface FraudCaseDetailModalProps {
  isOpen: boolean;
  case?: FraudCaseDetail;
  onClose: () => void;
  isLoading?: boolean;
}

export function FraudCaseDetailModal({
  isOpen,
  case: fraudCase,
  onClose,
  isLoading = false,
}: FraudCaseDetailModalProps) {
  if (!fraudCase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fraud Case Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Case ID</p>
                  <p className="text-lg font-mono font-bold">{fraudCase.caseId}</p>
                </div>
                <FraudCaseStatusBadge status={fraudCase.status} />
              </div>
              <Separator />
            </div>

            {/* Risk Assessment */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Risk Assessment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Risk Score</p>
                  <FraudRiskBadge
                    level={fraudCase.riskLevel}
                    score={fraudCase.riskScore}
                    showScore
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Risk Level</p>
                  <Badge variant="outline">{fraudCase.riskLevel}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Transaction Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Transaction Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <Badge variant="secondary">{fraudCase.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">User ID</p>
                  <p className="font-mono text-xs">{fraudCase.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Event</p>
                  <p>{fraudCase.event}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contestant</p>
                  <p>{fraudCase.contestant || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                  <p className="text-xs">{formatDate(fraudCase.timestamp)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Network Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Network Details</h4>
              <div className="space-y-2 bg-muted/30 p-3 rounded font-mono text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">IP Address</p>
                  <p className="break-all">{fraudCase.ipAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Device Fingerprint</p>
                  <p className="break-all">{fraudCase.deviceFingerprint}</p>
                </div>
                {fraudCase.metadata?.ipGeoCountry && (
                  <div>
                    <p className="text-muted-foreground mb-1">Geo Location</p>
                    <p>{fraudCase.metadata.ipGeoCountry}</p>
                  </div>
                )}
                {fraudCase.metadata?.proxyDetected && (
                  <div className="text-orange-600">
                    ⚠ Proxy/VPN Detected
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Additional Metadata */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {fraudCase.metadata?.votingVelocity !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Voting Velocity</p>
                    <p>{fraudCase.metadata.votingVelocity} votes/min</p>
                  </div>
                )}
                {fraudCase.metadata?.previousFlags !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Previous Flags</p>
                    <p>{fraudCase.metadata.previousFlags}</p>
                  </div>
                )}
                {fraudCase.metadata?.linkedVotes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-2">Linked Votes</p>
                    <div className="flex gap-2 flex-wrap">
                      {fraudCase.metadata.linkedVotes.slice(0, 5).map((voteId) => (
                        <Badge key={voteId} variant="outline" className="text-xs">
                          {voteId}
                        </Badge>
                      ))}
                      {fraudCase.metadata.linkedVotes.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{fraudCase.metadata.linkedVotes.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Footer Note */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-800">
              This is a read-only view. To take action, use the actions menu.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
