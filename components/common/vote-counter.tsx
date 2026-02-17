'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface VoteCounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export function VoteCounter({
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
}: VoteCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const handleIncrement = () => {
    if (displayValue < max && !disabled) {
      const newValue = displayValue + 1
      setDisplayValue(newValue)
      onChange(newValue)
      triggerAnimation()
    }
  }

  const handleDecrement = () => {
    if (displayValue > min && !disabled) {
      const newValue = displayValue - 1
      setDisplayValue(newValue)
      onChange(newValue)
      triggerAnimation()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value) || 0
    if (numValue >= min && numValue <= max) {
      setDisplayValue(numValue)
      onChange(numValue)
    }
  }

  const triggerAnimation = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || displayValue <= min}
        aria-label="Decrease vote count"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={displayValue}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-20 text-center ${isAnimating ? 'scale-110' : ''} transition-transform`}
        aria-label="Vote count"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || displayValue >= max}
        aria-label="Increase vote count"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
