/**
 * LottieAnimation - Componente para animaciones Lottie
 *
 * Integra animaciones Lottie de Lordicon y LottieFiles
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import type { LottieRefCurrentProps } from 'lottie-react';

// ============================================
// TIPOS
// ============================================

export interface LottieAnimationProps {
  /** URL del archivo JSON de Lottie */
  src: string;
  /** Si la animación debe reproducirse automáticamente */
  autoplay?: boolean;
  /** Si debe hacer loop */
  loop?: boolean;
  /** Velocidad de reproducción (1 = normal) */
  speed?: number;
  /** Dirección de reproducción (1 = normal, -1 = inversa) */
  direction?: 1 | -1;
  /** Clases CSS adicionales */
  className?: string;
  /** Ancho del componente */
  width?: number | string;
  /** Alto del componente */
  height?: number | string;
  /** Callback cuando la animación está lista para reproducir */
  onReady?: () => void;
  /** Callback cuando la animación completa un ciclo */
  onComplete?: () => void;
  /** Callback cuando la animación hace loop */
  onLoop?: () => void;
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Componente para animaciones Lottie
 */
export function LottieAnimation({
  src,
  autoplay = true,
  loop = true,
  speed = 1,
  direction = 1,
  className = '',
  width = '100%',
  height = '100%',
  onReady,
  onComplete,
  onLoop,
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Aplicar velocidad y dirección cuando cambia
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
      lottieRef.current.setDirection(direction);
    }
  }, [speed, direction]);

  // Cargar animation data desde URL
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data);
        onReady?.();
      })
      .catch((err) => {
        console.error('Error loading Lottie animation:', err);
      });
  }, [src, onReady]);

  if (!animationData) {
    return (
      <div
        className={`lottie-container ${className}`}
        style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div
      className={`lottie-container ${className}`}
      style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        autoplay={autoplay}
        loop={loop}
        {...(onComplete !== undefined && { onComplete })}
        {...(onLoop !== undefined && { onLoopComplete: onLoop })}
      />
    </div>
  );
}

// ============================================
// COMPONENTES PRECONFIGURADOS DE LORDICON
// ============================================

/**
 * Animación de carga (Lordicon)
 * Fuente: https://lordicon.com/
 */
export function LoadingLordicon({ size = 64 }: { size?: number }) {
  // Icono de carga de Lordicon
  const loadingJson = 'https://cdn.lordicon.com/qhviklyi.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={loadingJson}
        loop={true}
        autoplay={true}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de éxito (Lordicon)
 */
export function SuccessLordicon({ size = 64 }: { size?: number }) {
  const successJson = 'https://cdn.lordicon.com/lomfljuq.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={successJson}
        loop={false}
        autoplay={true}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de error (Lordicon)
 */
export function ErrorLordicon({ size = 64 }: { size?: number }) {
  const errorJson = 'https://cdn.lordicon.com/nduddlov.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={errorJson}
        loop={false}
        autoplay={true}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de celebración (Lordicon)
 */
export function CelebrationLordicon({ size = 64 }: { size?: number }) {
  const celebrationJson = 'https://cdn.lordicon.com/evkauvgf.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={celebrationJson}
        loop={true}
        autoplay={true}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de confirmación (Lordicon)
 */
export function ConfirmLordicon({ size = 64 }: { size?: number }) {
  const confirmJson = 'https://cdn.lordicon.com/dxjqoygy.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={confirmJson}
        loop={false}
        autoplay={true}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de editar (Lordicon)
 */
export function EditLordicon({ size = 64 }: { size?: number }) {
  const editJson = 'https://cdn.lordicon.com/uvniqbph.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={editJson}
        loop={true}
        autoplay={false}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de eliminar (Lordicon)
 */
export function DeleteLordicon({ size = 64 }: { size?: number }) {
  const deleteJson = 'https://cdn.lordicon.com/gsqdnxtn.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={deleteJson}
        loop={false}
        autoplay={false}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de reproducción de audio (Lordicon)
 */
export function AudioLordicon({ size = 64, playing = false }: { size?: number; playing?: boolean }) {
  const audioJson = 'https://cdn.lordicon.com/rdxqoqzz.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={audioJson}
        loop={playing}
        autoplay={playing}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de micrófono/recording (Lordicon)
 */
export function MicrophoneLordicon({ size = 64, recording = false }: { size?: number; recording?: boolean }) {
  const micJson = 'https://cdn.lordicon.com/muhrbbvv.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={micJson}
        loop={recording}
        autoplay={recording}
        width={size}
        height={size}
      />
    </div>
  );
}

/**
 * Animación de settings/configuración (Lordicon)
 */
export function SettingsLordicon({ size = 64 }: { size?: number }) {
  const settingsJson = 'https://cdn.lordicon.com/lecprnjb.json';

  return (
    <div style={{ width: size, height: size }}>
      <LottieAnimation
        src={settingsJson}
        loop={false}
        autoplay={false}
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
 * Hook para controlar animaciones Lottie
 */
export function useLottieAnimation() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const play = () => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  const pause = () => {
    if (lottieRef.current) {
      lottieRef.current.pause();
    }
  };

  const stop = () => {
    if (lottieRef.current) {
      lottieRef.current.stop();
    }
  };

  const setSpeed = (newSpeed: number) => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(newSpeed);
    }
  };

  const setDirection = (newDirection: 1 | -1) => {
    if (lottieRef.current) {
      lottieRef.current.setDirection(newDirection);
    }
  };

  const goToAndPlay = (frame: number, playFrame = true) => {
    if (lottieRef.current) {
      lottieRef.current.goToAndPlay(frame, playFrame);
    }
  };

  const goToAndStop = (frame: number) => {
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(frame);
    }
  };

  return {
    lottieRef,
    play,
    pause,
    stop,
    setSpeed,
    setDirection,
    goToAndPlay,
    goToAndStop,
  };
}

export default LottieAnimation;
