'use client';

import { DollarSign, Zap, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VoteEligibility } from '@/types/vote';

interface PaidVoteHeroProps {
  eligibility: VoteEligibility;
  onProceed: () => void;
  isLoading?: boolean;
  pricePerVote?: number;
}

export function PaidVoteHero({
  eligibility,
  onProceed,
  isLoading = false,
  pricePerVote = 1.0,
}: PaidVoteHeroProps) {
  const maxVotes = Math.min(
    eligibility.maxPerTransaction,
    eligibility.paidVotesRemaining,
    eligibility.dailyVotesRemaining
  );

  return (
    <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-8 md:p-12 shadow-2xl'>
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
              <Zap className='h-4 w-4' />
              <span className='text-sm font-semibold'>Unlimited Votes</span>
            </div>

            {/* Main heading */}
            <div className='space-y-3'>
              <h2 className='text-4xl md:text-5xl font-black text-white leading-tight'>
                Boost Your Support
              </h2>
              <p className='text-lg text-white/90'>
                Want to show extra support? Purchase votes at just ${pricePerVote} each. No limits, instant delivery.
              </p>
            </div>

            {/* Pricing highlight */}
            <div className='rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-white/80 text-sm'>Price per vote</span>
                <span className='text-3xl font-bold text-white'>${pricePerVote}</span>
              </div>
              <div className='border-t border-white/20 pt-4 space-y-2'>
                <div className='flex items-center justify-between text-sm text-white/80'>
                  <span>Max per transaction:</span>
                  <span className='font-semibold text-white'>{eligibility.maxPerTransaction}</span>
                </div>
                <div className='flex items-center justify-between text-sm text-white/80'>
                  <span>Available today:</span>
                  <span className='font-semibold text-white'>{eligibility.dailyVotesRemaining}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={onProceed}
              disabled={isLoading || maxVotes === 0}
              size='lg'
              className='w-full bg-white text-purple-600 hover:bg-white/95 font-bold text-lg h-14 shadow-lg hover:shadow-xl transition-all active:scale-95'
            >
              {isLoading ? (
                'Processing...'
              ) : maxVotes === 0 ? (
                'Daily limit reached'
              ) : (
                <>
                  <DollarSign className='h-5 w-5 mr-2' />
                  Proceed to Checkout
                </>
              )}
            </Button>

            {/* Security note */}
            <p className='text-xs text-white/70 text-center'>
              All transactions are secured and recorded on blockchain
            </p>
          </div>

          {/* Right side - Illustration */}
          <div className='hidden md:flex items-center justify-center'>
            <div className='relative w-full max-w-sm aspect-square'>
              {/* Decorative circles */}
              <div className='absolute inset-0 rounded-full bg-white/10 blur-2xl' />
              <div className='absolute inset-4 rounded-full border-2 border-white/20' />
              <div className='absolute inset-8 rounded-full border-2 border-white/10' />

              {/* Money/Payment icon */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-white/80 space-y-4'>
                  <Banknote className='h-32 w-32 stroke-1 mx-auto' />
                  <div className='text-center space-y-1'>
                    <div className='text-4xl font-bold text-white'>${(pricePerVote * 10).toFixed(0)}</div>
                    <p className='text-sm text-white/70'>for 10 votes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
