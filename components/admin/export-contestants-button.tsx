'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContestantData } from './contestants-table';

interface ExportContestantsButtonProps {
  contestants: ContestantData[];
  fileName?: string;
  isLoading?: boolean;
}

export function ExportContestantsButton({
  contestants,
  fileName = 'contestants.csv',
  isLoading = false,
}: ExportContestantsButtonProps) {
  const handleExport = () => {
    if (contestants.length === 0) {
      alert('No contestants to export');
      return;
    }

    // CSV headers
    const headers = ['ID', 'Name', 'Category', 'Status', 'Total Votes', 'Revenue', 'Created At'];

    // CSV rows
    const rows = contestants.map((c) => [
      c.id,
      c.name,
      c.category,
      c.status,
      c.totalVotes,
      `$${c.revenue.toFixed(2)}`,
      new Date(c.createdAt).toLocaleString(),
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape cells that contain commas or quotes
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isLoading || contestants.length === 0}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Export CSV</span>
    </Button>
  );
}
