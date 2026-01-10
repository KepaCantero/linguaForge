/**
 * useSoundEffects - Hook para efectos de sonido en React
 *
 * Proporciona acceso al sistema de sonidos con inicialización automática
 * y gestión de estado.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { soundEffects, type SoundId, initSoundEffects } from '@/lib/soundEffects';
import { trackEvent } from '@/lib/analytics';
import { AnalyticsEvent } from '@/types/analytics';

interface SoundEffectsState {
  enabled: boolean;
  volume: number;
  initialized: boolean;
}

interface UseSoundEffectsReturn extends SoundEffectsState {
  play: (soundId: SoundId) => void;
  playCorrect: () => void;
  playIncorrect: () => void;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  init: () => Promise<void>;
}

export function useSoundEffects(): UseSoundEffectsReturn {
  const [state, setState] = useState<SoundEffectsState>({
    enabled: soundEffects.isEnabled(),
    volume: soundEffects.getVolume(),
    initialized: soundEffects.isInitialized(),
  });

  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Inicializar sistema de audio (debe llamarse tras interacción del usuario)
  const init = useCallback(() => {
    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    initPromiseRef.current = initSoundEffects();
    return initPromiseRef.current;
  }, []);

  // Actualizar estado cuando cambian las propiedades del manager
  const updateState = useCallback(() => {
    setState({
      enabled: soundEffects.isEnabled(),
      volume: soundEffects.getVolume(),
      initialized: soundEffects.isInitialized(),
    });
  }, []);

  // Reproducir un sonido
  const play = useCallback((soundId: SoundId) => {
    soundEffects.play(soundId);
  }, []);

  // Reproducir sonido de respuesta correcta
  const playCorrect = useCallback(() => {
    soundEffects.playCorrect();
  }, []);

  // Reproducir sonido de respuesta incorrecta
  const playIncorrect = useCallback(() => {
    soundEffects.playIncorrect();
  }, []);

  // Habilitar/deshabilitar sonidos
  const setEnabled = useCallback((enabled: boolean) => {
    soundEffects.setEnabled(enabled);
    updateState();

    // Track sound toggle in analytics
    trackEvent(AnalyticsEvent.SOUND_TOGGLE, {
      enabled,
      timestamp: Date.now(),
      sessionId: '',
    });
  }, [updateState]);

  // Establecer volumen
  const setVolume = useCallback((volume: number) => {
    soundEffects.setVolume(volume);
    updateState();
  }, [updateState]);

  return {
    ...state,
    play,
    playCorrect,
    playIncorrect,
    setEnabled,
    setVolume,
    init,
  };
}

/**
 * Hook para inicializar sonidos tras primera interacción del usuario
 * Útil para cumplir con la política de autoplay de los navegadores
 */
export function useSoundEffectsInit() {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        initSoundEffects().catch(console.warn);
      }
    };

    // Eventos que cuentan como interacción del usuario
    const events = ['click', 'keydown', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [hasInteracted]);
}
