'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CheckoutHeader } from '@/components/vote-checkout/checkout-header';
import { VoteSummary } from '@/components/vote-checkout/vote-summary';
import { PaymentMethodSelector } from '@/components/vote-checkout/payment-method-selector';
import { LimitConfirmation } from '@/components/vote-checkout/limit-confirmation';
import { TermsConsent } from '@/components/vote-checkout/terms-consent';
import { SecureCheckoutSummary } from '@/components/vote-checkout/secure-checkout-summary';
import { IntegrityNotice } from '@/components/vote-checkout/integrity-notice';
import { Button } from '@/components/ui/button';
import {
  mockCheckoutSession,
  mockPricingResponse,
  mockCheckoutContestant,
  paymentMethods,
} from '@/lib/vote-checkout-mock';
import type { PaymentMethod } from '@/types/vote';

export default function VoteCheckoutPage() {
  // Default to Chapa for Ethiopian users, Credit Card for others
  // TODO: Replace with actual geolocation detection from user session/IP
  const userCountry = 'ET'; // Mock: set to 'ET' for Ethiopia, 'US' for others
  const defaultPaymentMethod: PaymentMethod = userCountry === 'ET' ? 'chapa' : 'credit_debit_card';
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
    defaultPaymentMethod
  );
  const [nonRefundableAccepted, setNonRefundableAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [finalVotesAccepted, setFinalVotesAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const allTermsAccepted =
    nonRefundableAccepted && termsAccepted && finalVotesAccepted;

  const handleProceedToPayment = async () => {
    if (!allTermsAccepted) {
      alert('Please accept all terms before proceeding');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Integrate with POST /vote/pre-authorize endpoint
      // 1. Call /vote/pre-authorize with transactionToken
      // 2. Validate server-side response
      // 3. Redirect to payment gateway if successful
      // 4. Handle errors and show appropriate messages

      console.log('[v0] Checkout submitted with:', {
        paymentMethod: selectedPaymentMethod,
        quantity: mockCheckoutSession.quantity,
        totalAmount: mockPricingResponse.totalAmount,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual payment gateway redirect
      alert('Redirecting to payment gateway...');
    } catch (error) {
      alert('Payment initiation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMethodLabel =
    paymentMethods.find((m) => m.id === selectedPaymentMethod)?.label || 'Payment Method';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-12 md:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Vote Checkout</h1>
          <p className="text-white/60">Complete your secure vote purchase</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {/* Left: Main Checkout Form (2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contestant Header */}
            <CheckoutHeader
              contestantImage={mockCheckoutContestant.image}
              contestantName={mockCheckoutContestant.name}
              eventName={mockCheckoutContestant.event.name}
              category={mockCheckoutContestant.category}
              rank={mockCheckoutContestant.rank}
              totalVotes={mockCheckoutContestant.totalVotes}
              pricePerVote={mockCheckoutContestant.pricePerVote}
            />

            {/* Vote Quantity Section */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-bold text-white text-lg mb-4">Vote Quantity</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 5, 10, 25, 50, 100].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-accent hover:text-white hover:border-accent"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-white/50 mt-4">
                  Min: 1 vote | Max: {mockCheckoutSession.maxPerTransaction} votes per
                  transaction
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <VoteSummary
              quantity={mockCheckoutSession.quantity}
              pricePerVote={mockPricingResponse.pricePerVote}
              subtotal={mockPricingResponse.subtotal}
              serviceFee={mockPricingResponse.serviceFee}
              tax={mockPricingResponse.tax}
              totalAmount={mockPricingResponse.totalAmount}
              currency={mockPricingResponse.currency}
            />

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              methods={paymentMethods}
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
              userCountry={userCountry}
            />

            {/* Voter Information Section */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <h3 className="font-bold text-white text-lg">Voter Information (Optional)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-accent focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Country</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-accent focus:outline-none transition">
                    <option value="US">United States</option>
                    <option value="ET">Ethiopia</option>
                    <option value="KE">Kenya</option>
                    <option value="NG">Nigeria</option>
                    <option value="ZA">South Africa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms & Consent */}
            <TermsConsent
              nonRefundableAccepted={nonRefundableAccepted}
              termsAccepted={termsAccepted}
              finalVotesAccepted={finalVotesAccepted}
              onNonRefundableChange={setNonRefundableAccepted}
              onTermsChange={setTermsAccepted}
              onFinalVotesChange={setFinalVotesAccepted}
            />

            {/* Integrity Notice */}
            <IntegrityNotice className="mb-8" />
          </div>

          {/* Right: Secure Checkout Summary */}
          <div className="lg:col-span-1">
            <SecureCheckoutSummary
              contestantName={mockCheckoutContestant.name}
              quantity={mockCheckoutSession.quantity}
              totalAmount={mockPricingResponse.totalAmount}
              paymentMethod={selectedMethodLabel}
              onProceedClick={handleProceedToPayment}
              isLoading={isProcessing}
              isDisabled={!allTermsAccepted}
            />
          </div>
        </div>

        {/* Limit Confirmation (Full Width) */}
        <div className="max-w-7xl mx-auto mb-12">
          <LimitConfirmation
            paidRemaining={mockCheckoutSession.paidVotesRemaining}
            dailyRemaining={mockCheckoutSession.dailyVotesRemaining}
            maxPerTransaction={mockCheckoutSession.maxPerTransaction}
            quantity={mockCheckoutSession.quantity}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
