import { Metadata } from 'next'
import Link from 'next/link'
import { getMockReceipt } from '@/lib/receipt-mock'
import { ReceiptStatus } from '@/components/receipt/receipt-status'
import { ReceiptSummary } from '@/components/receipt/receipt-summary'
import { ContestantDetails } from '@/components/receipt/contestant-details'
import { BlockchainStatus } from '@/components/receipt/blockchain-status'
import { TransparencyMessage } from '@/components/receipt/transparency-message'
import { DownloadReceiptButton } from '@/components/receipt/download-receipt-button'
import { SupportSection } from '@/components/receipt/support-section'
import { ReceiptError } from '@/components/receipt/receipt-error'

interface PageProps {
  params: Promise<{
    receiptNumber: string
  }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { receiptNumber } = await params
  return {
    title: `Receipt ${receiptNumber} - Vote Confirmation`,
    description: 'Your secure vote confirmation receipt',
  }
}

export default async function ReceiptPage({ params }: PageProps) {
  const { receiptNumber } = await params

  // Validate receipt number format (basic validation)
  if (!receiptNumber || typeof receiptNumber !== 'string') {
    return <ReceiptError statusCode={400} />
  }

  // Server-side fetch of receipt data
  // In production, this would call: GET /api/public/receipt/:receiptNumber
  const receipt = await getMockReceipt(receiptNumber)

  if (!receipt) {
    return <ReceiptError statusCode={404} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
            <p className="text-sm text-gray-500">Receipt: {receipt.receiptNumber}</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-8">
          {/* Status Banner */}
          <ReceiptStatus status={receipt.paymentStatus} />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Receipt Summary */}
              <ReceiptSummary receipt={receipt} />

              {/* Contestant Details */}
              <ContestantDetails receipt={receipt} />

              {/* Blockchain Status */}
              <BlockchainStatus blockchain={receipt.blockchain} />

              {/* Transparency Message */}
              <TransparencyMessage />

              {/* Download Receipt */}
              <DownloadReceiptButton receiptNumber={receipt.receiptNumber} />
            </div>

            {/* Right Column - Support */}
            <div className="lg:col-span-1">
              <SupportSection />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm text-gray-600">
            <div className="space-x-4">
              <Link
                href="/terms"
                className="hover:text-gray-900 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="hover:text-gray-900 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/fraud-policy"
                className="hover:text-gray-900 transition-colors"
              >
                Fraud Policy
              </Link>
            </div>
            <p>© 2024 Secure Vote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
