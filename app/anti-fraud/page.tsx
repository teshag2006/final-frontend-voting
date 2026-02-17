import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anti-Fraud Policy | Voting Platform',
  description: 'Learn about our fraud prevention measures and policies.',
};

export default function AntiFraudPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Anti-Fraud Policy</h1>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-600">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
            <p>
              We are committed to maintaining the integrity of our voting platform. We employ advanced fraud detection systems and maintain strict policies to protect against vote manipulation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Voting Limits</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>One free vote per category per user per event</li>
              <li>Paid votes subject to daily and transaction limits</li>
              <li>Limits are designed to prevent abuse while enabling legitimate participation</li>
              <li>Exceeding limits may trigger account review</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
            <p>The following activities are strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Using automated tools, bots, or scripts to vote</li>
              <li>Creating multiple accounts to circumvent voting limits</li>
              <li>Vote farming or selling</li>
              <li>Using stolen payment methods</li>
              <li>Vote manipulation through collusion</li>
              <li>Distributed voting from the same location or network</li>
              <li>Rapid sequential voting indicating automation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detection Methods</h2>
            <p>We monitor for suspicious activity using:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device fingerprinting to identify same-device voting patterns</li>
              <li>IP address analysis for location-based anomalies</li>
              <li>Payment pattern analysis for fraudulent transactions</li>
              <li>Vote velocity detection for unusual submission rates</li>
              <li>Behavioral analysis for bot-like patterns</li>
              <li>Network analysis for coordinated fraud attempts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Don't Share</h2>
            <p>To maintain trust, we never expose:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your fraud score or risk assessment</li>
              <li>Our fraud detection logic or algorithms</li>
              <li>Device identifiers or fingerprints</li>
              <li>Details about security measures</li>
              <li>Specific reasons for account restrictions (generic message only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Suspension</h2>
            <p>Accounts detected with fraudulent activity will be suspended immediately. Violations include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>First offense: Warning and temporary restriction</li>
              <li>Confirmed fraud: 30-day suspension</li>
              <li>Repeated attempts: Permanent ban</li>
              <li>Severe violations: Immediate permanent suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vote Invalidation</h2>
            <p>
              Votes identified as fraudulent may be invalidated without prior notice. This is done to maintain result integrity. Invalidated votes will not result in refunds as the votes were cast against policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Consequences</h2>
            <p>
              Serious fraud attempts, including those involving payment fraud or hacking, may result in legal action. We cooperate with law enforcement authorities to investigate and prosecute fraud.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Appeal Process</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>If your account is suspended, you'll receive notification</li>
              <li>You have 30 days to appeal the decision</li>
              <li>Submit evidence of legitimate account activity</li>
              <li>Our compliance team reviews your appeal within 5 business days</li>
              <li>Decision is final and communicated in writing</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Safe Voting Tips</h2>
            <p>Follow these guidelines to stay compliant:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use only one account per person</li>
              <li>Vote naturally and at your own pace</li>
              <li>Use your own payment methods only</li>
              <li>Don't share account credentials</li>
              <li>Enable two-factor authentication</li>
              <li>Report suspicious activity immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Fraud</h2>
            <p>
              If you suspect fraudulent activity, please report it immediately to fraud@votingplatform.com. Include any relevant details and we will investigate promptly.
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t border-gray-200">
            Last updated: January 2026
          </p>
        </div>
      </div>
    </main>
  );
}
