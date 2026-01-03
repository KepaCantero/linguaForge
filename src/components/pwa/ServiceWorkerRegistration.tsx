'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isOffline: boolean;
}

export function ServiceWorkerRegistration() {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isUpdateAvailable: false,
    isOffline: false,
  });

  useEffect(() => {
    // Solo registrar en producción y si el navegador soporta service workers
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Detectar estado offline
    const handleOnline = () => setState((s) => ({ ...s, isOffline: false }));
    const handleOffline = () => setState((s) => ({ ...s, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setState((s) => ({ ...s, isOffline: !navigator.onLine }));

    // Registrar service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState((s) => ({ ...s, isRegistered: true }));
        console.log('[PWA] Service Worker registered:', registration.scope);

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Nueva versión disponible
                setState((s) => ({ ...s, isUpdateAvailable: true }));
                console.log('[PWA] New version available');
              }
            });
          }
        });

        // Escuchar mensajes del service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SYNC_PROGRESS') {
            // Disparar evento para que la app sincronice
            window.dispatchEvent(new CustomEvent('sw-sync-progress'));
          }
        });
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerSW();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mostrar banner de actualización disponible
  if (state.isUpdateAvailable) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <p className="font-medium">Nueva versión disponible</p>
          <p className="text-sm text-indigo-200">
            Recarga para actualizar la app
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
        >
          Actualizar
        </button>
      </div>
    );
  }

  // Mostrar indicador offline
  if (state.isOffline) {
    return (
      <div className="fixed top-16 left-4 right-4 z-50 bg-amber-500 text-amber-900 p-3 rounded-xl shadow-lg flex items-center gap-2">
        <span className="text-lg">📡</span>
        <p className="text-sm font-medium">
          Sin conexión - Los cambios se sincronizarán cuando vuelvas a conectarte
        </p>
      </div>
    );
  }

  return null;
}
