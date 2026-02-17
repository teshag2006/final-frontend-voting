'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Share2, MessageCircle, Trophy, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProfileHeroProps {
  name: string;
  category: string;
  photoUrl?: string;
  rank: number;
  voteCount: number;
  percentageToLeader: number;
  bio?: string;
  verified?: boolean;
  onShare?: () => void;
  onMessage?: () => void;
  onVote?: () => void;
  className?: string;
}

export function ProfileHero({
  name,
  category,
  photoUrl,
  rank,
  voteCount,
  percentageToLeader,
  bio,
  verified = false,
  onShare,
  onMessage,
  onVote,
  className,
}: ProfileHeroProps) {
  return (
    <div className={cn('relative w-full overflow-hidden rounded-lg', className)}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background" />

      {/* Content */}
      <div className="relative space-y-6 p-6 md:p-10">
        {/* Top Section: Photo & Basic Info */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="relative">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={name}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center">
                  <Avatar className="w-40 h-40">
                    <AvatarFallback className="text-4xl">
                      {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              {/* Rank Badge */}
              <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-lg px-3 py-1">
                #{rank}
              </Badge>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            {/* Name & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold">{name}</h1>
                {verified && (
                  <Badge variant="secondary" className="ml-2">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{category}</p>
            </div>

            {/* Bio */}
            {bio && <p className="text-base text-foreground max-w-xl">{bio}</p>}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold">{voteCount.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Votes</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">#{rank}</span>
                </div>
                <p className="text-sm text-muted-foreground">Rank</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{percentageToLeader.toFixed(1)}%</span>
                </div>
                <p className="text-sm text-muted-foreground">To Leader</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="lg" onClick={onVote} className="bg-primary hover:bg-primary/90">
                <Heart className="h-4 w-4 mr-2" />
                Vote Now
              </Button>
              <Button variant="outline" size="lg" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="lg" onClick={onMessage}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress to Leader</span>
            <span className="text-sm text-muted-foreground">{percentageToLeader.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary/50 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(percentageToLeader, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
