'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { getEventStatusLabel, getEventStatusClass } from '@/context/EventContext';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const statusLabel = getEventStatusLabel(event.status);
  const statusClass = getEventStatusClass(event.status);
  const isLive = event.status === 'LIVE' || event.status === 'active';

  return (
    <Card className={featured ? 'col-span-full' : 'col-span-1'}>
      <div className={featured ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}>
        {/* Image */}
        <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
          <Image
            src={event.banner_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=400&fit=crop'}
            alt={event.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300 w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={featured}
          />
          <div className="absolute top-4 right-4 z-10">
            <Badge className={statusClass}>{statusLabel}</Badge>
          </div>
          {isLive && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={featured ? '' : 'p-6'}>
          <div className={featured ? 'p-6' : ''}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

            {/* Meta Info */}
            <div className="space-y-3 mb-6">
              {event.tagline && (
                <p className="text-sm italic text-gray-700">{event.tagline}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {event.season_year && <span>{event.season_year} Edition</span>}
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
            </div>

            {/* CTA */}
            <Link href={`/events/${event.slug}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isLive ? 'Vote Now' : event.status === 'UPCOMING' || event.status === 'coming_soon' ? 'View Details' : 'View Results'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
