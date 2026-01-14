'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isOffline: boolean;
}

const UPDATE_BANNER_HEIGHT = 'bottom-20';
const OFFLINE_BANNER_HEIGHT = 'top-16';

// Helper: Crear controlador de estado offline
function createOfflineHandler(setState: React.Dispatch<React.SetStateAction<ServiceWorkerState>>) {
  return () => setState((s) => ({ ...s, isOffline: true }));
}

// Helper: Crear controlador de estado online
function createOnlineHandler(setState: React.Dispatch<React.SetStateAction<ServiceWorkerState>>) {
  return () => setState((s) => ({ ...s, isOffline: false }));
}

// Helper: Verificar si nueva versión está instalada
function isNewVersionInstalled(worker: ServiceWorker): boolean {
  return worker.state === 'installed' && !!navigator.serviceWorker.controller;
}

// Helper: Crear controlador de cambio de estado del worker
function createWorkerStateHandler(setState: React.Dispatch<React.SetStateAction<ServiceWorkerState>>) {
  return (newWorker: ServiceWorker) => {
    if (isNewVersionInstalled(newWorker)) {
      setState((s) => ({ ...s, isUpdateAvailable: true }));
    }
  };
}

// Helper: Crear controlador de actualización encontrada
function createUpdateFoundHandler(setState: React.Dispatch<React.SetStateAction<ServiceWorkerState>>) {
  return (registration: ServiceWorkerRegistration) => {
    const newWorker = registration.installing;
    if (!newWorker) return;

    const handleStateChange = createWorkerStateHandler(setState);
    newWorker.addEventListener('statechange', () => handleStateChange(newWorker));
  };
}

// Helper: Crear controlador de mensajes del service worker
function createMessageHandler() {
  return (event: MessageEvent) => {
    if (event.data?.type === 'SYNC_PROGRESS') {
      globalThis.dispatchEvent(new CustomEvent('sw-sync-progress'));
    }
  };
}

// Helper: Registrar service worker
async function registerServiceWorker(
  setState: React.Dispatch<React.SetStateAction<ServiceWorkerState>>
): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    setState((s) => ({ ...s, isRegistered: true }));
    
    const updateFoundHandler = createUpdateFoundHandler(setState);
    registration.addEventListener('updatefound', () => updateFoundHandler(registration));
    
    const messageHandler = createMessageHandler();
    navigator.serviceWorker.addEventListener('message', messageHandler);
  } catch {
    // TODO: Add proper logging service for SW registration errors
  }
}

// Helper: Configurar event listeners de conectividad
function setupConnectivityListeners(
  setState: React.Dispatch<React.SetStateAction<ServiceWorkerState>>
): () => void {
  const handleOnline = createOnlineHandler(setState);
  const handleOffline = createOfflineHandler(setState);

  globalThis.addEventListener('online', handleOnline);
  globalThis.addEventListener('offline', handleOffline);
  setState((s) => ({ ...s, isOffline: !navigator.onLine }));

  return () => {
    globalThis.removeEventListener('online', handleOnline);
    globalThis.removeEventListener('offline', handleOffline);
  };
}

export function ServiceWorkerRegistration() {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isUpdateAvailable: false,
    isOffline: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const cleanup = setupConnectivityListeners(setState);
    registerServiceWorker(setState);

    return cleanup;
  }, []);

  if (state.isUpdateAvailable) {
    return (
      <div className={`fixed ${UPDATE_BANNER_HEIGHT} left-4 right-4 z-50 bg-accent-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between`}>
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

  if (state.isOffline) {
    return (
      <div className={`fixed ${OFFLINE_BANNER_HEIGHT} left-4 right-4 z-50 bg-amber-500 text-amber-900 p-3 rounded-xl shadow-lg flex items-center gap-2`}>
        <span className="text-lg">📡</span>
        <p className="text-sm font-medium">
          Sin conexión - Los cambios se sincronizarán cuando vuelvas a conectarte
        </p>
      </div>
    );
  }

  return null;
}
