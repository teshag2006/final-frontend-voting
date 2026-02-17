'use client';

export function AutoSignInWrapper({ children }: { children: React.ReactNode }) {
  // Auth is now handled by the AuthProvider in layout.tsx
  // This component is kept for backward compatibility
  return <>{children}</>;
}
