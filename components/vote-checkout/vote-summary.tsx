'use client';

interface VoteSummaryProps {
  quantity: number;
  pricePerVote: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  totalAmount: number;
  currency?: string;
}

export function VoteSummary({
  quantity,
  pricePerVote,
  subtotal,
  serviceFee,
  tax,
  totalAmount,
  currency = 'USD',
}: VoteSummaryProps) {
  const summaryItems = [
    { label: 'Price Per Vote', value: `$${pricePerVote.toFixed(2)}` },
    { label: 'Quantity', value: `${quantity} Votes` },
    { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
    { label: 'Service Fee', value: `$${serviceFee.toFixed(2)}` },
    { label: 'Tax', value: `$${tax.toFixed(2)}` },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
      <h3 className="font-bold text-white text-lg">Order Summary</h3>

      {/* Summary Items */}
      <div className="space-y-3">
        {summaryItems.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-white/70">{item.label}:</span>
            <span className="font-semibold text-white">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-4" />

      {/* Total */}
      <div className="flex justify-between items-end">
        <span className="text-lg font-bold text-white">Total Payable:</span>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent">
            ${totalAmount.toFixed(2)}
          </div>
          <div className="text-xs text-white/50 mt-1">{currency}</div>
        </div>
      </div>
    </div>
  );
}
