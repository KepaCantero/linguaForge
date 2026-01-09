'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { initConstructionRewards } from '@/services/constructionRewards';

export function Providers({ children }: { children: React.ReactNode }) {
  // Inicializar sistema de recompensas de construcción
  useEffect(() => {
    initConstructionRewards();
  }, []);

  return (
    <AuthProvider>
      {children}
      <ServiceWorkerRegistration />
    </AuthProvider>
  );
}

