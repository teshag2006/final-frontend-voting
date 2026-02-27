'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/voter-dashboard/dashboard-header';
import { RecentActivityTable } from '@/components/voter-dashboard/recent-activity-table';
import { SecurityPanel } from '@/components/voter-dashboard/security-panel';
import { VoterSidebarNav } from '@/components/voter/voter-sidebar-nav';
import { VerificationBanner } from '@/components/wallet/verification-banner';
import { WalletSummary } from '@/components/wallet/wallet-summary';
import { CategoryVoteCard } from '@/components/wallet/category-vote-card';
import { mockVoterDashboard } from '@/lib/voter-dashboard-mock';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUICK_PACKAGE_OPTIONS = [10, 25, 50, 100] as const;

export default function VoterDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [runtimeState, setRuntimeState] = useState(() => ({
    isVerified: false,
    maskedPhone: 'Not verified',
    walletData: mockVoterDashboard.walletData,
  }));

  const loadWallet = async () => {
    try {
      const response = await fetch('/api/voter/wallet', { cache: 'no-store' });
      if (!response.ok) return;
      const wallet = await response.json();
      const phone = String(wallet?.phoneNumber || '');
      const digits = phone.replace(/\D/g, '');
      const maskedPhone =
        digits.length >= 7
          ? `+${digits.slice(0, 3)} ${digits.slice(3, 4)}XX XXX ${digits.slice(-3)}`
          : 'Not verified';
      setRuntimeState({
        isVerified: Boolean(wallet?.isPhoneVerified),
        maskedPhone,
        walletData: wallet,
      });
    } catch {
      // Keep fallback mock data in dev mode.
    }
  };

  useEffect(() => {
    void loadWallet();
  }, []);

  const data = useMemo(
    () => ({
      ...mockVoterDashboard,
      isVerified: runtimeState.isVerified,
      maskedPhone: runtimeState.maskedPhone,
      walletData: runtimeState.walletData,
    }),
    [runtimeState]
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleBuyMoreVotes = () => {
    router.push('/vote/checkout?quantity=10');
  };

  const handleBuyPackage = (quantity: number) => {
    router.push(`/vote/checkout?quantity=${encodeURIComponent(String(quantity))}`);
  };

  const handleManageSessions = () => {
    router.push('/voter/settings');
  };

  const handleReVerify = () => {
    router.push('/verify-phone');
  };

  const handleUseVote = async (categoryId: string, categoryName: string, isPaid: boolean) => {
    if (!isPaid && !data.isVerified) {
      router.push('/verify-phone');
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/voter/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          categoryName,
          contestantName: 'Dashboard Vote',
          isPaid,
          quantity: 1,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setFeedback(payload?.message || 'Vote failed');
        return;
      }

      setFeedback(isPaid ? 'Paid vote submitted.' : 'Free vote submitted.');
      await loadWallet();
    } catch {
      setFeedback('Vote failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200">
      {/* Header */}
      <DashboardHeader
        eventName={data.eventName}
        isVerified={data.isVerified}
        maskedPhone={data.maskedPhone}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[256px_minmax(0,1fr)]">
          <VoterSidebarNav />

          <div className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
            {feedback && (
              <div className="mb-4 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                {feedback}
              </div>
            )}
            {/* Verification Banner */}
            <div className="mb-6">
              <VerificationBanner isVerified={data.isVerified} />
            </div>

            {/* Wallet Summary - 3 Card Overview */}
            {data.walletData && (
              <section className="mb-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">Wallet Overview</h2>
                  <Button onClick={() => handleBuyPackage(10)} className="bg-accent text-white hover:bg-accent/90">
                    Buy Vote Package
                  </Button>
                </div>
                <WalletSummary wallet={data.walletData} />
              </section>
            )}

            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Buy Vote Package</h3>
                <p className="text-xs text-slate-500">Select a bundle and continue to payment</p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {QUICK_PACKAGE_OPTIONS.map((quantity) => (
                  <Button
                    key={quantity}
                    variant="outline"
                    className="h-12 border-slate-300 font-semibold text-slate-800 hover:border-accent hover:bg-accent hover:text-white"
                    onClick={() => handleBuyPackage(quantity)}
                  >
                    {quantity} Votes
                  </Button>
                ))}
              </div>
            </section>

            {/* Voting by Category with Direct Vote Buttons */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Voting by Category</h2>
                <Button
                  variant="link"
                  className="text-primary hover:text-primary/80"
                  onClick={() => router.push('/vote')}
                >
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
                    onUseFreeVote={() => handleUseVote(String(category.categoryId), String(category.categoryName || ''), false)}
                    onUsePaidVote={() => handleUseVote(String(category.categoryId), String(category.categoryName || ''), true)}
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
      <footer className="border-t border-slate-300 bg-slate-100 py-6 sm:py-8">
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


