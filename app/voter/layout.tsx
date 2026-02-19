import { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';

export const dynamic = 'force-dynamic';

interface VoterLayoutProps {
  children: ReactNode;
}

export default function VoterLayout({ children }: VoterLayoutProps) {
  return (
    <ProtectedRouteWrapper
      requiredRole="voter"
      fallbackUrl="/events"
    >
      {children}
    </ProtectedRouteWrapper>
  );
}

