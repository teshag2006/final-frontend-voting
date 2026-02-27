'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { paymentMethods } from '@/lib/vote-checkout-mock';

export default function PaymentMethodCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const method = String(params.method || '').trim();
  const methodMeta = paymentMethods.find((item) => item.id === method);

  const quantity = Number(searchParams.get('quantity') || 1);
  const totalAmount = Number(searchParams.get('totalAmount') || 0);
  const currency = searchParams.get('currency') || 'USD';
  const eventName = searchParams.get('eventName') || 'Event';
  const eventSlug = searchParams.get('eventSlug') || '';
  const contestantSlug = searchParams.get('contestantSlug') || '';
  const returnStatus = searchParams.get('status') || '';
  const hasHandledReturn = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const getProviderRedirectUrl = () => {
    const providerUrl = String((methodMeta as any)?.providerUrl || '').trim();
    if (!providerUrl) return '';

    const returnBase = `${window.location.origin}/vote/checkout/pay/${encodeURIComponent(method)}`;
    const returnParams = new URLSearchParams({
      status: 'success',
      quantity: String(quantity),
      totalAmount: String(totalAmount),
      currency,
      eventName,
      eventSlug,
      contestantSlug,
    });
    const cancelParams = new URLSearchParams({
      status: 'cancelled',
      quantity: String(quantity),
      totalAmount: String(totalAmount),
      currency,
      eventName,
      eventSlug,
      contestantSlug,
    });

    // Keep this frontend-only and provider-agnostic for dev stage.
    const url = new URL(providerUrl);
    url.searchParams.set('amount', String(totalAmount));
    url.searchParams.set('currency', currency);
    url.searchParams.set('reference', `vote-${Date.now()}`);
    url.searchParams.set('return_url', `${returnBase}?${returnParams.toString()}`);
    url.searchParams.set('cancel_url', `${returnBase}?${cancelParams.toString()}`);
    return url.toString();
  };

  useEffect(() => {
    if (hasHandledReturn.current) return;
    if (returnStatus !== 'success' && returnStatus !== 'cancelled') return;

    if (returnStatus === 'cancelled') {
      hasHandledReturn.current = true;
      setErrorMessage('Payment was cancelled. You can try again with this or another method.');
      return;
    }

    hasHandledReturn.current = true;
    setIsProcessing(true);
    setInfoMessage('Payment return received. Finalizing...');
    setErrorMessage(null);

    const paymentId = `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    void fetch('/api/voter/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        paymentId,
        votesPurchased: quantity,
        amount: totalAmount,
        currency,
        paymentMethod: method,
        eventName,
        eventSlug,
        contestantSlug,
        purchaseType: contestantSlug ? 'direct' : 'package',
        status: 'confirmed',
      }),
    })
      .finally(() => {
        router.replace('/voter/dashboard');
      });
  }, [returnStatus, quantity, totalAmount, currency, method, eventName, router]);

  const handleContinueToProvider = async () => {
    if (!methodMeta) {
      setErrorMessage('Invalid payment method.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const redirectUrl = getProviderRedirectUrl();
      if (!redirectUrl) {
        setErrorMessage('Provider URL is not configured for this payment method.');
        return;
      }

      setInfoMessage(`Redirecting to ${methodMeta.label}...`);
      window.location.assign(redirectUrl);
    } catch {
      setErrorMessage('Unable to redirect to payment provider. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!methodMeta) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-700">Invalid payment method.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef2ff_45%,#e7ecff_100%)]">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">{methodMeta.label} Checkout</h1>
            <p className="mt-1 text-sm text-slate-600">{methodMeta.description}</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-100 px-3 py-2">Votes: {quantity}</div>
              <div className="rounded-lg bg-slate-100 px-3 py-2">
                Total: {currency} {totalAmount.toFixed(2)}
              </div>
              <div className="rounded-lg bg-slate-100 px-3 py-2 sm:col-span-2">Event: {eventName}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Redirect To Official Provider</h2>
            <p className="text-sm text-slate-600">
              For security, payment details are entered on the official {methodMeta.label} page.
            </p>

            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {infoMessage && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {infoMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={() => router.back()}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleContinueToProvider}
                disabled={isProcessing}
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {isProcessing ? 'Redirecting...' : `Continue To ${methodMeta.label}`}
              </button>
            </div>
          </div>

          {(eventSlug || contestantSlug) && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              Return URL context: {eventSlug || 'n/a'} / {contestantSlug || 'n/a'}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
