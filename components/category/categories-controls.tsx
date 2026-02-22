'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CategoriesControlsProps {
  eventSlug: string;
  currentSort: 'votes_desc' | 'votes_asc';
  currentCategorySlug: string;
  currentCountry: string;
  currentSearch: string;
  categories: Array<{ slug: string; name: string }>;
  countryOptions: string[];
}

export function CategoriesControls({
  eventSlug,
  currentSort,
  currentCategorySlug,
  currentCountry,
  currentSearch,
  categories,
  countryOptions,
}: CategoriesControlsProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);

  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const updateQuery = (patch: Partial<{ sort: string; category: string; country: string; q: string }>) => {
    const params = new URLSearchParams();
    const nextSort = patch.sort ?? currentSort;
    const nextCategory = patch.category ?? currentCategorySlug;
    const nextCountry = patch.country ?? currentCountry;
    const nextSearch = patch.q ?? currentSearch;

    if (nextSort !== 'votes_desc') params.set('sort', nextSort);
    if (nextCategory !== 'all') params.set('category', nextCategory);
    if (nextCountry !== 'all') params.set('country', nextCountry);
    if (String(nextSearch || '').trim()) params.set('q', String(nextSearch).trim());

    const query = params.toString();
    router.push(`/events/${eventSlug}/categories${query ? `?${query}` : ''}`);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search === currentSearch) return;
      updateQuery({ q: search });
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, currentSearch]);

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <label htmlFor="sort" className="text-sm font-medium text-slate-600">Sort By</label>
        <select
          id="sort"
          value={currentSort}
          onChange={(event) => updateQuery({ sort: event.target.value })}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none"
        >
          <option value="votes_desc">Most Voted</option>
          <option value="votes_asc">Least Voted</option>
        </select>
      </div>

      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <label htmlFor="category" className="text-sm font-medium text-slate-600">Category</label>
        <select
          id="category"
          value={currentCategorySlug}
          onChange={(event) => updateQuery({ category: event.target.value })}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <label htmlFor="country" className="text-sm font-medium text-slate-600">Country</label>
        <select
          id="country"
          value={currentCountry}
          onChange={(event) => updateQuery({ country: event.target.value })}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none"
        >
          <option value="all">All Countries</option>
          {countryOptions.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
        <Search className="h-4 w-4" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Global search in event..."
          className="w-56 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
