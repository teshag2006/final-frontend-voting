'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getVoterPayments } from '@/lib/api';
import { PaymentTable } from '@/components/voter/payment-table';
import { VoterUnifiedShell } from '@/components/voter/voter-unified-shell';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { authService } from '@/lib/services/authService';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const token = authService.getToken() || undefined;
      const apiData = await getVoterPayments(token);
      setPayments(Array.isArray(apiData?.payments) ? apiData.payments : []);
      setIsLoading(false);
    };
    void load();
  }, []);

  return (
    <VoterUnifiedShell>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground">All your vote bundle purchases and payment records</p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading payment history...
        </div>
      ) : payments.length > 0 ? (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-1 text-sm text-muted-foreground">Total Payments</p>
              <p className="text-2xl font-bold text-foreground">{payments.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-1 text-sm text-muted-foreground">Total Votes Purchased</p>
              <p className="text-2xl font-bold text-foreground">
                {payments.reduce((sum, p) => sum + Number(p.voteQuantity || 0), 0)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-1 text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">
                ${payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <PaymentTable payments={payments} />
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-border border-dashed bg-muted/20 p-12 text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No Payment History</h2>
          <p className="mb-6 text-muted-foreground">
            You have not purchased any vote bundles yet.
          </p>
          <Link href="/events">
            <Button className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Browse Events
            </Button>
          </Link>
        </div>
      )}
    </VoterUnifiedShell>
  );
}
