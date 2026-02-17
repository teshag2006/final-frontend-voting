import { Metadata } from 'next';
import { CheckCircle2, Lock, Shield, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works | Voting Platform',
  description: 'Learn how our secure voting platform works.',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">How It Works</h1>

        <div className="space-y-16">
          {/* Getting Started */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Create Account',
                  description: 'Sign up with your email and verify with OTP',
                },
                {
                  step: '2',
                  title: 'Browse Events',
                  description: 'Explore live, upcoming, and past voting events',
                },
                {
                  step: '3',
                  title: 'Select Contestant',
                  description: 'Choose your favorite contestant in any category',
                },
                {
                  step: '4',
                  title: 'Cast Your Vote',
                  description: 'Vote for free or purchase additional votes',
                },
              ].map((item) => (
                <div key={item.step} className="bg-gray-50 p-6 rounded-lg">
                  <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Voting */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Voting Features</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Zap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Free Voting</h3>
                  <p className="text-gray-600">Get one free vote per category to start voting immediately without payment.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Secure Payment</h3>
                  <p className="text-gray-600">Purchase additional votes using multiple payment methods. All transactions are encrypted and secure.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Instant Confirmation</h3>
                  <p className="text-gray-600">Your votes are recorded immediately and counted in real-time leaderboards.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Fraud Protection</h3>
                  <p className="text-gray-600">Advanced security measures prevent vote manipulation and ensure fair results.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Results */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Results & Leaderboards</h2>
            <div className="bg-blue-50 p-8 rounded-lg">
              <p className="text-gray-700 mb-4">
                Our real-time leaderboard shows live voting data as votes are cast. You can:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  View contestant rankings by votes received
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Filter by category or time period
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  See final results when voting closes
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Access historical results from past events
                </li>
              </ul>
            </div>
          </section>

          {/* Blockchain */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Blockchain Verification</h2>
            <div className="bg-gray-50 p-8 rounded-lg space-y-4">
              <p className="text-gray-700">
                To ensure transparency and prevent tampering, all voting data is anchored to the Ethereum blockchain.
              </p>
              <p className="text-gray-700">
                This means every vote is mathematically verified and immutable. You can verify any vote at any time using the blockchain explorer.
              </p>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">What this means:</span> Even if our servers were compromised, the voting data is protected and verifiable on the blockchain.
                </p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Need Help?</h2>
            <div className="bg-blue-50 p-8 rounded-lg text-center">
              <p className="text-gray-700 mb-6">
                Our support team is here to help with any questions about voting, payments, or platform features.
              </p>
              <a
                href="mailto:support@votingplatform.com"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
              >
                Contact Support
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
