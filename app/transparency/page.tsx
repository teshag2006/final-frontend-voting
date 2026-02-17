import { Metadata } from 'next';
import { ExternalLink, Shield, Eye, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Transparency | Voting Platform',
  description: 'Learn how our voting platform ensures transparency and prevents fraud.',
};

export default function TransparencyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Transparency Report</h1>

        <div className="space-y-12">
          {/* Blockchain Anchoring */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="h-8 w-8 text-blue-600" />
              Blockchain Anchoring System
            </h2>
            <div className="bg-blue-50 p-8 rounded-lg space-y-4">
              <p className="text-gray-700">
                Every vote and voting batch is cryptographically hashed and stored on the Ethereum blockchain. This creates an immutable record that cannot be altered retroactively.
              </p>
              <p className="text-gray-700">
                <span className="font-bold">How it works:</span>
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Votes are collected into batches every 5 minutes</li>
                <li>Each batch is hashed using SHA-256</li>
                <li>The hash is recorded on the Ethereum blockchain</li>
                <li>A transaction receipt is generated as proof</li>
                <li>Anyone can verify the data using the blockchain explorer</li>
              </ol>
              <div className="bg-white p-4 rounded border border-blue-200 mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Latest Anchor Hash:</span> 0xabc123...def789
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Block Number:</span> 19,450,234
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mt-2">
                  View on Blockchain Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </section>

          {/* Vote Verification */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Eye className="h-8 w-8 text-blue-600" />
              Vote Verification System
            </h2>
            <div className="bg-green-50 p-8 rounded-lg space-y-4">
              <p className="text-gray-700">
                After voting, you receive a unique Receipt ID that allows you to verify your vote was counted correctly.
              </p>
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="text-sm text-gray-600 font-mono">Receipt: RCP-2026-04-001234</p>
              </div>
              <p className="text-gray-700">
                You can verify your vote at any time:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Go to the vote verification page</li>
                <li>Enter your Receipt ID</li>
                <li>Confirm your vote is recorded correctly</li>
                <li>View the blockchain proof</li>
              </ol>
            </div>
          </section>

          {/* Fraud Detection */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Fraud Detection Overview
            </h2>
            <div className="bg-purple-50 p-8 rounded-lg space-y-4">
              <p className="text-gray-700">
                Our multi-layered fraud detection system works silently to protect result integrity:
              </p>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border border-purple-200">
                  <p className="font-bold text-gray-900">Device Analysis</p>
                  <p className="text-sm text-gray-600">Detects voting from same device to prevent spam</p>
                </div>
                <div className="bg-white p-4 rounded border border-purple-200">
                  <p className="font-bold text-gray-900">IP Address Monitoring</p>
                  <p className="text-sm text-gray-600">Identifies unusual geographic voting patterns</p>
                </div>
                <div className="bg-white p-4 rounded border border-purple-200">
                  <p className="font-bold text-gray-900">Payment Analysis</p>
                  <p className="text-sm text-gray-600">Flags stolen or fraudulent payment methods</p>
                </div>
                <div className="bg-white p-4 rounded border border-purple-200">
                  <p className="font-bold text-gray-900">Vote Velocity Detection</p>
                  <p className="text-sm text-gray-600">Identifies bot-like rapid voting patterns</p>
                </div>
                <div className="bg-white p-4 rounded border border-purple-200">
                  <p className="font-bold text-gray-900">Behavioral Analysis</p>
                  <p className="text-sm text-gray-600">Detects coordinated fraud attempts</p>
                </div>
              </div>
            </div>
          </section>

          {/* Snapshot Mechanism */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Daily Snapshots</h2>
            <div className="bg-gray-50 p-8 rounded-lg space-y-4">
              <p className="text-gray-700">
                At the end of each day, we create a snapshot of all voting data:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Total votes cast that day
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Votes by category
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Top 10 contestants by votes
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Fraud flags raised and resolved
                </li>
              </ul>
              <p className="text-gray-700 pt-4">
                These snapshots are available in our public archive and can be used for audits or analysis.
              </p>
            </div>
          </section>

          {/* Audit Trail */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Audit Trail</h2>
            <div className="bg-indigo-50 p-8 rounded-lg space-y-4">
              <p className="text-gray-700">
                Every action is logged for transparency:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Vote cast (time, contestant, category)
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Payment processed (amount, method)
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Fraud checks performed (results)
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Account actions (login, password change)
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Support interactions
                </li>
              </ul>
              <p className="text-gray-700 pt-4">
                Users can request their full audit trail at any time through their account settings.
              </p>
            </div>
          </section>

          {/* Compliance */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Compliance & Certifications</h2>
            <div className="space-y-4">
              <div className="bg-white p-4 border border-gray-200 rounded">
                <p className="font-bold text-gray-900">PCI DSS Compliant</p>
                <p className="text-sm text-gray-600">All payment processing meets Payment Card Industry standards</p>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded">
                <p className="font-bold text-gray-900">GDPR Compliant</p>
                <p className="text-sm text-gray-600">We handle personal data according to EU regulations</p>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded">
                <p className="font-bold text-gray-900">Regular Security Audits</p>
                <p className="text-sm text-gray-600">Third-party security firms conduct quarterly penetration tests</p>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded">
                <p className="font-bold text-gray-900">Open Source Libraries</p>
                <p className="text-sm text-gray-600">We use audited, industry-standard cryptography libraries</p>
              </div>
            </div>
          </section>

          {/* Report Issues */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Report an Issue</h2>
            <div className="bg-orange-50 p-8 rounded-lg text-center">
              <p className="text-gray-700 mb-6">
                Found a security issue or have concerns about transparency? Report it immediately.
              </p>
              <a
                href="mailto:security@votingplatform.com"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded"
              >
                Report Security Issue
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
