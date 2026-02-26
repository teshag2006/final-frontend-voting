'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SponsorShowcaseItem {
  id: string;
  name: string;
  logoUrl: string;
  href: string;
  fitLabel: string;
}

export function CategorySponsorShowcase({
  categoryName,
  items,
}: {
  categoryName: string;
  items: SponsorShowcaseItem[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;
  const current = items[index];

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Category Sponsor Showcase</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold">{current.name}</h3>
          <p className="mt-1 text-sm text-slate-200">
            Supporting <span className="font-semibold">{categoryName}</span> category
          </p>
          <p className="mt-1 text-xs text-slate-300">{current.fitLabel}</p>
          <div className="mt-3">
            <Link
              href={current.href}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              View Sponsor
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 hover:bg-white/20"
            aria-label="Previous sponsor"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % items.length)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 hover:bg-white/20"
            aria-label="Next sponsor"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="relative h-14 w-28 overflow-hidden rounded-md bg-white p-1">
          <Image src={current.logoUrl} alt={current.name} fill className="object-contain p-1" sizes="112px" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={`h-2.5 w-2.5 rounded-full ${
                itemIndex === index ? 'bg-white' : 'bg-white/35'
              }`}
              aria-label={`Go to ${item.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

