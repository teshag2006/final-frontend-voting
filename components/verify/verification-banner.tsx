'use client'

import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { PaymentStatus } from '@/types/verification'

interface VerificationBannerProps {
  status: PaymentStatus
  receiptNumber: string
}

export function VerificationBanner({
  status,
  receiptNumber,
}: VerificationBannerProps) {
  const bannerConfig = {
    completed: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      title: 'VERIFIED',
      description: `The vote associated with Transaction ID ${receiptNumber} has been successfully verified on the blockchain.`,
    },
    pending: {
      icon: Clock,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-700',
      title: 'VERIFICATION IN PROGRESS',
      description: 'Your payment is being confirmed. This typically takes 5-10 minutes.',
    },
    failed: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      badgeColor: 'bg-red-100 text-red-700',
      title: 'PAYMENT FAILED',
      description:
        'The payment for this vote could not be processed. Please try again or contact support.',
    },
  }

  const config = bannerConfig[status]
  const Icon = config.icon

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4 sm:p-6 flex gap-4`}
      role="status"
      aria-live="polite"
      aria-label={`Verification status: ${config.title}`}
    >
      <div className="flex-shrink-0">
        <Icon className={`h-6 w-6 ${config.textColor}`} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <h2
          className={`text-lg font-bold ${config.textColor} mb-1`}
        >
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.badgeColor} mr-2`}>
            {config.title}
          </span>
        </h2>
        <p className={`text-sm ${config.textColor}`}>{config.description}</p>
      </div>
    </div>
  )
}
