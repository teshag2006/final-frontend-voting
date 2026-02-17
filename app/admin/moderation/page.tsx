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
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  Flag,
  Clock,
  User,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'content' | 'user' | 'report';
  title: string;
  description: string;
  reporter?: string;
  reportedItem?: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  daysOld: number;
}

function ModerationContent() {
  const { user: currentUser, hasRole } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);

  const moderationItems: ModerationItem[] = [
    {
      id: '1',
      type: 'content',
      title: 'Inappropriate Event Description',
      description: 'Spring Talent Show - Event contains potentially offensive language',
      reason: 'Inappropriate content',
      severity: 'high',
      status: 'pending',
      createdAt: '2 hours ago',
      daysOld: 0,
    },
    {
      id: '2',
      type: 'user',
      title: 'Suspicious User Activity',
      description: 'User "John Doe" created 5 accounts within 1 hour',
      reporter: 'System',
      reportedItem: 'john_doe_123',
      reason: 'Potential fraud/spam',
      severity: 'high',
      status: 'pending',
      createdAt: '1 hour ago',
      daysOld: 0,
    },
    {
      id: '3',
      type: 'report',
      title: 'User Report: Harassment',
      description: 'User reported being harassed by another contestant',
      reporter: 'Emma Wilson',
      reportedItem: 'maria_garcia_001',
      reason: 'User harassment/bullying',
      severity: 'high',
      status: 'pending',
      createdAt: '30 minutes ago',
      daysOld: 0,
    },
    {
      id: '4',
      type: 'content',
      title: 'Spam Contest Description',
      description: 'Event contains excessive external links and promotional content',
      reason: 'Spam/promotional content',
      severity: 'medium',
      status: 'pending',
      createdAt: '45 minutes ago',
      daysOld: 0,
    },
    {
      id: '5',
      type: 'user',
      title: 'Unverified Contestant Profile',
      description: 'Contestant profile missing required verification documents',
      reporter: 'System',
      reportedItem: 'contestant_002',
      reason: 'Incomplete verification',
      severity: 'medium',
      status: 'pending',
      createdAt: '2 hours ago',
      daysOld: 0,
    },
  ];

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

  const filteredItems = moderationItems.filter((item) => item.status === activeTab);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-950 border-red-700 text-red-300';
      case 'medium':
        return 'bg-yellow-950 border-yellow-700 text-yellow-300';
      case 'low':
        return 'bg-blue-950 border-blue-700 text-blue-300';
      default:
        return 'bg-slate-700 border-slate-600 text-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <FileText className="w-5 h-5" />;
      case 'user':
        return <User className="w-5 h-5" />;
      case 'report':
        return <Flag className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Moderation Queue</h1>
          <UserNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">
                    {moderationItems.filter((i) => i.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Approved</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">
                    {moderationItems.filter((i) => i.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Rejected</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">
                    {moderationItems.filter((i) => i.status === 'rejected').length}
                  </p>
                </div>
                <X className="w-8 h-8 text-red-400 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 mb-6">
          {(['pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({moderationItems.filter((i) => i.status === tab).length})
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredItems.length === 0 ? (
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white">No items to review</h3>
                  <p className="text-slate-400 mt-1">Great job! All items have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={`border-slate-700 bg-slate-800 cursor-pointer hover:border-blue-600 transition ${
                    selectedItem?.id === item.id ? 'border-blue-600' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {/* Type Icon */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-700">
                          <div className="text-blue-400">{getTypeIcon(item.type)}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{item.title}</h3>
                            <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getSeverityColor(item.severity)}`}>
                                {item.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-500">{item.createdAt}</span>
                            </div>
                          </div>
                          <Eye className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Details Panel */}
          {selectedItem ? (
            <Card className="border-slate-700 bg-slate-800 h-fit sticky top-20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Review Item</CardTitle>
                <CardDescription className="text-slate-400">ID: {selectedItem.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Item Details */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Title</label>
                  <p className="text-white">{selectedItem.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                  <p className="text-slate-300 text-sm">{selectedItem.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Reason</label>
                  <p className="text-slate-300 text-sm">{selectedItem.reason}</p>
                </div>

                {selectedItem.reporter && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Reporter</label>
                    <p className="text-slate-300 text-sm">{selectedItem.reporter}</p>
                  </div>
                )}

                {selectedItem.reportedItem && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Reported Item</label>
                    <p className="text-slate-300 text-sm">{selectedItem.reportedItem}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Severity</label>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${getSeverityColor(selectedItem.severity)}`}>
                    {selectedItem.severity.toUpperCase()}
                  </span>
                </div>

                {/* Actions */}
                {selectedItem.status === 'pending' && (
                  <div className="border-t border-slate-700 pt-6 space-y-2">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}

                {selectedItem.status !== 'pending' && (
                  <div className="border-t border-slate-700 pt-6">
                    <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                      <p className="text-sm text-slate-400">
                        Status: <span className="font-semibold text-white capitalize">{selectedItem.status}</span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-700 bg-slate-800 h-fit sticky top-20">
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Select an item to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ModerationPage() {
  return (
    <ProtectedRouteWrapper requiredRole="admin">
      <ModerationContent />
    </ProtectedRouteWrapper>
  );
}
