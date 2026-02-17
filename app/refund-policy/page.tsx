import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | Voting Platform',
  description: 'Learn about our refund policy and payment terms.',
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Refund Policy</h1>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-600">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Refundable Votes</h2>
            <p>
              All vote purchases are non-refundable once cast. Once you vote, your payment cannot be reversed or refunded. This applies to all vote bundles regardless of the voting outcome.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed Transactions</h2>
            <p>
              If a payment fails during processing:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your account will not be charged</li>
              <li>No votes will be credited</li>
              <li>If charged in error, contact support immediately</li>
              <li>Refunds are processed within 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Duplicate Charges</h2>
            <p>
              If you notice you've been charged multiple times by mistake:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact support immediately with transaction IDs</li>
              <li>We will investigate and process refunds for legitimate cases</li>
              <li>Refunds are issued to the original payment method</li>
              <li>Processing time: 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Process</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact support with complete transaction details</li>
              <li>Provide proof of payment and transaction ID</li>
              <li>Our team investigates your claim within 48 hours</li>
              <li>We communicate resolution within 5 business days</li>
              <li>If approved, refund is processed to original payment method</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When Events Are Closed</h2>
            <p>
              If an event closes unexpectedly before voting ends:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Votes cast before closure are final and non-refundable</li>
              <li>Unpurchased vote bundles will be refunded automatically</li>
              <li>Refunds are processed within 24 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Suspension</h2>
            <p>
              If your account is suspended for fraud or abuse:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All votes cast are forfeited</li>
              <li>No refunds are issued for spent votes</li>
              <li>Unused vote bundles may be refunded at our discretion</li>
              <li>You have 30 days to appeal the suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Method Issues</h2>
            <p>
              If your payment method is declined or expired:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your vote will not be processed</li>
              <li>Update your payment method and try again</li>
              <li>No charges will appear on your account</li>
              <li>No refunds needed as transaction was not completed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Support</h2>
            <p>
              For refund inquiries, contact our support team at:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: support@votingplatform.com</li>
              <li>Include transaction ID and details of your issue</li>
              <li>Response time: 24-48 hours</li>
            </ul>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t border-gray-200">
            Last updated: January 2026
          </p>
        </div>
      </div>
    </main>
  );
}
