'use client';

import { Shield, Check, Lock } from 'lucide-react';
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
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6 sticky top-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-accent" />
        <h3 className="font-bold text-white text-lg">Secure Checkout</h3>
      </div>

      {/* Summary Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-white/70">You are voting for:</span>
          <span className="font-semibold text-white">{contestantName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Vote Quantity:</span>
          <span className="font-semibold text-white">{quantity} Votes</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Payment Method:</span>
          <span className="font-semibold text-white">{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Processing Time:</span>
          <span className="font-semibold text-white">{processingTime}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Total */}
      <div className="space-y-2">
        <div className="text-white/70 text-sm">Total Payable</div>
        <div className="text-3xl font-bold text-accent">${totalAmount.toFixed(2)}</div>
      </div>

      {/* Proceed Button */}
      <Button
        onClick={onProceedClick}
        disabled={isDisabled || isLoading}
        className="w-full bg-accent hover:bg-accent/90 text-white h-11 font-semibold"
      >
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
      </Button>

      {/* Security Info */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          SECURE PAYMENT
        </h4>

        <div className="space-y-2 text-xs text-white/70">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <span>Votes are securely anchored on the Ethereum blockchain.</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <span>256-bit SSL encryption protects your payment information.</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <span>PCI DSS Level 1 compliance for secure transactions.</span>
          </div>
        </div>
      </div>

      {/* Payment Icons */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="text-xs text-white/60 mb-3">Accepted Payment Methods:</div>
        <div className="flex flex-wrap gap-2">
          {['Visa', 'Mastercard', 'PayPal', 'Square'].map((method) => (
            <div
              key={method}
              className="bg-white/10 rounded px-2 py-1 text-xs text-white/80"
            >
              {method}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notice */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-white/50 text-center">
          All paid votes are subject to daily and event limits to ensure fair participation.
        </p>
      </div>
    </div>
  );
}
