'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Share2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function ExportCenter() {
  const [exporting, setExporting] = useState<string | null>(null);

  const exports = [
    {
      id: 'leaderboard',
      title: 'Leaderboard CSV',
      description: 'Export complete leaderboard rankings',
      icon: FileText,
    },
    {
      id: 'revenue',
      title: 'Revenue Summary PDF',
      description: 'Aggregated revenue breakdown report',
      icon: FileText,
    },
    {
      id: 'fraud',
      title: 'Fraud Summary Report',
      description: 'Transparency fraud statistics',
      icon: FileText,
    },
    {
      id: 'geographic',
      title: 'Geographic Distribution',
      description: 'Vote distribution by country',
      icon: FileText,
    },
    {
      id: 'sponsors',
      title: 'Sponsor Performance',
      description: 'Sponsor placements, impressions, CTR',
      icon: FileText,
    },
  ];

  const handleExport = async (id: string) => {
    setExporting(id);
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setExporting(null);
  };

  return (
    <Card className="border-0 bg-slate-950 p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Export Center</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-900">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {exports.map((exp) => {
          const Icon = exp.icon;
          const isExporting = exporting === exp.id;

          return (
            <div
              key={exp.id}
              className="flex flex-col justify-between rounded-lg border border-slate-700 bg-slate-900 p-4 transition-all hover:border-slate-600 hover:bg-slate-900/80"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{exp.title}</p>
                  <p className="text-xs text-slate-400">{exp.description}</p>
                </div>
              </div>

              <Button
                onClick={() => handleExport(exp.id)}
                disabled={isExporting}
                variant="outline"
                size="sm"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {isExporting ? (
                  <>
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-slate-200" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-700/50 bg-amber-500/10 p-4">
        <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-300">
          <p className="font-medium">Security Notice</p>
          <p className="mt-1 text-xs text-amber-200">
            All exports contain aggregated, anonymized data safe for public reporting. Downloads are logged for audit purposes.
          </p>
        </div>
      </div>
    </Card>
  );
}
