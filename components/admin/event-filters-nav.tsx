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
      <TabsList className="flex w-full max-w-md flex-nowrap gap-1 overflow-x-auto">
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
