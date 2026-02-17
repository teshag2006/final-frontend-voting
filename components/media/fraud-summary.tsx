'use client';

import type { FraudSummary } from '@/types/media';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface FraudSummaryProps {
  data: FraudSummary;
}

export function FraudSummary({ data }: FraudSummaryProps) {
  const items = [
    {
      icon: AlertTriangle,
      label: 'Total Reports',
      value: data.totalReports,
      color: 'from-red-600 to-red-700',
      textColor: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: XCircle,
      label: 'Critical Cases',
      value: data.criticalCases,
      color: 'from-rose-600 to-rose-700',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-500/10',
    },
    {
      icon: CheckCircle2,
      label: 'Resolved',
      value: data.resolved,
      color: 'from-emerald-600 to-emerald-700',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Clock,
      label: 'Pending',
      value: data.pending,
      color: 'from-amber-600 to-amber-700',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <Card className="border-0 bg-slate-950 p-6 shadow-lg">
      <h3 className="mb-6 text-lg font-semibold text-white">Fraud Transparency Summary</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="rounded-lg bg-slate-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                </div>
                <div className={`rounded-lg ${item.bgColor} p-3`}>
                  <Icon className={`h-5 w-5 ${item.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-2 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <p className="text-xs font-medium text-slate-300">📋 Read-Only Access</p>
        <p className="text-xs text-slate-400">
          This fraud data is provided for transparency purposes. No individual voter or device data is exposed.
        </p>
      </div>
    </Card>
  );
}
