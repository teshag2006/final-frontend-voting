'use client'

import { VerificationResponse } from '@/types/verification'
import { VerificationBanner } from './verification-banner'
import { TransactionDetails } from './transaction-details'
import { BlockchainStatus } from './blockchain-status'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface VerificationResultProps {
  data: VerificationResponse
}

export function VerificationResult({ data }: VerificationResultProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Status Banner */}
      <VerificationBanner status={data.paymentStatus} receiptNumber={data.receiptNumber} />

      {/* Transaction & Verification Details */}
      <TransactionDetails data={data} />

      {/* Blockchain Status */}
      <BlockchainStatus
        isAnchored={data.blockchain.isAnchored}
        network={data.blockchain.network}
        transactionHash={data.blockchain.transactionHash}
      />

      {/* Transparency Message */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 sm:p-6">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Transparency Notice:</span> All verified votes
          are securely recorded and processed through our fraud detection and blockchain
          anchoring system. This ensures the integrity and transparency of every vote cast
          on our platform.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button asChild variant="outline" className="flex-1 sm:flex-none">
          <Link href="/verify">Verify Another Receipt</Link>
        </Button>
        <Button asChild variant="default" className="flex-1 sm:flex-none">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
