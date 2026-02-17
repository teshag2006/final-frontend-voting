import { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Maintenance | Voting Platform',
  description: 'Platform is under maintenance. Voting is temporarily disabled.',
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-yellow-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Maintenance Mode</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700 font-semibold mb-4">
            Our platform is temporarily under maintenance.
          </p>
          <p className="text-gray-600 mb-4">
            We're making improvements to ensure the best voting experience. All voting features are temporarily disabled.
          </p>
          <p className="text-sm text-gray-600">
            Expected time: 2-4 hours
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-gray-600">
            We'll be back online soon. Thank you for your patience!
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          For updates, follow us on social media or{' '}
          <a href="mailto:support@votingplatform.com" className="text-blue-600 hover:text-blue-700">
            contact support
          </a>
        </p>
      </div>
    </main>
  );
}
