import { getVerificationData } from '@/lib/verify-mock'
import { VerificationResult } from '@/components/verify/verification-result'
import { VerificationError } from '@/components/verify/verification-error'
import { VerifyForm } from '@/components/verify/verify-form'
import { Metadata } from 'next'
import Link from 'next/link'

interface VerifyDetailPageProps {
  params: Promise<{
    receiptNumber: string
  }>
}

export async function generateMetadata({
  params,
}: VerifyDetailPageProps): Promise<Metadata> {
  const { receiptNumber } = await params

  return {
    title: `Verify Receipt ${receiptNumber} - Blockchain Verification`,
    description: 'View the verification details for your vote on Talent Voting.',
    robots: {
      index: false, // Don't index individual receipts
    },
  }
}

export default async function VerifyDetailPage({
  params,
}: VerifyDetailPageProps) {
  const { receiptNumber } = await params
  const decodedReceiptNumber = decodeURIComponent(receiptNumber)

  const result = await getVerificationData(decodedReceiptNumber)
  const isError = 'error' in result

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white bg-opacity-95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-lg font-bold text-slate-900">
              Talent Voting
            </Link>
            <nav
              className="text-sm text-slate-600"
              aria-label="Breadcrumb"
            >
              <ol className="flex items-center gap-2">
                <li>
                  <a href="/" className="hover:text-slate-900 transition-colors">
                    Home
                  </a>
                </li>
                <li>/</li>
                <li>
                  <a href="/verify" className="hover:text-slate-900 transition-colors">
                    Verify
                  </a>
                </li>
                <li>/</li>
                <li className="text-slate-900">Verification Details</li>
              </ol>
            </nav>
          </div>

          {/* Search Again */}
          <div className="max-w-lg">
            <VerifyForm initialValue={decodedReceiptNumber} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {isError ? (
          <VerificationError
            receiptNumber={decodedReceiptNumber}
            isNotFound={result.status === 404}
          />
        ) : (
          <VerificationResult data={result} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 text-center text-sm text-slate-600">
        <p className="mb-4">
          All verified votes are securely recorded and processed through our fraud
          detection and blockchain anchoring system.
        </p>
        <div className="flex justify-center gap-4 text-xs">
          <a href="#" className="hover:text-slate-900">
            Terms & Conditions
          </a>
          <span>•</span>
          <a href="#" className="hover:text-slate-900">
            Privacy Policy
          </a>
          <span>•</span>
          <span>© 2024 Talent Voting. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
