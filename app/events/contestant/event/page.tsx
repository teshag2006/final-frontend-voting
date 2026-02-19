import type { Metadata } from 'next';
import { getEventDetails } from '@/lib/api';
import { mockEventDetails } from '@/lib/dashboard-mock';

export const metadata: Metadata = {
  title: 'Event Details | Contestant Portal',
  description: 'Event information and timeline',
};

function formatDate(input: string) {
  const date = new Date(input);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function EventPage() {
  const eventData = (await getEventDetails()) || mockEventDetails;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Event Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card label="Event Name" value={eventData.event_name} />
        <Card label="Category" value={eventData.category} />
        <Card label="Start Date" value={formatDate(eventData.start_date)} />
        <Card label="End Date" value={formatDate(eventData.end_date)} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm md:col-span-2">
          <p className="text-sm text-blue-700">Voting Deadline</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatDate(eventData.voting_deadline)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Contest Rules</h2>
        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{eventData.rules_summary}</p>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
