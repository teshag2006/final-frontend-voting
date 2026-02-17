'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface VerificationErrorProps {
  receiptNumber?: string
  isNotFound?: boolean
}

export function VerificationError({
  receiptNumber,
  isNotFound = true,
}: VerificationErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 sm:p-8">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            {isNotFound ? 'Receipt Not Found' : 'Verification Failed'}
          </h2>
          <p className="text-sm text-red-800 mb-6">
            {isNotFound
              ? 'We could not find a receipt matching your search. Please verify the receipt number and try again.'
              : 'We encountered an issue while verifying your receipt. Please try again later.'}
            {receiptNumber && (
              <span className="block mt-2 font-mono text-xs bg-red-100 px-2 py-1 rounded mt-2">
                Searched: {receiptNumber}
              </span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline">
              <Link href="/verify">Try Another Receipt</Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
