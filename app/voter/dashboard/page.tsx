'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/voter-dashboard/dashboard-header';
import { VoterSummaryCard } from '@/components/voter-dashboard/voter-summary-card';
import { CategoryWalletCard } from '@/components/voter-dashboard/category-wallet-card';
import { RecentActivityTable } from '@/components/voter-dashboard/recent-activity-table';
import { SecurityPanel } from '@/components/voter-dashboard/security-panel';
import { VoterSidebarNav } from '@/components/voter/voter-sidebar-nav';
import { VerificationBanner } from '@/components/wallet/verification-banner';
import { WalletSummary } from '@/components/wallet/wallet-summary';
import { CategoryVoteCard } from '@/components/wallet/category-vote-card';
import { mockVoterDashboard } from '@/lib/voter-dashboard-mock';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoterDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const data = mockVoterDashboard;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleVoteClick = () => {
    router.push('/events');
  };

  const handleBuyMoreVotes = () => {
    router.push('/vote/checkout');
  };

  const handleManageSessions = () => {
    router.push('/voter/settings');
  };

  const handleReVerify = () => {
    router.push('/verify-phone');
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

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <VoterSidebarNav />

          <div className="min-w-0">
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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Voting by Category</h2>
                <Button variant="link" className="text-primary hover:text-primary/80">
                  See all categories <ArrowRight className="ml-2 h-4 w-4" />
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
            <div className="mt-12 rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-3 font-semibold text-blue-900">How the Hybrid Wallet Works</h3>
              <ul className="space-y-1.5 text-sm text-blue-800">
                <li>Free Votes: 1 per category (for verified Ethiopian users)</li>
                <li>Paid Votes: Global wallet - use across any category</li>
                <li>One payment = votes added to your global wallet</li>
                <li>All votes are blockchain-verified for security</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-muted-foreground sm:text-sm">
            <p>© 2026 Campus Star. All votes are secured and blockchain-anchored.</p>
            <p className="mt-2">
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              {' • '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>
              {' • '}
              <a href="/notifications" className="text-primary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
