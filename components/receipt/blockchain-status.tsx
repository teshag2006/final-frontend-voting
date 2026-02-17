'use client'

import { CheckCircle2, Clock } from 'lucide-react'
import { BlockchainInfo } from '@/types/receipt'
import { cn } from '@/lib/utils'

interface BlockchainStatusProps {
  blockchain: BlockchainInfo
}

export function BlockchainStatus({ blockchain }: BlockchainStatusProps) {
  if (!blockchain.isAnchored) {
    return (
      <div className="rounded-2xl bg-white p-6 md:p-8 shadow-lg border-l-4 border-yellow-400">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Awaiting Blockchain Anchor
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Your vote is being securely processed and will be anchored to the blockchain shortly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const shortenHash = (hash: string, length: number = 12) => {
    if (hash.length <= length) return hash
    return `${hash.substring(0, length)}...`
  }

  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-lg border-l-4 border-green-400">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Blockchain Verified
            </h3>
          </div>
        </div>

        {blockchain.network && (
          <div className="ml-9 space-y-3 border-t border-gray-200 pt-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Network</p>
              <p className="text-base font-medium text-gray-900">
                {blockchain.network}
              </p>
            </div>

            {blockchain.transactionHash && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                <p className="text-base font-mono text-gray-900 break-all">
                  {shortenHash(blockchain.transactionHash)}
                </p>
              </div>
            )}

            {blockchain.explorerUrl && (
              <div className="mt-4">
                <a
                  href={blockchain.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                    'bg-blue-50 text-blue-600 hover:bg-blue-100',
                    'font-medium text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                  aria-label="View transaction on blockchain explorer"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
