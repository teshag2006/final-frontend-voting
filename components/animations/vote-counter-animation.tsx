'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VoteCounterAnimationProps {
  count: number;
  previousCount?: number;
  showAnimation?: boolean;
  duration?: number; // animation duration in ms
  format?: (num: number) => string;
  className?: string;
}

/**
 * Animated vote counter that shows changes with smooth transitions and flash effects
 */
export function VoteCounterAnimation({
  count,
  previousCount,
  showAnimation = true,
  duration = 500,
  format = (num) => num.toLocaleString(),
  className,
}: VoteCounterAnimationProps) {
  const [displayCount, setDisplayCount] = useState(count);
  const [isUpdating, setIsUpdating] = useState(false);
  const [countChange, setCountChange] = useState<number | null>(null);

  useEffect(() => {
    if (previousCount !== undefined && count !== previousCount) {
      const change = count - previousCount;
      setCountChange(change);
      setIsUpdating(true);

      // Reset animation after duration
      const timer = setTimeout(() => {
        setIsUpdating(false);
        setCountChange(null);
      }, duration + 100);

      return () => clearTimeout(timer);
    }

    setDisplayCount(count);
  }, [count, previousCount, duration]);

  // Animated transition for number updates
  useEffect(() => {
    if (!isUpdating) {
      setDisplayCount(count);
      return;
    }

    if (!previousCount || previousCount === count) {
      setDisplayCount(count);
      return;
    }

    const startCount = previousCount;
    const endCount = count;
    const difference = endCount - startCount;
    const steps = Math.min(Math.abs(difference), 30); // Max 30 animation steps
    const stepValue = difference / steps;

    let currentStep = 0;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setDisplayCount(endCount);
        clearInterval(interval);
      } else {
        const newCount = Math.round(startCount + stepValue * currentStep);
        setDisplayCount(newCount);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isUpdating, count, previousCount, duration]);

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Main counter */}
      <div
        className={cn(
          'transition-all',
          isUpdating && 'animate-pulse scale-110',
          countChange && countChange > 0 && 'text-green-600',
          countChange && countChange < 0 && 'text-red-600'
        )}
      >
        {format(displayCount)}
      </div>

      {/* Floating change indicator */}
      {countChange && isUpdating && (
        <div
          className={cn(
            'absolute -top-6 -right-2 text-sm font-bold animate-bounce',
            countChange > 0 ? 'text-green-600' : 'text-red-600'
          )}
        >
          {countChange > 0 ? '+' : ''}{countChange}
        </div>
      )}

      {/* Flash effect on update */}
      {isUpdating && (
        <div
          className="absolute inset-0 rounded-md bg-yellow-200 opacity-30 animate-ping"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}

/**
 * Larger version optimized for hero displays
 */
export function HeroVoteCounter({
  count,
  previousCount,
  label = 'Total Votes',
  showAnimation = true,
  className,
}: Omit<VoteCounterAnimationProps, 'format'> & { label?: string }) {
  return (
    <div className={cn('text-center', className)}>
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <VoteCounterAnimation
        count={count}
        previousCount={previousCount}
        showAnimation={showAnimation}
        format={(num) =>
          num >= 1_000_000
            ? `${(num / 1_000_000).toFixed(1)}M`
            : num >= 1_000
              ? `${(num / 1_000).toFixed(1)}K`
              : num.toString()
        }
        className="text-4xl md:text-5xl font-bold text-foreground"
      />
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function CompactVoteCounter({
  count,
  previousCount,
  className,
}: Pick<VoteCounterAnimationProps, 'count' | 'previousCount' | 'className'>) {
  return (
    <VoteCounterAnimation
      count={count}
      previousCount={previousCount}
      duration={300}
      format={(num) => `${num.toLocaleString()} vote${num !== 1 ? 's' : ''}`}
      className={cn('text-sm font-semibold', className)}
    />
  );
}
