import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Miss & Mr Africa Voting',
    short_name: 'Voting',
    description: 'Secure blockchain-verified voting platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#1a1f4e',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64',
        type: 'image/x-icon',
      },
    ],
  }
}
