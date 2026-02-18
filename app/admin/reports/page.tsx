'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportKPICard } from '@/components/admin/report-kpi-card';
import { ReportExportButtons } from '@/components/admin/report-export-buttons';
import { ReportsOverviewTab } from '@/components/admin/reports-overview-tab';
import { ReportsVotingTab } from '@/components/admin/reports-voting-tab';
import { Calendar } from 'lucide-react';
import {
  generateOverviewKPIs,
  generateChartData,
  generateVoteAnalytics,
  generatePaymentMetrics,
  generateFraudMetrics,
  generateSystemLogs,
} from '@/lib/reports-mock';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [kpis, setKpis] = useState(generateOverviewKPIs());
  const [chartData, setChartData] = useState(generateChartData());
  const [voteAnalytics, setVoteAnalytics] = useState(generateVoteAnalytics());
  const [paymentMetrics, setPaymentMetrics] = useState(generatePaymentMetrics());
  const [fraudMetrics, setFraudMetrics] = useState(generateFraudMetrics());
  const [systemLogs, setSystemLogs] = useState(generateSystemLogs());

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Simulate export API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log(`Exported report as ${format.toUpperCase()}`);
      // In production, trigger download here
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Export</h1>
        <p className="text-slate-600 mt-1">Analytics, financial reconciliation and system reports</p>
      </div>

      {/* Controls */}
      <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <Calendar className="w-5 h-5 text-slate-500 mt-1 sm:mt-0" />
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="text-sm"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="text-sm"
            />
          </div>
        </div>
        <ReportExportButtons onExport={handleExport} isLoading={isLoading} />
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="fraud">Fraud</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReportsOverviewTab kpis={kpis} chartData={chartData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="voting">
          <ReportsVotingTab data={voteAnalytics} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="revenue">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-4">
                <p className="text-sm text-slate-600">Total Transactions</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{paymentMetrics.totalTransactions.toLocaleString()}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-slate-600">Success Rate</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{paymentMetrics.successRate}%</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-slate-600">Average Ticket Size</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">${paymentMetrics.averageTicketSize}</p>
              </Card>
            </div>
            <Card className="overflow-hidden">
              <div className="border-b p-4">
                <h3 className="font-semibold text-slate-900">Gateway Breakdown</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">Amount (USD)</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMetrics.providers.map((provider: any) => {
                    const total = paymentMetrics.providers.reduce((sum: number, p: any) => sum + p.amount, 0);
                    const share = total > 0 ? ((provider.amount / total) * 100).toFixed(1) : '0.0';
                    return (
                      <TableRow key={provider.name}>
                        <TableCell className="font-medium">{provider.name}</TableCell>
                        <TableCell className="text-right">${provider.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{share}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fraud">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="p-4">
                <p className="text-sm text-slate-600">Total Cases</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{fraudMetrics.totalCases}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-slate-600">Resolved Cases</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{fraudMetrics.resolvedCases}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-slate-600">Critical Cases</p>
                <p className="mt-1 text-2xl font-bold text-red-700">{fraudMetrics.criticalCases}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-slate-600">Votes Removed</p>
                <p className="mt-1 text-2xl font-bold text-amber-700">{fraudMetrics.votesRemoved.toLocaleString()}</p>
              </Card>
            </div>
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900">Risk Posture</h3>
              <p className="mt-2 text-sm text-slate-600">
                Mock analytics indicate elevated fraud pressure in high-volume windows. Queue depth and review throughput are healthy.
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="overflow-hidden">
            <div className="border-b p-4">
              <h3 className="font-semibold text-slate-900">System Logs</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.id}</TableCell>
                    <TableCell>{log.level}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900">Saved Report Templates</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="font-medium text-slate-900">Revenue Reconciliation</p>
                  <p className="mt-1 text-sm text-slate-600">Payments, refunds, and payout consistency checks.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="font-medium text-slate-900">Fraud Escalation Digest</p>
                  <p className="mt-1 text-sm text-slate-600">Critical cases with unresolved actions and SLA timers.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="font-medium text-slate-900">Contestant Momentum</p>
                  <p className="mt-1 text-sm text-slate-600">Daily voting trend, rank movement, and conversion signals.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="font-medium text-slate-900">Operational Health</p>
                  <p className="mt-1 text-sm text-slate-600">Queue throughput, cache hit rates, and webhook reliability.</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
