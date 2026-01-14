'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { AnalyticsProvider } from '@/components/analytics';
import { SyncProvider } from '@/components/providers/SyncProvider';
import { initConstructionRewards } from '@/services/constructionRewards';

export function Providers({ children }: { children: React.ReactNode }) {
  // Inicializar sistema de recompensas de construcción
  useEffect(() => {
    initConstructionRewards();
  }, []);

  return (
    <AuthProvider>
      <AnalyticsProvider>
        <SyncProvider>
          {children}
          <ServiceWorkerRegistration />
        </SyncProvider>
      </AnalyticsProvider>
    </AuthProvider>
  );
}

