'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-8">
          <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Something Went Wrong</h1>
        </div>

        <p className="text-gray-600 mb-4">
          We encountered an error while processing your request. Please try again.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-8 text-left">
            <p className="text-sm font-mono text-red-700">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
          <a href="/" className="block">
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
              Go Home
            </Button>
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          If the problem persists, please{' '}
          <a href="mailto:support@votingplatform.com" className="text-blue-600 hover:text-blue-700">
            contact support
          </a>
        </p>
      </div>
    </main>
  );
}
