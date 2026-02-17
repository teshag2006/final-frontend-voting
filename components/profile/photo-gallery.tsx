'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  url: string;
  alt: string;
  uploadedAt: string;
  featured?: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  title?: string;
  onFeaturePhoto?: (photoId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function PhotoGallery({
  photos,
  title = 'Photo Gallery',
  onFeaturePhoto,
  isLoading = false,
  emptyMessage = 'No photos uploaded yet',
}: PhotoGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [photos]);

  const handlePrevious = () => {
    setSelectedPhotoIndex((prev) =>
      prev === null ? null : prev === 0 ? sortedPhotos.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedPhotoIndex((prev) =>
      prev === null ? null : prev === sortedPhotos.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading photos...</div>
        ) : sortedPhotos.length === 0 ? (
          <div className="py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedPhotos.map((photo, index) => (
                <Dialog key={photo.id}>
                  <DialogTrigger asChild>
                    <div
                      className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                      onClick={() => setSelectedPhotoIndex(index)}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />

                      {/* Featured Badge */}
                      {photo.featured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                          Featured
                        </Badge>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevious();
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-white text-sm font-medium">
                          {index + 1}/{sortedPhotos.length}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 bg-black border-0">
                    {selectedPhotoIndex !== null && (
                      <div className="relative aspect-video">
                        <Image
                          src={sortedPhotos[selectedPhotoIndex].url}
                          alt={sortedPhotos[selectedPhotoIndex].alt}
                          fill
                          className="object-contain"
                        />

                        {/* Navigation */}
                        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={handlePrevious}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-white text-sm font-medium">
                            {selectedPhotoIndex + 1}/{sortedPhotos.length}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={handleNext}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Close Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-4 right-4 text-white hover:bg-white/20"
                          onClick={() => setSelectedPhotoIndex(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        {/* Photo Info */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                          <p className="font-medium">{sortedPhotos[selectedPhotoIndex].alt}</p>
                          <p className="text-xs text-gray-300">
                            {new Date(sortedPhotos[selectedPhotoIndex].uploadedAt).toLocaleDateString()}
                          </p>
                          {onFeaturePhoto && !sortedPhotos[selectedPhotoIndex].featured && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 text-white border-white"
                              onClick={() => onFeaturePhoto(sortedPhotos[selectedPhotoIndex].id)}
                            >
                              Make Featured
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Photos</p>
                <p className="text-2xl font-bold">{sortedPhotos.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{sortedPhotos.filter((p) => p.featured).length}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
