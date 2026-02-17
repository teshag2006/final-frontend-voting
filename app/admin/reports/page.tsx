'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
          <Card className="p-8 text-center">
            <p className="text-slate-600">Revenue & Payments reporting interface coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="fraud">
          <Card className="p-8 text-center">
            <p className="text-slate-600">Fraud & Risk analysis interface coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="p-8 text-center">
            <p className="text-slate-600">System logs and audit trails interface coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card className="p-8 text-center">
            <p className="text-slate-600">Custom report builder interface coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
