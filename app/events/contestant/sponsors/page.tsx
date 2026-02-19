import type { Metadata } from 'next';
import { getSponsorsData } from '@/lib/api';
import { mockSponsorsData } from '@/lib/dashboard-mock';
import { Eye, MousePointer, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sponsors | Contestant Portal',
  description: 'Track sponsor visibility and engagement',
};

export default async function SponsorsPage() {
  const apiSponsors = await getSponsorsData();
  const sponsors = (apiSponsors || mockSponsorsData).filter(
    (sponsor) => sponsor.approved !== false && sponsor.placement_status !== 'ended'
  );

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Sponsor Visibility</h1>
        <p className="text-muted-foreground">Read-only view of sponsor placements and engagement metrics.</p>
      </div>

      {/* Sponsors List */}
      {!sponsors || sponsors.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-12 text-center">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground mb-1">No sponsors yet</p>
          <p className="text-muted-foreground">
            Sponsor placements will appear here when assigned by the event organizers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {sponsor.sponsor_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Campaign: {sponsor.campaign_period}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placement: {sponsor.placement_slot || 'profile'} • Status: {sponsor.placement_status || 'active'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {sponsor.approved === false ? 'Pending' : 'Approved'}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                    <p className="text-lg font-semibold text-foreground">
                      {sponsor.impressions.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <MousePointer className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                    <p className="text-lg font-semibold text-foreground">
                      {sponsor.engagement_metrics.toLocaleString()}
                    </p>
                  </div>
                </div>

                {sponsor.click_through_rate && (
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="w-5 h-5" />
                    <div>
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="text-lg font-semibold text-foreground">
                        {sponsor.click_through_rate.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Sponsor Placements</h3>
        <p className="text-sm text-blue-800">
          Sponsor placements are assigned by the event organizers and are displayed on your contestant profile
          page. Engagement metrics help you understand how sponsors' content performs with your audience.
        </p>
      </div>
    </div>
  );
}
