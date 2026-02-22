'use client'

import { ReceiptData } from '@/types/receipt'

interface ReceiptSummaryProps {
  receipt: ReceiptData
}

export function ReceiptSummary({ receipt }: ReceiptSummaryProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(date)
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      stripe: 'Credit / Debit Card',
      paypal: 'PayPal',
      wallet: 'Digital Wallet',
      chapa: 'Chapa',
      mobile_money: 'Mobile Money',
    }
    return labels[method] || method
  }

  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-lg">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
        Receipt Summary
      </h2>

      <div className="space-y-4">
        {/* Receipt Number */}
        <div className="border-b border-gray-200 pb-4">
          <p className="text-sm text-gray-600 mb-1">Receipt Number</p>
          <p className="text-lg md:text-xl font-mono font-semibold text-gray-900">
            {receipt.receiptNumber}
          </p>
        </div>

        {/* Vote Quantity & Amount */}
        <div className="border-b border-gray-200 pb-4">
          <p className="text-sm text-gray-600 mb-1">Votes Purchased</p>
          <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
            {receipt.voteQuantity} Votes
          </p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {formatCurrency(receipt.amount, receipt.currency)}
          </p>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Payment Method</p>
            <p className="text-base font-medium text-gray-900">
              {getPaymentMethodLabel(receipt.paymentMethod)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Date & Time</p>
            <p className="text-base font-medium text-gray-900">
              {formatDate(receipt.votingTimestamp)}
            </p>
          </div>
        </div>

        {/* Transaction Reference */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Transaction Reference</p>
          <p className="text-base font-mono font-medium text-gray-900 break-all">
            {receipt.transactionReference}
          </p>
        </div>
      </div>
    </div>
  )
}
