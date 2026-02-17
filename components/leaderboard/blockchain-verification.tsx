'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface BlockchainVerificationProps {
  hash?: string;
  network?: string;
  explorerUrl?: string;
  blockNumber?: string;
  timestamp?: string;
}

export function BlockchainVerification({
  hash,
  network = 'Ethereum',
  explorerUrl,
  blockNumber,
  timestamp,
}: BlockchainVerificationProps) {
  if (!hash) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-lg">⏳</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Awaiting Blockchain Anchor</h3>
            <p className="text-sm text-blue-800">
              Results are being securely anchored to the blockchain. Check back shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
        <div className="flex gap-3 flex-1">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-3">Results Anchored on {network} Blockchain</h3>
            
            <div className="space-y-2 text-sm mb-4">
              {hash && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-green-800 font-medium">Transaction Hash:</p>
                    <p className="text-green-700 break-all font-mono text-xs">{hash}</p>
                  </div>
                  {blockNumber && (
                    <div>
                      <p className="text-green-800 font-medium">Block Number:</p>
                      <p className="text-green-700 font-mono">#{blockNumber}</p>
                    </div>
                  )}
                </div>
              )}
              
              {timestamp && (
                <div>
                  <p className="text-green-800 font-medium">Timestamp:</p>
                  <p className="text-green-700">{new Date(timestamp).toLocaleString()}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-green-700 mb-4">
              All results are finalized and securely recorded using our blockchain anchoring system to ensure transparency and integrity.
            </p>
          </div>
        </div>

        {explorerUrl && (
          <Button
            asChild
            className="w-full md:w-auto flex-shrink-0 bg-green-600 hover:bg-green-700"
          >
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
