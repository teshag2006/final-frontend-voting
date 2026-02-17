'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type PaymentData } from './payments-table';

interface ExportPaymentsButtonProps {
  payments: PaymentData[];
  isLoading?: boolean;
  onExport?: (format: 'csv' | 'xlsx' | 'pdf') => Promise<void>;
}

export function ExportPaymentsButton({
  payments,
  isLoading = false,
  onExport,
}: ExportPaymentsButtonProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const generateCSV = () => {
    const headers = [
      'Payment ID',
      'Reference',
      'Event',
      'Contestant',
      'Amount',
      'Currency',
      'Gateway',
      'Status',
      'Fraud Risk',
      'IP Address',
      'Anchored',
      'Created At',
    ];

    const rows = payments.map((p) => [
      p.paymentId,
      p.reference,
      p.event,
      p.contestant,
      p.amount,
      p.currency,
      p.gateway,
      p.status,
      p.fraudRisk,
      p.ipAddress,
      p.anchored ? 'Yes' : 'No',
      new Date(p.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const stringCell = String(cell);
            return stringCell.includes(',') ? `"${stringCell}"` : stringCell;
          })
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  };

  const handleExportCSV = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `payments_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onExport?.('csv');
  };

  const handleExportExcel = async () => {
    // Call API for Excel export
    try {
      await onExport?.('xlsx');
    } catch (error) {
      console.error('Export to Excel failed:', error);
    }
  };

  const handleExportPDF = async () => {
    // Call API for PDF export
    try {
      await onExport?.('pdf');
    } catch (error) {
      console.error('Export to PDF failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || payments.length === 0}
          className="gap-2"
          aria-label="Export payments"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isLoading}>
          <span>Export CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} disabled={isLoading}>
          <span>Export Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={isLoading}>
          <span>Export PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
