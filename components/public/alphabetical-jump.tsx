'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlphabeticalJumpProps {
  onLetterSelect: (letter: string) => void;
  selectedLetter?: string;
  className?: string;
}

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export function AlphabeticalJump({
  onLetterSelect,
  selectedLetter,
  className,
}: AlphabeticalJumpProps) {
  const [active, setActive] = useState<string | null>(selectedLetter || null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleLetterClick = (letter: string) => {
    setActive(letter);
    onLetterSelect(letter.toLowerCase());

    // Scroll the active button into view if needed
    const activeButton = scrollContainerRef.current?.querySelector(
      `[data-letter="${letter}"]`
    ) as HTMLButtonElement;

    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <p className="text-sm font-medium text-muted-foreground mb-3">Jump to letter</p>

      <div
        ref={scrollContainerRef}
        className="flex gap-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide"
        role="tablist"
        aria-label="Alphabetical navigation"
      >
        {ALPHABET.map((letter) => (
          <Button
            key={letter}
            variant={active === letter ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLetterClick(letter)}
            data-letter={letter}
            className={cn(
              'flex-shrink-0 w-8 h-8 p-0 font-semibold transition-all',
              active === letter && 'ring-2 ring-offset-2'
            )}
            aria-pressed={active === letter}
            aria-label={`Jump to contestants starting with ${letter}`}
          >
            {letter}
          </Button>
        ))}
      </div>

      {active && (
        <button
          onClick={() => {
            setActive(null);
            onLetterSelect('');
          }}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Clear filter
        </button>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
