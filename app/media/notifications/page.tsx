'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Info, TrendingUp, Trash2 } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'blockchain',
    title: 'Batch Anchored Successfully',
    description: 'BATCH-0034521 with 12,450 votes has been anchored to blockchain',
    time: '5 mins ago',
    icon: CheckCircle2,
    color: 'emerald',
  },
  {
    id: 2,
    type: 'fraud',
    title: 'High Fraud Activity Detected',
    description: 'Unusual voting pattern detected in Nigeria region (27 flags today)',
    time: '2 hours ago',
    icon: AlertCircle,
    color: 'red',
  },
  {
    id: 3,
    type: 'leaderboard',
    title: 'Leaderboard Updated',
    description: 'Top 10 contestant rankings updated. Selam M leads with 57,000 votes',
    time: '1 hour ago',
    icon: TrendingUp,
    color: 'blue',
  },
  {
    id: 4,
    type: 'system',
    title: 'System Status: Excellent',
    description: 'All systems operational. Last fraud scan: 5 mins ago',
    time: '3 hours ago',
    icon: Info,
    color: 'slate',
  },
  {
    id: 5,
    type: 'export',
    title: 'Export Ready',
    description: 'Your leaderboard CSV export is ready for download',
    time: '1 day ago',
    icon: CheckCircle2,
    color: 'emerald',
  },
];

export default function MediaNotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'blockchain' | 'fraud' | 'leaderboard' | 'system' | 'export'>('all');
  const [notifications, setNotifications] = useState(
    mockNotifications.map((item) => ({ ...item, read: false }))
  );

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; badge: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
      red: { bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
      slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-400' },
    };
    return colors[color] || colors.slate;
  };
  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((item) => item.type === filter);
  }, [filter, notifications]);

  return (
      <main className="space-y-6 px-4 py-8 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-slate-400">System alerts and updates</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700"
            onClick={() =>
              setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
            }
          >
            Mark all as read
          </Button>
        </div>

        {/* Notification Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { label: 'All', value: 'all' as const },
            { label: 'Blockchain', value: 'blockchain' as const },
            { label: 'Fraud', value: 'fraud' as const },
            { label: 'Leaderboard', value: 'leaderboard' as const },
            { label: 'System', value: 'system' as const },
            { label: 'Export', value: 'export' as const },
          ].map((item) => (
            <Button
              key={item.label}
              variant={filter === item.value ? 'default' : 'outline'}
              size="sm"
              className={filter === item.value ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-700'}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const Icon = notif.icon;
            const colors = getColorClasses(notif.color);

            return (
              <Card key={notif.id} className="border-0 bg-slate-950 shadow-lg p-4 hover:bg-slate-900 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`rounded-lg ${colors.bg} p-3 flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{notif.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{notif.description}</p>
                      </div>
                      <Badge className={colors.badge}>
                        {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <p className="text-slate-500">{notif.time}</p>
                      <span className={notif.read ? 'text-slate-500' : 'text-blue-400'}>{notif.read ? 'Read' : 'New'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 flex-shrink-0"
                    onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== notif.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        {filteredNotifications.length === 0 ? (
          <Card className="border-0 bg-slate-900 p-6 text-center text-sm text-slate-400">
            No notifications in this filter.
          </Card>
        ) : null}

        {/* Empty State CTA */}
        <Card className="border-0 bg-slate-900 p-6 shadow-lg text-center">
          <p className="text-sm text-slate-400">
            You're all caught up! New notifications will appear here.
          </p>
        </Card>
      </main>
  );
}



