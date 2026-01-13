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

    // Manejar cambios de estado del nuevo service worker
    const handleWorkerStateChange = (newWorker: ServiceWorker) => {
      const isNewVersionInstalled =
        newWorker.state === 'installed' &&
        navigator.serviceWorker.controller;

      if (isNewVersionInstalled) {
        setState((s) => ({ ...s, isUpdateAvailable: true }));
      }
    };

    // Configurar detección de actualizaciones
    const setupUpdateDetection = (registration: ServiceWorkerRegistration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => handleWorkerStateChange(newWorker));
        }
      });
    };

    // Manejar mensajes del service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_PROGRESS') {
        globalThis.dispatchEvent(new CustomEvent('sw-sync-progress'));
      }
    };

    // Registrar service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState((s) => ({ ...s, isRegistered: true }));
        setupUpdateDetection(registration);
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      } catch (_error) {
        // TODO: Add proper logging service for SW registration errors
      }
    };

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);
    setState((s) => ({ ...s, isOffline: !navigator.onLine }));

    registerSW();

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mostrar banner de actualización disponible
  if (state.isUpdateAvailable) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-accent-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <p className="font-medium">Nueva versión disponible</p>
          <p className="text-sm text-accent-200">
            Recarga para actualizar la app
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-accent-600 rounded-lg font-medium hover:bg-sky-50 transition-colors"
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
