'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { paymentMethods } from '@/lib/vote-checkout-mock';

const methodFields: Record<string, Array<{ name: string; label: string; placeholder: string }>> = {
  credit_debit_card: [
    { name: 'cardNumber', label: 'Card Number', placeholder: '4111 1111 1111 1111' },
    { name: 'cardHolder', label: 'Card Holder', placeholder: 'Full name' },
    { name: 'expiry', label: 'Expiry', placeholder: 'MM/YY' },
    { name: 'cvv', label: 'CVV', placeholder: '123' },
  ],
  mobile_money: [
    { name: 'provider', label: 'Provider', placeholder: 'M-Pesa / Airtel / Orange' },
    { name: 'phone', label: 'Phone Number', placeholder: '+2519XXXXXXXX' },
  ],
  chapa: [
    { name: 'phone', label: 'Phone Number', placeholder: '+2519XXXXXXXX' },
    { name: 'email', label: 'Email', placeholder: 'you@example.com' },
  ],
  telebirr: [
    { name: 'phone', label: 'Telebirr Phone', placeholder: '+2519XXXXXXXX' },
  ],
  digital_wallet: [
    { name: 'wallet', label: 'Wallet', placeholder: 'PayPal' },
    { name: 'account', label: 'PayPal Email', placeholder: 'paypal@email.com' },
  ],
  crypto: [
    { name: 'network', label: 'Network', placeholder: 'Bitcoin / Ethereum' },
    { name: 'walletAddress', label: 'Wallet Address', placeholder: 'Paste wallet address' },
  ],
};

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

  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const fields = useMemo(() => methodFields[method] || [], [method]);

  const handleChange = (fieldName: string, value: string) => {
    setFormState((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleConfirmPayment = async () => {
    if (!methodMeta) {
      setErrorMessage('Invalid payment method.');
      return;
    }

    for (const field of fields) {
      if (!String(formState[field.name] || '').trim()) {
        setErrorMessage(`Please enter ${field.label.toLowerCase()}.`);
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const paymentId = `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const response = await fetch('/api/voter/payments', {
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
          status: 'confirmed',
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setErrorMessage(payload?.message || 'Payment failed. Please try again.');
        return;
      }

      setInfoMessage(`Payment successful via ${methodMeta.label}. Redirecting...`);
      setTimeout(() => {
        router.push('/voter/dashboard');
      }, 900);
    } catch {
      setErrorMessage('Payment failed. Please try again.');
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
            <h2 className="text-lg font-semibold text-slate-900">Payment Details</h2>
            {fields.length === 0 ? (
              <p className="text-sm text-slate-600">No extra details required for this method.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.name} className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">{field.label}</label>
                    <input
                      type="text"
                      value={formState[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-accent"
                    />
                  </div>
                ))}
              </div>
            )}

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
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Payment'}
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
