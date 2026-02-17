'use client';

import { OverviewKPI } from '@/types/reports';
import { ReportKPICard } from './report-kpi-card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface ReportsOverviewTabProps {
  kpis: OverviewKPI[];
  chartData: Array<{ date: string; votes?: number; revenue?: number; value?: number }>;
  isLoading?: boolean;
}

export function ReportsOverviewTab({ kpis, chartData, isLoading }: ReportsOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <ReportKPICard key={kpi.label} kpi={kpi} isLoading={isLoading} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Votes Over Time */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Votes Over Time</h3>
          {isLoading ? (
            <div className="h-64 bg-slate-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="votes" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Revenue Over Time */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue Over Time</h3>
          {isLoading ? (
            <div className="h-64 bg-slate-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" fill="#10b981" stroke="#059669" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top Categories */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Top Categories by Votes</h3>
          {isLoading ? (
            <div className="h-64 bg-slate-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.slice(-5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="votes" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top Contestants */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Top Contestants by Votes</h3>
          {isLoading ? (
            <div className="h-64 bg-slate-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.slice(-5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
