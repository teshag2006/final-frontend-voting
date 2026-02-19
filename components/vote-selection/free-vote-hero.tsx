'use client';

import { CheckCircle2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VoteEligibility } from '@/types/vote';
import Image from 'next/image';

interface FreeVoteHeroProps {
  eligibility?: VoteEligibility;
  onClaim: () => void;
  isLoading?: boolean;
  contestantImage?: string;
}

export function FreeVoteHero({
  eligibility,
  onClaim,
  isLoading = false,
  contestantImage,
}: FreeVoteHeroProps) {
  if (!eligibility) {
    return null;
  }

  const canClaim = eligibility.freeEligible && !eligibility.freeUsed;

  if (!eligibility.freeEligible) {
    return null;
  }

  return (
    <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 md:p-12 shadow-2xl'>
      {/* Animated background elements */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-0 -right-20 h-40 w-40 rounded-full bg-white blur-3xl' />
        <div className='absolute bottom-0 -left-20 h-40 w-40 rounded-full bg-white blur-3xl' />
      </div>

      <div className='relative z-10'>
        <div className='grid md:grid-cols-2 gap-8 items-center'>
          {/* Left side - Content */}
          <div className='space-y-6'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-white'>
              <Gift className='h-4 w-4' />
              <span className='text-sm font-semibold'>Limited Time Offer</span>
            </div>

            {/* Main heading */}
            <div className='space-y-3'>
              <h2 className='text-4xl md:text-5xl font-black text-white leading-tight'>
                Your Free Vote Awaits
              </h2>
              <p className='text-lg text-white/90'>
                Ethiopian voters get one free vote per event. Verify your phone number to claim yours now.
              </p>
            </div>

            {/* Features */}
            <div className='space-y-3 pt-4'>
              {[
                'Instant verification via SMS',
                'Recorded on blockchain',
                'Non-refundable & final',
              ].map((feature, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <CheckCircle2 className='h-5 w-5 text-white flex-shrink-0' />
                  <span className='text-white/95'>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            {canClaim ? (
              <Button
                onClick={onClaim}
                disabled={isLoading}
                size='lg'
                className='bg-white text-emerald-600 hover:bg-white/95 font-bold text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all active:scale-95'
              >
                {isLoading ? 'Opening verification...' : 'Claim Your Free Vote'}
              </Button>
            ) : (
              <div className='rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4 text-white text-sm'>
                Your free vote has already been used for this event.
              </div>
            )}
          </div>

          {/* Right side - Illustration/Hero image */}
          <div className='hidden md:flex items-center justify-center'>
            <div className='relative w-full max-w-sm aspect-square'>
              {/* Decorative circles */}
              <div className='absolute inset-0 rounded-full bg-white/10 blur-2xl' />
              <div className='absolute inset-4 rounded-full border-2 border-white/20' />
              <div className='absolute inset-8 rounded-full border-2 border-white/10' />

              {/* Gift icon */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-white/80'>
                  <Gift className='h-32 w-32 stroke-1' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
