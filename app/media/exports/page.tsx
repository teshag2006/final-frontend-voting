import { MediaDashboardHeader } from '@/components/media/dashboard-header';
import { MediaDashboardNav } from '@/components/media/dashboard-nav';
import { ExportCenter } from '@/components/media/export-center';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, CheckCircle2, Clock } from 'lucide-react';

export const metadata = {
  title: 'Exports | Media Dashboard',
  description: 'Manage and download media exports.',
};

const recentExports = [
  {
    id: 1,
    name: 'Leaderboard Export',
    type: 'CSV',
    size: '2.4 MB',
    date: '2 hours ago',
    status: 'completed',
  },
  {
    id: 2,
    name: 'Revenue Summary',
    type: 'PDF',
    size: '1.8 MB',
    date: '5 hours ago',
    status: 'completed',
  },
  {
    id: 3,
    name: 'Fraud Report',
    type: 'PDF',
    size: '3.2 MB',
    date: '1 day ago',
    status: 'completed',
  },
  {
    id: 4,
    name: 'Sponsor Performance',
    type: 'CSV',
    size: '1.1 MB',
    date: '1 day ago',
    status: 'completed',
  },
];

export default function MediaExportsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <MediaDashboardHeader />
      <MediaDashboardNav />

      <main className="space-y-6 px-4 py-8 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Export Center</h1>
          <p className="text-sm text-slate-400">Generate and download aggregated media reports</p>
        </div>

        {/* Export Generator */}
        <section>
          <ExportCenter />
        </section>

        {/* Recent Exports */}
        <Card className="border-0 bg-slate-950 shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="mb-6 text-lg font-semibold text-white">Recent Exports</h3>

            <div className="space-y-3">
              {recentExports.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{exp.name}</p>
                      <p className="text-xs text-slate-400">
                        {exp.size} • {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-slate-800">
                      {exp.type}
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                    <button className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700 transition-colors">
                      <Download className="h-5 w-5 text-slate-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Export History Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total Exports', value: '24', icon: FileText },
            { label: 'This Month', value: '12', icon: Download },
            { label: 'Pending', value: '0', icon: Clock },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-0 bg-slate-900 p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
