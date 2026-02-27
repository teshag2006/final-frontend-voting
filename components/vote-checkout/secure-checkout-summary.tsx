'use client';

import { Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecureCheckoutSummaryProps {
  contestantName: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  processingTime?: string;
  onProceedClick: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function SecureCheckoutSummary({
  contestantName,
  quantity,
  totalAmount,
  paymentMethod,
  processingTime = 'Instant',
  onProceedClick,
  isLoading = false,
  isDisabled = false,
}: SecureCheckoutSummaryProps) {
  return (
    <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-accent" />
        <h3 className="text-lg font-bold text-slate-900">Secure Checkout</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Purchase:</span>
          <span className="font-semibold text-slate-900">{contestantName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Vote Quantity:</span>
          <span className="font-semibold text-slate-900">{quantity} Votes</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Payment Method:</span>
          <span className="font-semibold text-slate-900">{paymentMethod}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Processing Time:</span>
          <span className="font-semibold text-slate-900">{processingTime}</span>
        </div>
      </div>

      <div className="border-t border-slate-200" />

      <div className="space-y-2">
        <div className="text-sm text-slate-600">Total Payable</div>
        <div className="text-3xl font-bold text-accent">${totalAmount.toFixed(2)}</div>
      </div>

      <Button
        onClick={onProceedClick}
        disabled={isDisabled || isLoading}
        className="h-11 w-full bg-accent font-semibold text-white hover:bg-accent/90"
      >
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
      </Button>

      <div className="border-t border-slate-200 pt-4 space-y-3">
        <h4 className="flex items-center gap-2 font-semibold text-slate-900">
          <Shield className="h-4 w-4 text-accent" />
          SECURE PAYMENT
        </h4>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <span>Votes are securely anchored on the Ethereum blockchain.</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <span>256-bit SSL encryption protects your payment information.</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <span>PCI DSS Level 1 compliance for secure transactions.</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-200 pt-4">
        <div className="mb-3 text-xs text-slate-500">Accepted Payment Methods:</div>
        <div className="flex flex-wrap gap-2">
          {['Visa', 'Mastercard', 'PayPal', 'Square'].map((method) => (
            <div key={method} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
              {method}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <p className="text-center text-xs text-slate-500">
          All paid votes are subject to daily and event limits to ensure fair participation.
        </p>
      </div>
    </div>
  );
}
