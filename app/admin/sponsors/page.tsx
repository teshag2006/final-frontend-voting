'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  mockSponsorCampaigns,
  mockSponsorInventory,
  mockSponsorPlacements,
} from '@/lib/sponsorship-mock';

export default function AdminSponsorsPage() {
  const [query, setQuery] = useState('');

  const sponsors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return mockSponsorInventory.filter((sponsor) =>
      sponsor.name.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">Sponsorship Management</p>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Sponsors</h1>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Sponsor
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Sponsors</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{mockSponsorInventory.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {mockSponsorCampaigns.filter((campaign) => campaign.status === 'active').length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Active Placements</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {mockSponsorPlacements.filter((placement) => placement.status === 'active').length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Approval Coverage</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {Math.round(
                (mockSponsorPlacements.filter((placement) => placement.approved).length /
                  Math.max(1, mockSponsorPlacements.length)) *
                  100
              )}
              %
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search sponsor..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Sponsor</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Campaigns</th>
                <th className="px-4 py-3 text-left font-medium">Placements</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((sponsor) => {
                const campaigns = mockSponsorCampaigns.filter((c) => c.sponsorId === sponsor.id);
                const placements = mockSponsorPlacements.filter((p) => p.sponsorId === sponsor.id);
                return (
                  <tr key={sponsor.id || sponsor.name} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-medium text-foreground">{sponsor.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={sponsor.status === 'active' ? 'default' : 'secondary'}>
                        {sponsor.status || 'draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{campaigns.length}</td>
                    <td className="px-4 py-3">{placements.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Assign
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4" />
            Public sponsor display is restricted to approved active placements.
          </div>
        </div>
      </main>
    </div>
  );
}
