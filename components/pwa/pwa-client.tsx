'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PwaClient() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [engaged, setEngaged] = useState(false)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const engagementTimer = window.setTimeout(() => {
      setEngaged(true)
    }, 12000)

    const markEngaged = () => setEngaged(true)
    window.addEventListener('scroll', markEngaged, { once: true })
    window.addEventListener('click', markEngaged, { once: true })

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    return () => {
      window.clearTimeout(engagementTimer)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('scroll', markEngaged)
      window.removeEventListener('click', markEngaged)
    }
  }, [])

  useEffect(() => {
    setShowInstall(Boolean(engaged && deferredPrompt))
  }, [engaged, deferredPrompt])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Best effort registration; app should still work if SW fails.
    })
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setShowInstall(false)
    setDeferredPrompt(null)
  }

  if (!showInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="mb-3 text-sm text-slate-700">Install the app for faster access and offline support.</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleInstall}>
          Install App
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowInstall(false)}>
          Not now
        </Button>
      </div>
    </div>
  )
}
