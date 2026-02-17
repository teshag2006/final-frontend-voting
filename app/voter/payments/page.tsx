import type { Metadata } from 'next';
import Link from 'next/link';
import { getVoterPayments } from '@/lib/api';
import { mockVoterPayments } from '@/lib/voter-mock';
import { PaymentTable } from '@/components/voter/payment-table';
import { VoterNavTabs } from '@/components/voter/voter-nav-tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payment History | Miss & Mr Africa',
  description: 'View your vote bundle purchases and payment history',
};

export default async function PaymentHistoryPage() {
  const apiData = await getVoterPayments();
  const data = apiData || mockVoterPayments;
  const payments = data.payments;

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Tabs */}
      <VoterNavTabs />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-foreground mb-2">Payment History</h1>
          <p className="text-muted-foreground">
            All your vote bundle purchases and payment records
          </p>
        </div>

        {/* Content */}
        {payments.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-foreground">{payments.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Votes Purchased</p>
                <p className="text-2xl font-bold text-foreground">
                  {payments.reduce((sum, p) => sum + p.voteQuantity, 0)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payments Table */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <PaymentTable payments={payments} />
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-border border-dashed bg-muted/20 p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No Payment History
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven't purchased any vote bundles yet. Start voting and purchase votes to
              support your favorite contestants.
            </p>
            <Link href="/category/1">
              <Button className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Browse Contestants
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
