'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { UserNav } from '@/components/auth/user-nav';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Vote,
  DollarSign,
  Calendar,
} from 'lucide-react';

function AnalyticsContent() {
  const { user: currentUser, hasRole } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  if (!currentUser) {
    return null;
  }

  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-slate-400 mt-2">You do not have permission to view this page</p>
          <Button onClick={() => router.push('/')} className="mt-4 bg-blue-600 hover:bg-blue-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const analyticsData = {
    users: {
      total: 1247,
      new: 142,
      trend: 12.5,
    },
    votes: {
      total: 28542,
      daily: 856,
      trend: 8.3,
    },
    revenue: {
      total: 42850,
      daily: 1428,
      trend: 15.2,
    },
    contests: {
      total: 12,
      active: 5,
      completed: 7,
    },
  };

  const userData = [
    { name: 'Admin', count: 5, percentage: 0.4 },
    { name: 'Contestant', count: 234, percentage: 18.7 },
    { name: 'Media', count: 89, percentage: 7.1 },
    { name: 'Voter', count: 919, percentage: 73.8 },
  ];

  const votesTrend = [
    { date: 'Jan 1', votes: 250 },
    { date: 'Jan 5', votes: 320 },
    { date: 'Jan 10', votes: 450 },
    { date: 'Jan 15', votes: 580 },
    { date: 'Jan 20', votes: 720 },
    { date: 'Jan 25', votes: 856 },
  ];

  const revenueTrend = [
    { date: 'Jan 1', revenue: 850 },
    { date: 'Jan 5', revenue: 1100 },
    { date: 'Jan 10', revenue: 1450 },
    { date: 'Jan 15', revenue: 1800 },
    { date: 'Jan 20', revenue: 2100 },
    { date: 'Jan 25', revenue: 1428 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
          </div>
          <UserNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`${
                timeRange === range
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Last {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-1">{analyticsData.users.total.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-2">{analyticsData.users.new} new this period</p>
                </div>
                <Users className="w-8 h-8 text-blue-400 opacity-20" />
              </div>
              <div className="flex items-center gap-2 mt-4 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">{analyticsData.users.trend}% increase</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Votes</p>
                  <p className="text-3xl font-bold text-white mt-1">{analyticsData.votes.total.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-2">{analyticsData.votes.daily} votes today</p>
                </div>
                <Vote className="w-8 h-8 text-purple-400 opacity-20" />
              </div>
              <div className="flex items-center gap-2 mt-4 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">{analyticsData.votes.trend}% increase</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white mt-1">${analyticsData.revenue.total.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-2">${analyticsData.revenue.daily.toLocaleString()} today</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400 opacity-20" />
              </div>
              <div className="flex items-center gap-2 mt-4 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">{analyticsData.revenue.trend}% increase</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div>
                <p className="text-slate-400 text-sm">Contests</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">{analyticsData.contests.active}</span>
                    <span className="text-slate-400 text-sm">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">{analyticsData.contests.completed}</span>
                    <span className="text-slate-400 text-sm">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">{analyticsData.contests.total}</span>
                    <span className="text-slate-400 text-sm">Total</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Distribution */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">User Distribution by Role</CardTitle>
              <CardDescription className="text-slate-400">Breakdown of active users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.map((role) => (
                  <div key={role.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{role.name}</span>
                      <span className="text-slate-400 text-sm">{role.count} users ({role.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${role.percentage * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Votes Trend */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Votes Trend</CardTitle>
              <CardDescription className="text-slate-400">Daily vote activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {votesTrend.map((data, idx) => {
                  const maxVotes = Math.max(...votesTrend.map((v) => v.votes));
                  const percentage = (data.votes / maxVotes) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{data.date}</span>
                        <span className="text-slate-400 text-sm">{data.votes} votes</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Revenue Trend</CardTitle>
              <CardDescription className="text-slate-400">Daily revenue tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueTrend.map((data, idx) => {
                  const maxRevenue = Math.max(...revenueTrend.map((v) => v.revenue));
                  const percentage = (data.revenue / maxRevenue) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{data.date}</span>
                        <span className="text-slate-400 text-sm">${data.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Top Contestants</CardTitle>
              <CardDescription className="text-slate-400">By vote count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Maria Garcia', votes: 1248, trend: 15 },
                  { name: 'John Contestant', votes: 1105, trend: 8 },
                  { name: 'Alex Chen', votes: 987, trend: -3 },
                  { name: 'Sarah Johnson', votes: 765, trend: 22 },
                ].map((contestant, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{contestant.name}</p>
                      <p className="text-slate-400 text-sm">{contestant.votes} votes</p>
                    </div>
                    <div className={`flex items-center gap-1 ${contestant.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {contestant.trend >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">{Math.abs(contestant.trend)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Section */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Export Data</CardTitle>
            <CardDescription className="text-slate-400">Download analytics reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Export as CSV
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Export as PDF
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Export as JSON
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Schedule Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRouteWrapper requiredRole="admin">
      <AnalyticsContent />
    </ProtectedRouteWrapper>
  );
}
