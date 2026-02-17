import { VerifyForm } from '@/components/verify/verify-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Vote - Blockchain Verification',
  description:
    'Verify any vote recorded on Talent Voting through blockchain. Enter a transaction ID, receipt number, or blockchain hash to confirm vote authenticity.',
  openGraph: {
    title: 'Verify Vote - Blockchain Verification',
    description:
      'Verify any vote recorded on Talent Voting through blockchain. Enter a transaction ID, receipt number, or blockchain hash to confirm vote authenticity.',
  },
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-3xl w-full">
          {/* Breadcrumb */}
          <nav
            className="mb-8 text-sm text-slate-300"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center gap-2">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>/</li>
              <li className="text-white">Verify Vote</li>
            </ol>
          </nav>

          {/* Title & Description */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Verify Vote via Blockchain
            </h1>
            <p className="text-lg sm:text-xl text-slate-200 mb-8">
              Enter a Transaction ID, Receipt Number, or Blockchain Hash to verify any
              vote recorded on Talent Voting through the blockchain.
            </p>
          </div>

          {/* Search Form */}
          <div className="flex justify-center">
            <VerifyForm />
          </div>

          {/* Info Message */}
          <div className="mt-8 bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg p-4 text-center text-sm text-slate-300">
            <p>
              💡 <span className="font-medium">Tip:</span> You can find your Receipt
              Number in your confirmation email or purchase receipt. It typically starts
              with "VOTE-" or "REC-".
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 bg-opacity-50 px-4 py-6 text-center text-xs text-slate-400">
        <p>
          All verified votes are securely recorded and processed through our fraud
          detection and blockchain anchoring system.
        </p>
      </footer>
    </div>
  )
}
