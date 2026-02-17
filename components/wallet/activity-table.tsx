import { Badge } from '@/components/ui/badge';
import type { VoteActivity } from '@/types/wallet';

interface ActivityTableProps {
  activities: VoteActivity[];
  isLoading?: boolean;
}

export function ActivityTable({ activities, isLoading }: ActivityTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVoteTypeColor = (type: string) => {
    switch (type) {
      case 'FREE':
        return 'bg-emerald-100 text-emerald-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-600">No voting activity yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Contestant</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(activity.date)}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{activity.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{activity.contestant}</td>
                <td className="px-6 py-4">
                  <Badge className={getVoteTypeColor(activity.voteType)}>{activity.voteType}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
