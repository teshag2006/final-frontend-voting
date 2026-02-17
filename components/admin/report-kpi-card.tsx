'use client';

import { OverviewKPI } from '@/types/reports';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ReportKPICardProps {
  kpi: OverviewKPI;
  isLoading?: boolean;
}

export function ReportKPICard({ kpi, isLoading }: ReportKPICardProps) {
  const isIncrease = kpi.changeType === 'increase';
  const isPositive = isIncrease && kpi.change > 0;
  const arrowColor = isPositive ? 'text-emerald-600' : isIncrease ? 'text-red-600' : 'text-slate-600';

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
        <div className="h-8 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-1/3" />
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <p className="text-sm font-medium text-slate-600 mb-2">{kpi.label}</p>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
          <p className="text-xs text-slate-500 mt-1">{kpi.unit || ''}</p>
        </div>
        <div className={`flex items-center gap-1 ${arrowColor}`}>
          {isIncrease ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">{Math.abs(kpi.change)}%</span>
        </div>
      </div>
    </Card>
  );
}
