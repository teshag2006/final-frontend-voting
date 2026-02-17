import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-8">
          <Search className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>

        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Go Home
            </Button>
          </Link>
          <Link href="/events" className="block">
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
              Browse Events
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          If you believe this is an error, please{' '}
          <a href="mailto:support@votingplatform.com" className="text-blue-600 hover:text-blue-700">
            contact support
          </a>
        </p>
      </div>
    </main>
  );
}
