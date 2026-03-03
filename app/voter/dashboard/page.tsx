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
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getVoterDashboard, getVoterWallet, submitVoterVote } from '@/lib/api';
import { authService } from '@/lib/services/authService';

const QUICK_PACKAGE_OPTIONS = [10, 25, 50, 100] as const;

function normalizeWallet(raw: any) {
  const freeVotes = Array.isArray(raw?.freeVotes)
    ? raw.freeVotes.map((item: any) => ({
        categoryId: String(item.categoryId || item.category_id || ''),
        categoryName: String(item.categoryName || item.category_name || 'Category'),
        isEligible: Boolean(item.isEligible ?? item.is_eligible ?? true),
        isAvailable: Number(item.remaining ?? item.remaining_votes ?? 0) > 0,
        isUsed: Number(item.remaining ?? item.remaining_votes ?? 0) <= 0,
      }))
    : [];

  return {
    paidVotesRemaining: Number(raw?.paidVotesRemaining || raw?.paid_votes_remaining || 0),
    totalPaidVotesPurchased: Number(raw?.totalPaidVotesPurchased || raw?.total_paid_votes_purchased || 0),
    totalVotesUsed: Number(raw?.totalVotesUsed || raw?.total_votes_used || 0),
    freeVotes,
  };
}

function normalizeDashboard(raw: any) {
  return {
    eventName: String(raw?.eventName || raw?.event_name || 'Voter Workspace'),
    recentActivities: Array.isArray(raw?.recentActivities)
      ? raw.recentActivities
      : Array.isArray(raw?.recent_activities)
        ? raw.recent_activities
        : [],
    device: String(raw?.device || raw?.security?.device || 'Unknown'),
    lastLogin: String(raw?.lastLogin || raw?.security?.last_login || '-'),
    location: String(raw?.location || raw?.security?.location || '-'),
    riskStatus: (raw?.riskStatus || raw?.security?.risk_status || 'low') as 'low' | 'review' | 'blocked',
  };
}

export default function VoterDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState(() =>
    normalizeDashboard({
      event_name: 'Voter Workspace',
      recent_activities: [],
      security: {},
    })
  );
  const [wallet, setWallet] = useState(() =>
    normalizeWallet({ paid_votes_remaining: 0, freeVotes: [] })
  );
  const [isVerified, setIsVerified] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('Not verified');

  const getAccessToken = () => authService.getToken() || undefined;

  const loadData = async () => {
    const token = getAccessToken();
    const [dashboardRes, walletRes] = await Promise.all([
      getVoterDashboard(token),
      getVoterWallet(token),
    ]);

    if (dashboardRes) {
      setDashboard(normalizeDashboard(dashboardRes));
    }

    if (walletRes) {
      const phone = String(walletRes?.phoneNumber || '');
      const digits = phone.replace(/\D/g, '');
      setMaskedPhone(
        digits.length >= 7
          ? `+${digits.slice(0, 3)} ${digits.slice(3, 4)}XX XXX ${digits.slice(-3)}`
          : 'Not verified'
      );
      setIsVerified(Boolean(walletRes?.isPhoneVerified));
      setWallet(normalizeWallet(walletRes));
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const data = useMemo(
    () => ({
      ...dashboard,
      walletData: wallet,
      isVerified,
      maskedPhone,
    }),
    [dashboard, wallet, isVerified, maskedPhone]
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

  const handleUseVote = async (categoryId: string, isPaid: boolean) => {
    if (!isPaid && !data.isVerified) {
      router.push('/verify-phone');
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const token = getAccessToken();
      const walletSnapshot = await getVoterWallet(token);
      if (!walletSnapshot) {
        setFeedback('Unable to verify wallet balance.');
        return;
      }
      const paidVotesRemaining = Number(
        walletSnapshot.paidVotesRemaining || walletSnapshot.paid_votes_remaining || 0
      );
      if (isPaid && paidVotesRemaining <= 0) {
        setFeedback('Insufficient paid votes. Please buy a package.');
        router.push('/vote/checkout?quantity=10');
        return;
      }

      if (!isPaid) {
        const freeVoteRow = Array.isArray(walletSnapshot.freeVotes)
          ? walletSnapshot.freeVotes.find(
              (row: any) =>
                String(row.categoryId || row.category_id || '') === String(categoryId)
            )
          : null;
        const remaining = Number(freeVoteRow?.remaining || freeVoteRow?.remaining_votes || 0);
        if (freeVoteRow && remaining <= 0) {
          setFeedback('Free vote already used for this category.');
          return;
        }
      }

      const voteRes = await submitVoterVote(
        {
          categoryId,
          isPaid,
          quantity: 1,
        },
        token
      );

      if (!voteRes) {
        setFeedback('Vote failed');
        return;
      }

      setFeedback(isPaid ? 'Paid vote submitted.' : 'Free vote submitted.');
      await loadData();
    } catch {
      setFeedback('Vote failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200">
      <DashboardHeader
        eventName={data.eventName}
        isVerified={data.isVerified}
        maskedPhone={data.maskedPhone}
        onLogout={handleLogout}
      />

      <main className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[256px_minmax(0,1fr)]">
          <VoterSidebarNav />

          <div className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
            {feedback && (
              <div className="mb-4 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                {feedback}
              </div>
            )}
            <div className="mb-6">
              <VerificationBanner isVerified={data.isVerified} />
            </div>

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
                {data.walletData?.freeVotes?.slice(0, 6).map((category: any) => (
                  <CategoryVoteCard
                    key={category.categoryId}
                    category={category}
                    paidVotesAvailable={data.walletData?.paidVotesRemaining || 0}
                    isLoading={isLoading}
                    onUseFreeVote={() => handleUseVote(String(category.categoryId), false)}
                    onUsePaidVote={() => handleUseVote(String(category.categoryId), true)}
                    onBuyVotes={handleBuyMoreVotes}
                  />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentActivityTable activities={data.recentActivities} isLoading={isLoading} />
              </div>

              <SecurityPanel
                device={data.device}
                lastLogin={data.lastLogin}
                location={data.location}
                riskStatus={data.riskStatus}
                onManageSessionsClick={handleManageSessions}
                onReVerifyClick={handleReVerify}
              />
            </div>

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
