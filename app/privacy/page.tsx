import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Voting Platform',
  description: 'Learn how we handle your personal data and privacy.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-600">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Data We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Phone number for account verification and two-factor authentication</li>
              <li>Email address for account communications</li>
              <li>Payment information for vote purchases</li>
              <li>Voting history and patterns</li>
              <li>Device information for fraud detection</li>
              <li>IP address for security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To verify your identity and prevent fraud</li>
              <li>To process payments securely</li>
              <li>To send important account notifications</li>
              <li>To improve our platform and services</li>
              <li>To detect and prevent abusive behavior</li>
              <li>To comply with legal requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Phone Number Usage</h2>
            <p>Your phone number is used exclusively for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>One-time password (OTP) verification</li>
              <li>Two-factor authentication</li>
              <li>Account recovery</li>
              <li>Important security alerts</li>
            </ul>
            <p className="mt-4">We will never sell or share your phone number with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. OAuth & Third-Party Authentication</h2>
            <p>
              When you sign up using Google or other OAuth providers, we only collect the information necessary for account creation (email and profile name).
            </p>
            <p className="mt-4">
              We do not store or access your passwords from these services. You control what information is shared.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Data</h2>
            <p>
              Payment information is processed securely through PCI-compliant payment providers. We do not store full credit card details on our servers.
            </p>
            <p className="mt-4">
              Your payment data is encrypted and protected according to industry standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies & Tracking</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We use cookies for session management and authentication</li>
              <li>Analytics cookies help us understand user behavior</li>
              <li>You can control cookie preferences in your browser settings</li>
              <li>Essential cookies cannot be disabled as they are required for functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Active account data is retained while your account is active</li>
              <li>Voting history is retained for 7 years for audit purposes</li>
              <li>Payment records are retained for 7 years for tax compliance</li>
              <li>Upon account deletion, personal data is purged within 30 days</li>
              <li>Aggregated, anonymized data may be retained indefinitely</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request data deletion</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Security</h2>
            <p>
              We implement industry-standard security measures including encryption, secure authentication, and regular security audits. However, no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <p>
              For privacy concerns or data requests, contact our privacy team at privacy@votingplatform.com
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
