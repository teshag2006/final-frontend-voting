'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink, CheckCircle, Clock } from 'lucide-react'
import { shortenHash, getExplorerUrl } from '@/lib/verify-mock'

interface BlockchainStatusProps {
  isAnchored: boolean
  network?: string
  transactionHash?: string
}

export function BlockchainStatus({
  isAnchored,
  network = 'Ethereum',
  transactionHash,
}: BlockchainStatusProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isAnchored ? (
            <CheckCircle className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          ) : (
            <Clock className="h-6 w-6 text-amber-600" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {isAnchored ? 'Blockchain Verified' : 'Awaiting Blockchain Anchor'}
          </h3>

          {isAnchored && transactionHash && network ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Network</p>
                <p className="text-base font-medium text-slate-900">{network}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Transaction Hash</p>
                <code className="block text-sm font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-lg break-all">
                  {shortenHash(transactionHash)}
                </code>
              </div>

              <Button
                asChild
                variant="default"
                className="w-full sm:w-auto"
                aria-label={`View on ${network} Explorer`}
              >
                <a
                  href={getExplorerUrl(transactionHash, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  View on {network} Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Your vote is being anchored on the blockchain. This process typically
              takes 5-15 minutes. You can close this page and check back later using
              the same receipt number.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
