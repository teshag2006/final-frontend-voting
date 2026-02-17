'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SortFilterControlsProps {
  categoryId: string;
  countries: string[];
  currentSort?: string;
  currentCountry?: string;
  totalContestants: number;
}

export function SortFilterControls({
  categoryId,
  countries,
  currentSort = 'total_votes',
  currentCountry,
  totalContestants,
}: SortFilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const sortOptions = [
    { value: 'total_votes', label: 'Most Voted' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'recent', label: 'Recently Added' },
  ];

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    params.delete('page');
    router.push(`/category/${categoryId}?${params.toString()}`);
  };

  const handleCountryChange = (country: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (country) {
      params.set('country', country);
    } else {
      params.delete('country');
    }
    params.delete('page');
    router.push(`/category/${categoryId}?${params.toString()}`);
    setIsCountryOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side - Info */}
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">
          {totalContestants} <span className="text-muted-foreground">Contestants</span>
        </p>
      </div>

      {/* Right side - Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              const next = sortOptions.find((opt) => opt.value !== currentSort);
              if (next) handleSortChange(next.value);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary hover:border-accent/30 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:scale-95"
          >
            <span>Sort: {sortOptions.find((opt) => opt.value === currentSort)?.label}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Country Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary hover:border-accent/30 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:scale-95"
          >
            <span>Country: {currentCountry || 'All'}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Dropdown Menu */}
          {isCountryOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-md border border-border bg-white shadow-md">
              <div className="max-h-60 overflow-y-auto p-2">
                {/* All option */}
                <button
                  onClick={() => handleCountryChange(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    !currentCountry
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  All Countries
                </button>

                {/* Country options */}
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountryChange(country)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentCountry === country
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
