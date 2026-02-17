'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface VerifyFormProps {
  onSubmit?: (receiptNumber: string) => void
  initialValue?: string
  isLoading?: boolean
}

export function VerifyForm({
  onSubmit,
  initialValue = '',
  isLoading = false,
}: VerifyFormProps) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmed = value.trim()

    if (!trimmed) {
      setError('Please enter a receipt number')
      return
    }

    if (trimmed.length < 5) {
      setError('Receipt number must be at least 5 characters')
      return
    }

    if (onSubmit) {
      onSubmit(trimmed)
    } else {
      router.push(`/verify/${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0">
          <Input
            type="text"
            placeholder="Enter Transaction ID, Receipt Number, or Blockchain Hash"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError('')
            }}
            disabled={isLoading}
            aria-label="Receipt number input"
            className="rounded-r-none sm:rounded-r-md"
          />
          <Button
            type="submit"
            disabled={isLoading}
            size="default"
            className="rounded-l-none sm:rounded-l-md gap-2"
            aria-busy={isLoading}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Verify</span>
          </Button>
        </div>

        {error && (
          <div
            className="text-sm text-red-600 font-medium"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
      </div>
    </form>
  )
}
