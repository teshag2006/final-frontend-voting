'use client'

import { useState } from 'react'
import { Download, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DownloadReceiptButtonProps {
  receiptNumber: string
}

export function DownloadReceiptButton({ receiptNumber }: DownloadReceiptButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/public/receipt/${receiptNumber}/pdf`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to download receipt')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${receiptNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
          'bg-blue-600 text-white font-semibold text-base',
          'hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'active:scale-95'
        )}
        aria-busy={isLoading}
        aria-label="Download PDF receipt"
      >
        <Download className="h-5 w-5" />
        {isLoading ? 'Downloading...' : 'Download PDF Receipt'}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
