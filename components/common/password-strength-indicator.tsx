'use client'

import { Progress } from '@/components/ui/progress'
import { Check, X } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return Math.min(strength, 4)
  }

  const strength = calculateStrength(password)
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase and lowercase letters', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Numbers', met: /\d/.test(password) },
    { label: 'Special characters', met: /[^a-zA-Z\d]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Password Strength</p>
          <span className={`text-xs font-semibold ${strengthColors[strength]}`}>
            {strengthLabels[strength]}
          </span>
        </div>
        <Progress value={(strength + 1) * 25} className="h-2" />
      </div>

      <div className="space-y-2">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            {check.met ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={check.met ? 'text-muted-foreground' : 'text-muted-foreground line-through'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
