'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CheckoutHeader } from '@/components/vote-checkout/checkout-header';
import { VoteSummary } from '@/components/vote-checkout/vote-summary';
import { PaymentMethodSelector } from '@/components/vote-checkout/payment-method-selector';
import { SecureCheckoutSummary } from '@/components/vote-checkout/secure-checkout-summary';
import { Button } from '@/components/ui/button';
import { createCheckoutSession, getContestantProfile, getEventBySlug } from '@/lib/api';
import { PAYMENT_METHODS } from '@/lib/payment-methods';
import { authService } from '@/lib/services/authService';
import type { PaymentMethod } from '@/types/vote';

export default function VoteCheckoutPage() {
  const router = useRouter();
  const [safeQuantity, setSafeQuantity] = useState(10);
  const [eventSlug, setEventSlug] = useState('');
  const [contestantSlug, setContestantSlug] = useState('');
  const [contestant, setContestant] = useState<any | null>(null);
  const [event, setEvent] = useState<any | null>(null);
  const [unitPrice, setUnitPrice] = useState(1);
  const [userCountry, setUserCountry] = useState<'ET' | 'US'>('US');
  const [hasExplicitMethod, setHasExplicitMethod] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedQuantity = Number(params.get('quantity') || 10);
    const requestedMethod = String(params.get('method') || '').trim();
    const requestedEventSlug = String(params.get('eventSlug') || '').trim();
    const requestedContestantSlug = String(params.get('contestantSlug') || '').trim();
    if (Number.isFinite(requestedQuantity) && requestedQuantity > 0) {
      setSafeQuantity(requestedQuantity);
    }
    if (requestedMethod) {
      const isValidMethod = PAYMENT_METHODS.some((m) => m.id === requestedMethod);
      if (isValidMethod) {
        setHasExplicitMethod(true);
        setSelectedPaymentMethod(requestedMethod as PaymentMethod);
      }
    }
    if (requestedEventSlug) setEventSlug(requestedEventSlug);
    if (requestedContestantSlug) setContestantSlug(requestedContestantSlug);
  }, []);

  useEffect(() => {
    // Frontend-only geolocation heuristic for default payment method selection.
    const locale = Intl.DateTimeFormat().resolvedOptions().locale.toUpperCase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const ethiopiaLikely = locale.endsWith('-ET') || tz === 'Africa/Addis_Ababa';
    setUserCountry(ethiopiaLikely ? 'ET' : 'US');
  }, []);

  // Default to Chapa for Ethiopian users, Credit Card for others
  const defaultPaymentMethod: PaymentMethod = userCountry === 'ET' ? 'chapa' : 'credit_debit_card';
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
    defaultPaymentMethod
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasExplicitMethod) {
      setSelectedPaymentMethod(defaultPaymentMethod);
    }
  }, [defaultPaymentMethod, hasExplicitMethod]);

  useEffect(() => {
    if (!eventSlug || !contestantSlug) {
      setContestant(null);
      setEvent(null);
      return;
    }
    let mounted = true;
    Promise.all([
      getEventBySlug(eventSlug),
      getContestantProfile(eventSlug, contestantSlug),
    ]).then(([eventRes, contestantRes]) => {
      if (!mounted) return;
      setEvent(eventRes || null);
      setContestant(contestantRes || null);
      if (eventRes?.vote_price) {
        setUnitPrice(Number(eventRes.vote_price) || 1);
      }
    });
    return () => {
      mounted = false;
    };
  }, [eventSlug, contestantSlug]);

  const isPackageCheckout = !contestantSlug;

  const pricingQuote = useMemo(() => {
    const pricePerVote = unitPrice;
    const subtotal = Number((safeQuantity * pricePerVote).toFixed(2));
    const serviceFee = Number((subtotal * 0.075).toFixed(2));
    const tax = Number((subtotal * 0.025).toFixed(2));
    return {
      pricePerVote,
      quantity: safeQuantity,
      subtotal,
      serviceFee,
      tax,
      totalAmount: Number((subtotal + serviceFee + tax).toFixed(2)),
      currency: userCountry === 'ET' ? 'ETB' : 'USD',
      generatedAt: new Date().toISOString(),
    };
  }, [safeQuantity, unitPrice, userCountry]);

  const handleProceedToPayment = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const token = authService.getToken() || undefined;
      if (contestant?.id) {
        const checkout = await createCheckoutSession(
          { contestantId: String(contestant.id), quantity: pricingQuote.quantity },
          token
        );
        if (checkout) {
          setUnitPrice(Number(checkout.unitPrice || unitPrice));
        }
      }

      const params = new URLSearchParams({
        quantity: String(pricingQuote.quantity),
        totalAmount: String(pricingQuote.totalAmount),
        currency: String(pricingQuote.currency || 'USD'),
        eventName: isPackageCheckout
          ? 'Wallet Vote Package'
          : event?.name || 'Event',
      });
      if (eventSlug) params.set('eventSlug', eventSlug);
      if (contestantSlug) params.set('contestantSlug', contestantSlug);
      router.push(`/vote/checkout/pay/${encodeURIComponent(selectedPaymentMethod)}?${params.toString()}`);
    } catch (error) {
      setCheckoutError('Payment initiation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMethodLabel =
    PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.label || 'Payment Method';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef2ff_45%,#e7ecff_100%)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-12 md:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Vote Checkout</h1>
          <p className="text-slate-600">Complete your secure vote purchase</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {/* Left: Main Checkout Form (2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {isPackageCheckout ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Wallet Vote Package</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Buy votes into your wallet and use them later on any eligible contestant.
                </p>
              </div>
            ) : (
              <CheckoutHeader
                contestantImage={contestant?.photo_url || contestant?.image_url || '/placeholder.svg'}
                contestantName={contestant?.name || 'Contestant'}
                eventName={event?.name || 'Event'}
                category={contestant?.category_name || contestant?.category || 'Category'}
                rank={contestant?.rank || 0}
                totalVotes={contestant?.total_votes || 0}
                pricePerVote={pricingQuote.pricePerVote}
              />
            )}

            {/* Vote Quantity Section */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Vote Quantity</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 5, 10, 25, 50, 100].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      onClick={() => setSafeQuantity(num)}
                      className="border-slate-300 text-slate-800 hover:border-accent hover:bg-accent hover:text-white"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Min: 1 vote | Max: 100 votes per
                  transaction
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <VoteSummary
              quantity={pricingQuote.quantity}
              pricePerVote={pricingQuote.pricePerVote}
              subtotal={pricingQuote.subtotal}
              serviceFee={pricingQuote.serviceFee}
              tax={pricingQuote.tax}
              totalAmount={pricingQuote.totalAmount}
              currency={pricingQuote.currency}
            />

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              methods={PAYMENT_METHODS}
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
              userCountry={userCountry}
            />

            {checkoutError && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {checkoutError}
              </div>
            )}
            <p className="text-xs text-slate-600">
              Price and final vote quantity are confirmed by backend before payment authorization.
            </p>
          </div>

          {/* Right: Secure Checkout Summary */}
          <div className="lg:col-span-1">
            <SecureCheckoutSummary
              contestantName={isPackageCheckout ? 'Wallet Vote Package' : contestant?.name || 'Contestant'}
              quantity={pricingQuote.quantity}
              totalAmount={pricingQuote.totalAmount}
              paymentMethod={selectedMethodLabel}
              onProceedClick={handleProceedToPayment}
              isLoading={isProcessing}
              isDisabled={false}
            />
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
