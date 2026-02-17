'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Vote, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIData {
  totalVotes: number;
  totalUsers: number;
  totalRevenue: number;
  fraudCases: number;
  previousVotes?: number;
  previousUsers?: number;
  previousRevenue?: number;
  previousFraud?: number;
}

interface ChartData {
  timestamp: string;
  votes: number;
  revenue: number;
  users: number;
  fraudAlerts: number;
}

interface DashboardOverviewProps {
  kpiData: KPIData;
  chartData: ChartData[];
  isLoading?: boolean;
  timeframe?: '24h' | '7d' | '30d';
  onTimeframeChange?: (timeframe: '24h' | '7d' | '30d') => void;
}

export function DashboardOverview({
  kpiData,
  chartData,
  isLoading = false,
  timeframe = '24h',
  onTimeframeChange,
}: DashboardOverviewProps) {
  const [percentageChanges, setPercentageChanges] = useState({
    votes: 0,
    users: 0,
    revenue: 0,
    fraud: 0,
  });

  useEffect(() => {
    setPercentageChanges({
      votes: kpiData.previousVotes ? ((kpiData.totalVotes - kpiData.previousVotes) / kpiData.previousVotes) * 100 : 0,
      users: kpiData.previousUsers ? ((kpiData.totalUsers - kpiData.previousUsers) / kpiData.previousUsers) * 100 : 0,
      revenue: kpiData.previousRevenue ? ((kpiData.totalRevenue - kpiData.previousRevenue) / kpiData.previousRevenue) * 100 : 0,
      fraud: kpiData.previousFraud ? ((kpiData.fraudCases - kpiData.previousFraud) / kpiData.previousFraud) * 100 : 0,
    });
  }, [kpiData]);

  const KPICard = ({
    title,
    value,
    icon: Icon,
    change,
    unit = '',
    isNegative = false,
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    change: number;
    unit?: string;
    isNegative?: boolean;
  }) => {
    const changeColor = isNegative ? (change < 0 ? 'text-green-600' : 'text-red-600') : (change > 0 ? 'text-green-600' : 'text-red-600');

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="text-muted-foreground">{Icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {value}
            {unit}
          </div>
          <p className={cn('text-xs', changeColor)}>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}% from previous period
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full space-y-8">
      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(['24h', '7d', '30d'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange?.(tf)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              timeframe === tf
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tf === '24h' ? 'Last 24 Hours' : tf === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        ))}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Votes"
          value={kpiData.totalVotes.toLocaleString()}
          icon={<Vote className="h-4 w-4" />}
          change={percentageChanges.votes}
        />
        <KPICard
          title="Active Users"
          value={kpiData.totalUsers.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          change={percentageChanges.users}
        />
        <KPICard
          title="Total Revenue"
          value={kpiData.totalRevenue.toLocaleString()}
          icon={<DollarSign className="h-4 w-4" />}
          change={percentageChanges.revenue}
          unit=" USD"
        />
        <KPICard
          title="Fraud Cases"
          value={kpiData.fraudCases}
          icon={<AlertTriangle className="h-4 w-4" />}
          change={percentageChanges.fraud}
          isNegative={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Vote & Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Vote & Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="votes" stroke="#3b82f6" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fraud Alerts Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Fraud Alerts Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="fraudAlerts" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Votes/Hour</span>
                <span className="font-bold">{(kpiData.totalVotes / (timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720)).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Revenue/Hour</span>
                <span className="font-bold">${(kpiData.totalRevenue / (timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720)).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fraud Detection Rate</span>
                <span className="font-bold">{((kpiData.fraudCases / Math.max(kpiData.totalVotes, 1)) * 100).toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User Growth Rate</span>
                <span className={cn('font-bold', percentageChanges.users >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {percentageChanges.users >= 0 ? '+' : ''}
                  {percentageChanges.users.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
