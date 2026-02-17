import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Session Expired | Voting Platform',
  description: 'Your session has expired. Please log in again.',
};

export default function SessionExpiredPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-8">
          <Clock className="h-24 w-24 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Session Expired</h1>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700 font-semibold mb-2">
            Your session has expired due to inactivity.
          </p>
          <p className="text-gray-600 text-sm">
            For your security, sessions expire after 30 minutes of inactivity. Please log in again to continue.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Log In Again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
              Go Home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Questions? Contact{' '}
          <a href="mailto:support@votingplatform.com" className="text-blue-600 hover:text-blue-700">
            support
          </a>
        </p>
      </div>
    </main>
  );
}
