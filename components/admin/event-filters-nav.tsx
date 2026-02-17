'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FilterTab = 'all' | 'active' | 'upcoming' | 'closed';

interface EventFiltersNavProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

export function EventFiltersNav({ activeTab, onTabChange }: EventFiltersNavProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as FilterTab)}>
      <TabsList className="grid w-full grid-cols-4 max-w-md">
        <TabsTrigger value="all" className="text-sm">
          All
        </TabsTrigger>
        <TabsTrigger value="active" className="text-sm">
          Active
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="text-sm">
          Upcoming
        </TabsTrigger>
        <TabsTrigger value="closed" className="text-sm">
          Closed
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
