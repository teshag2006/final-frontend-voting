'use client';

import { useNotifications } from './notification-context';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const notificationStyles = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-800',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-800',
    Icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-800',
    Icon: Info,
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    message: 'text-yellow-800',
    Icon: AlertTriangle,
  },
};

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md pointer-events-none">
      {notifications.map((notification) => {
        const style = notificationStyles[notification.type];
        const Icon = style.Icon;

        return (
          <div
            key={notification.id}
            className={cn(
              'pointer-events-auto border rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-right-full',
              style.bg
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', style.icon)} />
            <div className="flex-1 space-y-1">
              <p className={cn('font-semibold text-sm', style.title)}>{notification.title}</p>
              {notification.message && (
                <p className={cn('text-sm', style.message)}>{notification.message}</p>
              )}
              {notification.action && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={notification.action.onClick}
                  className="h-auto p-0 text-xs font-medium"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className={cn('flex-shrink-0 mt-0.5 transition-colors', style.icon, 'hover:opacity-70')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
