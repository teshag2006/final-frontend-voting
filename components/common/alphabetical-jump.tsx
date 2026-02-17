'use client'

import { Button } from '@/components/ui/button'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface AlphabeticalJumpProps {
  onLetterClick: (letter: string) => void
  activeLetters?: string[]
}

export function AlphabeticalJump({ onLetterClick, activeLetters = [] }: AlphabeticalJumpProps) {
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-lg">
      <Button
        variant={activeLetters.length === 0 ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLetterClick('')}
        className="h-7 w-7 p-0 text-xs"
      >
        All
      </Button>
      {ALPHABET.map((letter) => (
        <Button
          key={letter}
          variant={activeLetters.includes(letter) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLetterClick(letter)}
          className="h-7 w-7 p-0 text-xs"
          aria-label={`Filter by letter ${letter}`}
        >
          {letter}
        </Button>
      ))}
    </div>
  )
}
