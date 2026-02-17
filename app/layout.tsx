import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { AutoSignInWrapper } from '@/components/auth/auto-signin-wrapper'

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
        <AuthProvider>
          <AutoSignInWrapper>
            {children}
          </AutoSignInWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
