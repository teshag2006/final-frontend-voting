'use client';

export interface PriorityNotification {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  timestamp: string;
}

export function NotificationPriorityList({ items }: { items: PriorityNotification[] }) {
  const groups = {
    high: items.filter((item) => item.priority === 'high'),
    medium: items.filter((item) => item.priority === 'medium'),
    low: items.filter((item) => item.priority === 'low'),
  };

  return (
    <div className="space-y-4">
      {(Object.keys(groups) as Array<keyof typeof groups>).map((priority) => (
        <section key={priority}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{priority} Priority</h2>
          <div className="space-y-2">
            {groups[priority].length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-sm">No items.</div>
            ) : (
              groups[priority].map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.message}</p>
                      <p className="text-xs text-slate-500">{item.timestamp}</p>
                    </div>
                    {!item.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
