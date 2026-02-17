'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/voter-dashboard/dashboard-header';
import { VoterSummaryCard } from '@/components/voter-dashboard/voter-summary-card';
import { CategoryWalletCard } from '@/components/voter-dashboard/category-wallet-card';
import { RecentActivityTable } from '@/components/voter-dashboard/recent-activity-table';
import { SecurityPanel } from '@/components/voter-dashboard/security-panel';
import { VoterNavTabs } from '@/components/voter/voter-nav-tabs';
import { VerificationBanner } from '@/components/wallet/verification-banner';
import { WalletSummary } from '@/components/wallet/wallet-summary';
import { CategoryVoteCard } from '@/components/wallet/category-vote-card';
import { mockVoterDashboard } from '@/lib/voter-dashboard-mock';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoterDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const data = mockVoterDashboard;

  const handleLogout = () => {
    // In production, clear session and redirect to login
    router.push('/login');
  };

  const handleVoteClick = () => {
    // In production, navigate to vote selection page
    console.log('Vote clicked');
  };

  const handleBuyMoreVotes = () => {
    // In production, navigate to purchase page
    console.log('Buy more votes clicked');
  };

  const handleManageSessions = () => {
    // In production, open sessions modal
    console.log('Manage sessions clicked');
  };

  const handleReVerify = () => {
    // In production, open verification modal
    console.log('Re-verify clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader
        eventName={data.eventName}
        isVerified={data.isVerified}
        maskedPhone={data.maskedPhone}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs */}
      <VoterNavTabs />

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Verification Banner */}
        <div className="mb-6">
          <VerificationBanner isVerified={data.isVerified} />
        </div>

        {/* Wallet Summary - 3 Card Overview */}
        {data.walletData && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Wallet Overview</h2>
            <WalletSummary wallet={data.walletData} />
          </section>
        )}

        {/* Voting by Category with Direct Vote Buttons */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Voting by Category</h2>
            <Button variant="link" className="text-primary hover:text-primary/80">
              See all categories <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.walletData?.freeVotes.slice(0, 6).map((category) => (
              <CategoryVoteCard
                key={category.categoryId}
                category={category}
                paidVotesAvailable={data.walletData?.paidVotesRemaining || 0}
                isLoading={isLoading}
                onUseFreeVote={() => handleVoteClick()}
                onUsePaidVote={() => handleVoteClick()}
                onBuyVotes={handleBuyMoreVotes}
              />
            ))}
          </div>
        </section>

        {/* Activity & Security Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity - Takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <RecentActivityTable
              activities={data.recentActivities}
              isLoading={isLoading}
            />
          </div>

          {/* Security Panel - Takes 1 column on desktop */}
          <SecurityPanel
            device={data.device}
            lastLogin={data.lastLogin}
            location={data.location}
            riskStatus={data.riskStatus}
            onManageSessionsClick={handleManageSessions}
            onReVerifyClick={handleReVerify}
          />
        </div>

        {/* How the Hybrid Wallet Works */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-3">How the Hybrid Wallet Works</h3>
          <ul className="text-sm text-blue-800 space-y-1.5">
            <li>Free Votes: 1 per category (for verified Ethiopian users)</li>
            <li>Paid Votes: Global wallet - use across any category</li>
            <li>One payment = votes added to your global wallet</li>
            <li>All votes are blockchain-verified for security</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-muted-foreground sm:text-sm">
            <p>© 2026 Campus Star. All votes are secured and blockchain-anchored.</p>
            <p className="mt-2">
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              {' • '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>
              {' • '}
              <a href="#" className="text-primary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
