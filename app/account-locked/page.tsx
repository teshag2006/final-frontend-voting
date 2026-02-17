import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Account Locked | Voting Platform',
  description: 'Your account has been locked. Please contact support for assistance.',
};

export default function AccountLockedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-8">
          <ShieldAlert className="h-24 w-24 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Account Locked</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700 font-semibold mb-4">
            Your account has been temporarily locked.
          </p>
          <p className="text-gray-600 text-sm mb-4">
            This may have happened due to:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              Suspicious voting activity
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              Multiple failed login attempts
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              Fraud detection alert
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              Policy violation
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-gray-700 font-semibold mb-2">What happens next?</p>
          <p className="text-sm text-gray-600">
            Our team will review your account. You'll receive an email with details and next steps within 24 hours.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="mailto:support@votingplatform.com">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Contact Support
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-600 space-y-2">
          <p>
            Have questions about your account suspension?
          </p>
          <p>
            Email us at{' '}
            <a href="mailto:support@votingplatform.com" className="text-blue-600 hover:text-blue-700 font-semibold">
              support@votingplatform.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
