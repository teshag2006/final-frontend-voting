import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface ReceiptErrorProps {
  statusCode: number
  message?: string
}

export function ReceiptError({ statusCode, message }: ReceiptErrorProps) {
  const errorMessages: Record<number, { title: string; description: string }> = {
    404: {
      title: 'Receipt Not Found',
      description:
        'We could not find the receipt you are looking for. Please check the receipt number and try again.',
    },
    400: {
      title: 'Invalid Request',
      description:
        'The receipt information you provided is not valid. Please check and try again.',
    },
    500: {
      title: 'Server Error',
      description:
        'An unexpected error occurred while retrieving your receipt. Please try again later.',
    },
  }

  const error = errorMessages[statusCode] || {
    title: 'Error',
    description: message || 'An error occurred while processing your request.',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {error.title}
            </h1>
            <p className="text-base text-gray-600">{error.description}</p>
          </div>

          <div className="space-y-3 pt-4">
            <Link
              href="/"
              className="block w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Home
            </Link>
            <Link
              href="/support"
              className="block w-full px-6 py-3 rounded-lg bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
