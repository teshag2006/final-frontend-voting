'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon } from 'lucide-react';

interface BlockchainInfoWidgetProps {
  blockchain: any;
}

export function BlockchainInfoWidget({ blockchain }: BlockchainInfoWidgetProps) {
  const anchorHash = blockchain?.latestAnchor?.transactionHash || '0xabc1234...789def';
  const blockNumber = blockchain?.latestAnchor?.blockNumber || 12894567;
  const timestamp = blockchain?.latestAnchor?.timestamp || 'Apr 24, 2024. 10:15 AM';

  return (
    <Card className="p-4 border-0 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Assets</h2>
      
      <div className="space-y-4">
        {/* Anchor Hash */}
        <div>
          <label className="text-xs text-gray-600">Latest Anchor Hash:</label>
          <p className="text-sm font-mono text-gray-900 mt-1 break-all">{anchorHash}</p>
        </div>

        {/* Block Number */}
        <div>
          <label className="text-xs text-gray-600">Block Number:</label>
          <p className="text-sm font-bold text-gray-900 mt-1">{blockNumber.toLocaleString()}</p>
        </div>

        {/* Timestamp */}
        <div>
          <label className="text-xs text-gray-600">Timestamp:</label>
          <p className="text-sm text-gray-900 mt-1">{timestamp}</p>
        </div>

        {/* View on Explorer Button */}
        <Button
          variant="outline"
          className="w-full gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
          asChild
        >
          <a href="#" target="_blank" rel="noopener noreferrer">
            <LinkIcon className="w-4 h-4" />
            View on Blockchain Explorer
          </a>
        </Button>
      </div>
    </Card>
  );
}
