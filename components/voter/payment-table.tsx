import Link from 'next/link';
import type { VoterPayment } from '@/types/voter';
import { Badge } from '@/components/ui/badge';

interface PaymentTableProps {
  payments: VoterPayment[];
}

const statusStyles = {
  completed: 'bg-green-100 text-green-800 hover:bg-green-200',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  failed: 'bg-red-100 text-red-800 hover:bg-red-200',
};

export function PaymentTable({ payments }: PaymentTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Receipt #</th>
            <th className="px-4 py-3 text-left font-semibold">Event</th>
            <th className="px-4 py-3 text-left font-semibold">Votes</th>
            <th className="px-4 py-3 text-left font-semibold">Amount</th>
            <th className="px-4 py-3 text-left font-semibold">Method</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Date</th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {payments.map((payment) => (
            <tr key={payment.receiptNumber} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {payment.receiptNumber}
              </td>
              <td className="px-4 py-3 text-foreground">{payment.eventName}</td>
              <td className="px-4 py-3 font-semibold">{payment.voteQuantity}</td>
              <td className="px-4 py-3 font-semibold">
                {formatCurrency(payment.amount, payment.currency)}
              </td>
              <td className="px-4 py-3 capitalize text-muted-foreground">
                {payment.paymentMethod}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="secondary"
                  className={`${statusStyles[payment.status]} cursor-default`}
                >
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(payment.createdAt)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/receipt/${payment.receiptNumber}`}
                  className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
