import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { PaymentStatus } from '@/types/receipt'

interface ReceiptStatusProps {
  status: PaymentStatus
}

export function ReceiptStatus({ status }: ReceiptStatusProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      title: 'Payment Successful',
      description: 'Your vote has been recorded and confirmed.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      accentColor: 'text-green-600',
    },
    pending: {
      icon: AlertCircle,
      title: 'Payment Pending',
      description: 'Your payment is being processed. This may take a few moments.',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      accentColor: 'text-yellow-600',
    },
    failed: {
      icon: XCircle,
      title: 'Payment Failed',
      description: 'Your payment could not be processed. Please try again.',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      accentColor: 'text-red-600',
    },
  }

  const config = statusConfig[status]
  const IconComponent = config.icon

  return (
    <div
      className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-6 md:p-8`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <IconComponent className={`h-16 w-16 ${config.accentColor} mb-4`} />
        <h2 className={`text-2xl md:text-3xl font-bold ${config.textColor} mb-2`}>
          {config.title}
        </h2>
        <p className={`text-base md:text-lg ${config.textColor} opacity-75`}>
          {config.description}
        </p>
      </div>
    </div>
  )
}
