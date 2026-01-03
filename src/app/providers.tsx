'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ServiceWorkerRegistration />
    </AuthProvider>
  );
}

