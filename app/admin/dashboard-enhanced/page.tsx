'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { UserNav } from '@/components/auth/user-nav';
import {
  ArrowLeft,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

function AdminDashboardContent() {
  const { user: currentUser, hasRole } = useAuth();
  const router = useRouter();

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

  // Mock stats
  const stats = {
    totalUsers: 147,
    activeUsers: 89,
    totalVotes: 3542,
    totalRevenue: 28340,
    pendingApprovals: 12,
    reportedContent: 5,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'user_signup',
      description: 'New user registration',
      user: 'Emma Wilson',
      timestamp: '2 minutes ago',
      icon: Users,
    },
    {
      id: '2',
      type: 'vote_cast',
      description: 'Vote recorded',
      user: 'James Smith',
      timestamp: '5 minutes ago',
      icon: CheckCircle,
    },
    {
      id: '3',
      type: 'payment',
      description: 'Payment received',
      user: 'Lisa Anderson',
      timestamp: '12 minutes ago',
      icon: DollarSign,
    },
    {
      id: '4',
      type: 'report',
      description: 'Content reported',
      user: 'System',
      timestamp: '1 hour ago',
      icon: AlertCircle,
    },
    {
      id: '5',
      type: 'contest_created',
      description: 'New contest created',
      user: 'Admin User',
      timestamp: '3 hours ago',
      icon: FileText,
    },
  ];

  const pendingReviews = [
    {
      id: '1',
      type: 'contestant_verification',
      title: 'John Contestant Verification',
      status: 'pending',
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      type: 'content_review',
      title: 'Event Description Review',
      status: 'pending',
      createdAt: '1 day ago',
    },
    {
      id: '3',
      type: 'payment_dispute',
      title: 'Chargeback Case #123',
      status: 'pending',
      createdAt: '2 days ago',
    },
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
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <UserNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome back, {currentUser.name}!</h2>
          <p className="text-slate-400 mt-1">Here's what's happening with your platform today.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{stats.activeUsers}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Votes</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">{stats.totalVotes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">${(stats.totalRevenue / 1000).toFixed(1)}K</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-700/50 bg-red-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">{stats.pendingApprovals}</p>
                </div>
                <Clock className="w-8 h-8 text-red-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-700/50 bg-orange-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Reports</p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">{stats.reportedContent}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-slate-700 bg-slate-800 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Latest platform activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 pb-4 border-b border-slate-700/50 last:border-b-0 last:pb-0"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700">
                            <Icon className="w-5 h-5 text-blue-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">{activity.description}</p>
                          <p className="text-sm text-slate-400 mt-0.5">
                            by {activity.user}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/users">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start gap-2">
                    <Users className="w-4 h-4" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/moderation">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    Moderation Queue
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white justify-start gap-2">
                    System Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pending Reviews */}
            <Card className="border-orange-700/50 bg-orange-950/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Pending Review ({pendingReviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-orange-600/50 transition"
                  >
                    <p className="font-semibold text-white text-sm">{review.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{review.createdAt}</p>
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 text-xs rounded transition flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button className="flex-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs rounded transition flex items-center justify-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                <Link href="/admin/moderation" className="mt-4 block">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    View All Reviews
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Health */}
        <Card className="border-slate-700 bg-slate-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white">System Health</CardTitle>
            <CardDescription className="text-slate-400">
              Platform performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">API Response Time</span>
                  <span className="text-green-400 font-semibold">45ms</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Database Load</span>
                  <span className="text-blue-400 font-semibold">62%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Storage Usage</span>
                  <span className="text-yellow-400 font-semibold">78%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRouteWrapper requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRouteWrapper>
  );
}
