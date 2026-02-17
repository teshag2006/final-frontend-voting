'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto max-w-sm">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        You are offline. Some features may be unavailable. Votes will be queued for submission when online.
      </AlertDescription>
    </Alert>
  )
}
