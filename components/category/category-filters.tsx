"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFiltersProps {
  categoryId: string;
  defaultSort?: "total_votes" | "created_at" | "full_name";
  defaultCountry?: string;
  countries?: string[];
}

export function CategoryFilters({
  categoryId,
  defaultSort = "total_votes",
  defaultCountry = "all",
  countries = [],
}: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState(defaultSort);
  const [country, setCountry] = useState(defaultCountry);

  const handleSortChange = (newSort: string) => {
    setSort(newSort as typeof defaultSort);
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    params.set("page", "1");
    router.push(`/category/${categoryId}?${params.toString()}`);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const params = new URLSearchParams(searchParams);
    if (newCountry === "all") {
      params.delete("country");
    } else {
      params.set("country", newCountry);
    }
    params.set("page", "1");
    router.push(`/category/${categoryId}?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Sort */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <label className="text-sm font-semibold text-foreground">Sort By:</label>
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-40 gap-2 border-border">
            <SelectValue />
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total_votes">Most Votes</SelectItem>
            <SelectItem value="created_at">Newest</SelectItem>
            <SelectItem value="full_name">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Country Filter */}
      {countries.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-foreground">
            Country:
          </label>
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-40 gap-2 border-border">
              <SelectValue />
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
