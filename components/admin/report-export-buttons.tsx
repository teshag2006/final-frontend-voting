'use client';

import { Button } from '@/components/ui/button';
import { Download, FileText, Sheet } from 'lucide-react';
import { useState } from 'react';

interface ReportExportButtonsProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ReportExportButtons({ onExport, isLoading, disabled }: ReportExportButtonsProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExportingFormat(format);
    try {
      await onExport(format);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('csv')}
        disabled={disabled || isLoading}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        {exportingFormat === 'csv' ? 'Exporting...' : 'CSV'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('excel')}
        disabled={disabled || isLoading}
        className="gap-2"
      >
        <Sheet className="w-4 h-4" />
        {exportingFormat === 'excel' ? 'Exporting...' : 'Excel'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={disabled || isLoading}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        {exportingFormat === 'pdf' ? 'Exporting...' : 'PDF'}
      </Button>
    </div>
  );
}
