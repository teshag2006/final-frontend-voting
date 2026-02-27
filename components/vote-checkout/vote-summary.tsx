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
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>

      <div className="space-y-3">
        {summaryItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-slate-600">{item.label}:</span>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-4" />

      <div className="flex items-end justify-between">
        <span className="text-lg font-bold text-slate-900">Total Payable:</span>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent">${totalAmount.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-500">{currency}</div>
        </div>
      </div>
    </div>
  );
}
