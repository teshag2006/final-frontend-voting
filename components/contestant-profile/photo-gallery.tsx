"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { useState, useCallback } from "react";

interface PhotoGalleryProps {
  photos: string[];
  contestantName: string;
}

export function PhotoGallery({ photos, contestantName }: PhotoGalleryProps) {
  const [page, setPage] = useState(0);
  const photosPerPage = 5;
  const totalPages = Math.ceil(photos.length / photosPerPage);

  const currentPhotos = photos.slice(
    page * photosPerPage,
    (page + 1) * photosPerPage
  );

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
  }, []);

  if (photos.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          Photo Gallery
        </h2>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <PlusCircle className="h-3.5 w-3.5" />
          Win Introduction
        </button>
      </div>

      <div className="relative">
        {/* Photo grid */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {currentPhotos.map((photo, idx) => (
            <div
              key={`${page}-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border cursor-pointer"
            >
              <Image
                src={photo}
                alt={`${contestantName} gallery photo ${page * photosPerPage + idx + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {totalPages > 1 && (
          <>
            <button
              onClick={prevPage}
              disabled={page === 0}
              className="absolute -left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-md text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous photos"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextPage}
              disabled={page === totalPages - 1}
              className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-md text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next photos"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
