"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, PlusCircle, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface PhotoGalleryProps {
  photos: string[];
  contestantName: string;
}

export function PhotoGallery({ photos, contestantName }: PhotoGalleryProps) {
  const [page, setPage] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const photosPerPage = 6;
  const totalPages = Math.ceil(photos.length / photosPerPage);

  const currentPhotos = photos.slice(
    page * photosPerPage,
    (page + 1) * photosPerPage
  );

  const nextPage = useCallback(() => {
    setPage((value) => Math.min(value + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((value) => Math.max(value - 1, 0));
  }, []);

  useEffect(() => {
    if (zoomIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomIndex(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomIndex]);

  if (photos.length === 0) return null;

  return (
    <section className="rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_20px_45px_-30px_rgba(37,53,118,0.45)] backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Photo Gallery</h2>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/75 px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <PlusCircle className="h-3.5 w-3.5" />
          Win Introduction
        </button>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {currentPhotos.map((photo, idx) => {
            const globalIndex = page * photosPerPage + idx;
            return (
              <button
                key={`${page}-${idx}`}
                type="button"
                onClick={() => setZoomIndex(globalIndex)}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border/80 bg-secondary/40 text-left"
              >
                <Image
                  src={photo}
                  alt={`${contestantName} gallery photo ${globalIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 1024px) 48vw, 28vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              </button>
            );
          })}
        </div>

        {totalPages > 1 && (
          <>
            <button
              onClick={prevPage}
              disabled={page === 0}
              className="absolute -left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous photos"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextPage}
              disabled={page === totalPages - 1}
              className="absolute -right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next photos"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {zoomIndex !== null && photos[zoomIndex] && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded gallery image"
          onClick={() => setZoomIndex(null)}
        >
          <button
            type="button"
            onClick={() => setZoomIndex(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
            aria-label="Close zoomed image"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-[80vh] w-full max-w-5xl overflow-hidden rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={photos[zoomIndex]}
              alt={`${contestantName} gallery photo ${zoomIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
}
