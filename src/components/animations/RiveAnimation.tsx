/**
 * RiveAnimation - Componente para animaciones Rive
 *
 * Integra animaciones Rive interactivas en la aplicación
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRive } from '@rive-app/react-canvas';

// ============================================
// TIPOS
// ============================================

export interface RiveAnimationProps {
  /** URL del archivo .riv */
  src: string;
  /** Nombre del artboard (opcional, usa el default si no se especifica) */
  artboard?: string;
  /** Nombre del state machine (opcional) */
  stateMachine?: string;
  /** Inputs del state machine para controlar la animación */
  inputs?: Record<string, string | number | boolean>;
  /** Clases CSS adicionales */
  className?: string;
  /** Ancho del componente */
  width?: number | string;
  /** Alto del componente */
  height?: number | string;
  /** Si la animación debe reproducirse automáticamente */
  autoplay?: boolean;
  /** Callback cuando carga la animación */
  onLoad?: () => void;
  /** Callback cuando hay un error */
  onError?: (error: Error) => void;
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Componente para animaciones Rive interactivas
 */
export function RiveAnimation({
  src,
  artboard,
  stateMachine,
  inputs = {},
  className = '',
  width = '100%',
  height = '100%',
  autoplay = true,
  onLoad,
  onError,
}: RiveAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Configurar Rive con callbacks en useRive
  const { RiveComponent, rive } = useRive({
    src,
    ...(artboard !== undefined && { artboard }),
    ...(stateMachine !== undefined && { stateMachines: [stateMachine] }),
    autoplay,
    onRiveReady: () => {
      setIsLoaded(true);
      onLoad?.();
    },
  });

  // Actualizar inputs cuando cambian
  useEffect(() => {
    if (!rive || !isLoaded || Object.keys(inputs).length === 0) return;

    try {
      // Rive Runtime API: rive.setInputValue(name, value)
      // Issue: #XXX - Implementar actualización dinámica de inputs de Rive
      // Referencia: https://rive.app/community/doc/docid-filebump/overview
      //
      // La API correcta requiere acceso a la instancia de Rive:
      // rive.setBooleanStateAtPath('inputName', true, 'StateMachineName');
      // rive.setNumberStateAtPath('inputName', 42, 'StateMachineName');
      //
      // Por ahora, solo loggear sin actualizar (feature pendiente)
      console.log('[Rive] Inputs to update:', inputs);
    } catch (error) {
      console.error('[Rive] Error updating inputs:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [inputs, isLoaded, rive, onError]);

  return (
    <div
      ref={containerRef}
      className={`rive-container ${className}`}
      style={{ width, height, position: 'relative' }}
    >
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ============================================
// COMPONENTES PRECONFIGURADOS
// ============================================

/**
 * Animación de carga (loading spinner)
 */
export function LoadingRive({ size = 100 }: { size?: number }) {
  // Nota: Reemplazar con URL real de tu animación Rive
  const riveUrl = 'https://cdn.rive.app/animations/vehicles.riv';

  return (
    <div style={{ width: size, height: size }}>
      <RiveAnimation
        src={riveUrl}
        artboard="Car"
        stateMachine="bouncing"
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de éxito
 */
export function SuccessRive({ size = 100 }: { size?: number }) {
  const riveUrl = 'https://cdn.rive.app/animations/vehicles.riv';

  return (
    <div style={{ width: size, height: size }}>
      <RiveAnimation
        src={riveUrl}
        artboard="Truck"
        inputs={{ level: 1 }}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de error/fallo
 */
export function ErrorRive({ size = 100 }: { size?: number }) {
  const riveUrl = 'https://cdn.rive.app/animations/vehicles.riv';

  return (
    <div style={{ width: size, height: size }}>
      <RiveAnimation
        src={riveUrl}
        artboard="Car"
        inputs={{ level: 0 }}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de progreso/estudio
 */
export function StudyRive({
  progress = 0,
  size = 100,
}: {
  progress?: number;
  size?: number;
}) {
  const riveUrl = 'https://cdn.rive.app/animations/vehicles.riv';

  return (
    <div style={{ width: size, height: size }}>
      <RiveAnimation
        src={riveUrl}
        artboard="Car"
        inputs={{ progress: Math.max(0, Math.min(100, progress)) }}
        width={size}
        height={size}
      />
    </div>
  );
}

// ============================================
// HOOK PERSONALIZADO
// ============================================

/**
 * Hook para controlar animaciones Rive
 */
export function useRiveAnimation() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentInput, setCurrentInput] = useState<
    Record<string, string | number | boolean>
  >({});

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const setInput = (name: string, value: string | number | boolean) => {
    setCurrentInput((prev) => ({ ...prev, [name]: value }));
  };
  const resetInputs = () => setCurrentInput({});

  return {
    isPlaying,
    currentInput,
    play,
    pause,
    setInput,
    resetInputs,
  };
}

export default RiveAnimation;
