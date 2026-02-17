import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Voting Platform',
  description: 'Read our terms of service, voting rules, and policies.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-600">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Voting Rules</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Each user receives one free vote per category per event</li>
              <li>Additional votes can be purchased according to the event's voting rules</li>
              <li>Votes are non-transferable and cannot be shared with other users</li>
              <li>Manipulated or fraudulent voting is strictly prohibited</li>
              <li>All votes are final and cannot be reversed once cast</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Vote Limits</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free votes: 1 per category per event</li>
              <li>Paid votes: Maximum according to event specifications</li>
              <li>Daily vote limits may apply to prevent fraud</li>
              <li>Your voting activity will be monitored for suspicious patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All vote purchases are non-refundable</li>
              <li>Payment is processed securely through our payment providers</li>
              <li>You are responsible for all charges on your account</li>
              <li>Refunds for failed transactions will be processed within 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
            <p>Users agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use bots or automated tools to vote</li>
              <li>Create multiple accounts to circumvent voting limits</li>
              <li>Engage in vote manipulation or fraud</li>
              <li>Share account credentials with others</li>
              <li>Use payment methods that are not owned by you</li>
              <li>Attempt to bypass security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Fraud Consequences</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accounts detected with fraudulent activity will be suspended</li>
              <li>Suspicious votes may be invalidated without notice</li>
              <li>Repeated fraud attempts may result in permanent ban</li>
              <li>Legal action may be taken for serious violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Platform Changes</h2>
            <p>We reserve the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify voting rules at any time</li>
              <li>Suspend or close events</li>
              <li>Change vote pricing</li>
              <li>Update these terms with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Liability</h2>
            <p>
              The platform is provided "as is" without warranties. We are not liable for any direct, indirect, or consequential damages resulting from platform use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
            <p>For questions about these terms, please contact our support team at support@votingplatform.com</p>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t border-gray-200">
            Last updated: January 2026
          </p>
        </div>
      </div>
    </main>
  );
}
