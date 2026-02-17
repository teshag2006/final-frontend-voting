'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'bounce';
  duration?: number;
  delay?: number;
  className?: string;
}

const animationStyles = {
  fade: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slide: `
    @keyframes slideIn {
      from { transform: translateX(-20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,
  scale: `
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
  bounce: `
    @keyframes bounceIn {
      0% { transform: scale(0.3); opacity: 0; }
      50% { opacity: 1; }
      70% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `,
};

export function AnimatedTransition({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  className,
}: AnimatedTransitionProps) {
  const animationName = `${type}In`;
  
  return (
    <>
      <style>{`
        ${animationStyles[type]}
        .animated-${type} {
          animation: ${animationName} ${duration}ms ease-out ${delay}ms forwards;
        }
      `}</style>
      <div className={cn(`animated-${type}`, className)}>
        {children}
      </div>
    </>
  );
}

export function ListItemAnimation({
  children,
  index,
  staggerDelay = 50,
}: {
  children: ReactNode;
  index: number;
  staggerDelay?: number;
}) {
  return (
    <AnimatedTransition
      type="slide"
      delay={index * staggerDelay}
      duration={400}
    >
      {children}
    </AnimatedTransition>
  );
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .loading-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `}</style>
  ) || <div className={cn('loading-pulse', className)} />;
}

export function CountdownPulse({ className }: { className?: string }) {
  return (
    <style>{`
      @keyframes countdownPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      .countdown-pulse {
        animation: countdownPulse 1s ease-in-out infinite;
      }
    `}</style>
  ) || <div className={cn('countdown-pulse', className)} />;
}
