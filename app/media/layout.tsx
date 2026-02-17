import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';

export const metadata: Metadata = {
  title: 'Media Dashboard - Contest Management',
  description: 'Real-time media broadcasting dashboard with voting analytics and blockchain verification.',
};

export default function MediaLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ProtectedRouteWrapper
      requiredRole="media"
      autoSignInWith="media"
      fallbackUrl="/events"
    >
      {children}
    </ProtectedRouteWrapper>
  );
}
