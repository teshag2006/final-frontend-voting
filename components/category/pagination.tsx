"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  className,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showEllipsisLeft = currentPage > 3;
  const showEllipsisRight = currentPage < totalPages - 2;

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    url.searchParams.set("page", String(page));
    return url.pathname + url.search;
  };

  return (
    <div
      className={cn(
        "mt-8 flex items-center justify-center gap-2",
        className
      )}
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {/* First pages */}
        {pages.slice(0, Math.min(3, pages.length)).map((page) => (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-foreground text-card"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            )}
          >
            {page}
          </Link>
        ))}

        {/* Ellipsis Left */}
        {showEllipsisLeft && (
          <span className="text-muted-foreground">...</span>
        )}

        {/* Middle pages */}
        {showEllipsisLeft &&
          showEllipsisRight &&
          pages
            .slice(currentPage - 2, currentPage + 1)
            .map((page) => (
              <Link
                key={page}
                href={getPageUrl(page)}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-foreground text-card"
                    : "border border-border bg-card text-foreground hover:bg-secondary"
                )}
              >
                {page}
              </Link>
            ))}

        {/* Ellipsis Right */}
        {showEllipsisRight && (
          <span className="text-muted-foreground">...</span>
        )}

        {/* Last pages */}
        {pages.slice(Math.max(3, totalPages - 2)).map((page) => (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-foreground text-card"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            )}
          >
            {page}
          </Link>
        ))}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
