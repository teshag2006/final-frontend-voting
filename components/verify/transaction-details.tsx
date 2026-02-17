'use client'

import { VerificationResponse } from '@/types/verification'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface TransactionDetailsProps {
  data: VerificationResponse
}

export function TransactionDetails({ data }: TransactionDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Transaction Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Transaction Summary
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Receipt Number</label>
            <div className="flex items-center justify-between gap-2 mt-1">
              <code className="text-sm font-mono font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg flex-1 break-all">
                {data.receiptNumber}
              </code>
              <button
                onClick={() => handleCopy(data.receiptNumber, 'receipt')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Copy receipt number"
                title="Copy receipt number"
              >
                {copiedField === 'receipt' ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Vote Quantity</label>
            <p className="text-base font-semibold text-slate-900 mt-1">
              {data.voteQuantity.toLocaleString()} Votes
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Date & Time</label>
            <p className="text-sm text-slate-900 mt-1 font-medium">
              {formatDate(data.votingTimestamp)}
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Event</label>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {data.event.name}
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Category</label>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {data.category.name}
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Contestant</label>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {data.contestant.firstName} {data.contestant.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Verification Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Status</label>
            <div className="mt-1 inline-block">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  data.paymentStatus === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : data.paymentStatus === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {data.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Verification Type</label>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              Blockchain-Anchored
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Blockchain Status</label>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {data.blockchain.isAnchored
                ? `Anchored on ${data.blockchain.network || 'Blockchain'}`
                : 'Awaiting Anchor'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              All verified votes are securely recorded and processed through our fraud
              detection and blockchain anchoring system.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
