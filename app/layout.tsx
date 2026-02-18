import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { AutoSignInWrapper } from '@/components/auth/auto-signin-wrapper'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { OfflineIndicator } from '@/components/common/offline-indicator'
import { Toaster } from '@/components/ui/toaster'
import { PwaClient } from '@/components/pwa/pwa-client'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Miss & Mr Africa - Vote for Your Favorite Contestant',
  description: 'Secure blockchain-verified voting platform for Miss & Mr Africa. Vote for your favorite contestant with real-time leaderboard and fraud protection.',
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#1a1f4e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <AutoSignInWrapper>
              {children}
              <OfflineIndicator />
              <PwaClient />
              <Toaster />
            </AutoSignInWrapper>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
