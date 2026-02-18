// @ts-nocheck
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  categoryId: string;
  sort?: string;
  country?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  categoryId,
  sort,
  country,
}: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    if (sort) params.set('sort', sort);
    if (country) params.set('country', country);
    return `/category/${categoryId}?${params.toString()}`;
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const pages = getPaginationRange();

  return (
    <nav
      className="flex items-center justify-center gap-1 py-8"
      aria-label="Pagination Navigation"
    >
      {/* Previous Button */}
      <Link
        href={createPageUrl(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`inline-flex items-center justify-center h-10 w-10 rounded-md border border-border transition-all ${
          currentPage === 1
            ? 'pointer-events-none opacity-50 cursor-not-allowed bg-muted'
            : 'hover:bg-secondary hover:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:scale-95'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-0.5 mx-2">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 py-1 text-muted-foreground text-sm"
              >
                {page}
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Link
              key={page}
              href={createPageUrl(page as number)}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex items-center justify-center h-10 w-10 rounded-md border transition-all text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  : 'border-border hover:bg-secondary hover:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:scale-95'
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      <Link
        href={createPageUrl(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`inline-flex items-center justify-center h-10 w-10 rounded-md border border-border transition-all ${
          currentPage === totalPages
            ? 'pointer-events-none opacity-50 cursor-not-allowed bg-muted'
            : 'hover:bg-secondary hover:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:scale-95'
        }`}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Link>

      {/* Page Info */}
      <span className="ml-4 text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
        <span className="font-medium text-foreground">{totalPages}</span>
      </span>
    </nav>
  );
}


