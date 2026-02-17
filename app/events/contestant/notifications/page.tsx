import type { Metadata } from 'next';
import { getNotifications } from '@/lib/api';
import { mockNotifications } from '@/lib/dashboard-mock';
import { Bell, Award, TrendingUp, AlertCircle, CheckCircle, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notifications | Contestant Portal',
  description: 'View all notifications and updates',
};

const ICON_MAP: Record<string, React.ReactNode> = {
  milestone: <Award className="w-5 h-5 text-yellow-600" />,
  rank_change: <TrendingUp className="w-5 h-5 text-blue-600" />,
  fraud_review: <AlertCircle className="w-5 h-5 text-red-600" />,
  blockchain: <Lock className="w-5 h-5 text-green-600" />,
  system: <Bell className="w-5 h-5 text-muted-foreground" />,
};

export default async function NotificationsPage() {
  const apiNotifications = await getNotifications();
  const notifications = apiNotifications || mockNotifications;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your contest activity.</p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg border border-border p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground mb-1">No notifications</p>
          <p className="text-muted-foreground">
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Separate read and unread notifications
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your contest activity.</p>
        </div>
        {unreadNotifications.length > 0 && (
          <div className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
            {unreadNotifications.length} New
          </div>
        )}
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            New
          </h2>
          {unreadNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isUnread={true}
              icon={ICON_MAP[notification.type] || ICON_MAP.system}
              formattedDate={formatDate(notification.timestamp)}
            />
          ))}
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Earlier
          </h2>
          {readNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isUnread={false}
              icon={ICON_MAP[notification.type] || ICON_MAP.system}
              formattedDate={formatDate(notification.timestamp)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: {
    id: string;
    title: string;
    message: string;
    read: boolean;
  };
  isUnread: boolean;
  icon: React.ReactNode;
  formattedDate: string;
}

function NotificationCard({
  notification,
  isUnread,
  icon,
  formattedDate,
}: NotificationCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isUnread
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-border hover:bg-secondary/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{notification.title}</h3>
            {isUnread && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>

        {/* Action */}
        <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
          Dismiss
        </button>
      </div>
    </div>
  );
}
