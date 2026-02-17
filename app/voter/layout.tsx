import { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';

interface VoterLayoutProps {
  children: ReactNode;
}

export default function VoterLayout({ children }: VoterLayoutProps) {
  return (
    <ProtectedRouteWrapper
      requiredRole="voter"
      autoSignInWith="voter"
      fallbackUrl="/events"
    >
      {children}
    </ProtectedRouteWrapper>
  );
}
