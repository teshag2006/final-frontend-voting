import type { Metadata } from 'next';
import { getContestantPriorityNotifications, getNotifications } from '@/lib/api';
import { mockNotifications } from '@/lib/dashboard-mock';
import { NotificationPriorityList } from '@/components/dashboard/notification-priority-list';

export const metadata: Metadata = {
  title: 'Notifications | Contestant Portal',
  description: 'View all notifications and updates',
};

export default async function NotificationsPage() {
  const notifications = (await getNotifications()) || mockNotifications;
  const priorityNotifications = (await getContestantPriorityNotifications()) || [];
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-800">Notifications</h1>
        <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white">
          {unread.length} New
        </span>
      </div>

      <Section title="New" items={unread} />
      <Section title="Earlier" items={read} className="mt-4" />

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Priority Inbox</h2>
        <NotificationPriorityList items={priorityNotifications} />
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  className = '',
}: {
  title: string;
  items: any[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            No notifications.
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{item.timestamp}</p>
              </div>
              {!item.read && <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
