'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  rank?: number;
}

interface ContestantSearchProps {
  categoryId?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function ContestantSearch({
  categoryId,
  onSearch,
  placeholder = 'Search contestants...',
}: ContestantSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        // TODO: Replace with actual API call when backend is ready
        const response = await fetch(
          `/api/contestants/search?q=${encodeURIComponent(query)}&limit=10${
            categoryId ? `&categoryId=${categoryId}` : ''
          }`
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, categoryId]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    handleSearch(result.name);
    // Navigate to contestant or filter results
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', result.name);
    if (categoryId) params.set('category', categoryId);
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-10 pr-10"
          aria-label="Search contestants"
          role="searchbox"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border bg-background shadow-lg">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{result.name}</p>
                      <p className="text-xs text-muted-foreground">{result.category}</p>
                    </div>
                    {result.rank && (
                      <span className="text-xs font-semibold text-primary ml-2">
                        #{result.rank}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No contestants found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
            </div>
          ) : null}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="border-t">
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(search)}
                      className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 transition-colors rounded-full"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
