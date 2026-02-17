'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { UserNav } from '@/components/auth/user-nav';
import { ArrowLeft, Bell, Check, Trash2, Archive } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

function NotificationCenterContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      timestamp: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'New Vote Available',
      message: 'Voting is now open for the Spring Talent Show event.',
      timestamp: '1 hour ago',
      read: false,
      actionUrl: '/events/vote',
      actionLabel: 'Vote Now',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Unusual Login Activity',
      message: 'New login detected from Toronto, Canada using Chrome on MacOS.',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: '4',
      type: 'success',
      title: 'Payment Successful',
      message: 'Your payment of $29.99 has been processed successfully.',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'Event Announcement',
      message: 'The Spring Talent Show finals will be held next Saturday at 8 PM.',
      timestamp: '2 days ago',
      read: true,
    },
    {
      id: '6',
      type: 'success',
      title: 'Email Verified',
      message: 'Your email address has been verified successfully.',
      timestamp: '1 week ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications =
    activeTab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-950 border-green-700 text-green-300';
      case 'error':
        return 'bg-red-950 border-red-700 text-red-300';
      case 'warning':
        return 'bg-yellow-950 border-yellow-700 text-yellow-300';
      case 'info':
      default:
        return 'bg-blue-950 border-blue-700 text-blue-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-sm font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <UserNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Tabs and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Notifications
              <span className="ml-2 text-sm">({notifications.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {displayedNotifications.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-12 pb-12 text-center">
                <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">No notifications</h3>
                <p className="text-slate-400 mt-1">
                  {activeTab === 'unread'
                    ? "You've read all your notifications"
                    : 'You have no notifications yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            displayedNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-slate-700 ${
                  notification.read ? 'bg-slate-800' : 'bg-slate-800 border-l-4 border-l-blue-500'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Type Badge */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${getTypeColor(
                        notification.type
                      )} border`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{notification.title}</h3>
                          <p className="text-slate-400 text-sm mt-1">{notification.message}</p>
                          <p className="text-xs text-slate-500 mt-2">{notification.timestamp}</p>

                          {/* Action Button */}
                          {notification.actionUrl && (
                            <Button
                              onClick={() => router.push(notification.actionUrl!)}
                              size="sm"
                              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {notification.actionLabel || 'View'}
                            </Button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-slate-400 hover:text-blue-400 transition"
                              title="Mark as read"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRouteWrapper>
      <NotificationCenterContent />
    </ProtectedRouteWrapper>
  );
}
