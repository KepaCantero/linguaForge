'use client';

/**
 * EpisodicCard - Tarjeta con física realista para Memory Bank AAA
 * Implementa spring physics, gestos naturales y feedback multimodal
 * + Fixed transparency issues + Better contrast
 *
 * TAREA 2.8.2: EpisodicCard Component con Spring Physics
 */

import { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import {
  type TextureType,
  type LearningContext,
  getTextureForContext,
  getTextureByType,
  getPhysicsConfig,
  type TextureProperties,
} from '@/lib/textures';
import { useHaptic } from '@/lib/haptic';
import { useSoundEngine } from '@/lib/soundEngine';

// ============================================
// TIPOS
// ============================================

export interface EpisodicCardContent {
  id: string;
  front: {
    text: string;
    subtext?: string;
  };
  back: {
    text: string;
    subtext?: string;
  };
  context: LearningContext;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface EpisodicCardProps {
  content: EpisodicCardContent;
  textureType?: TextureType;
  onFlip?: (isFlipped: boolean) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  disabled?: boolean;
  className?: string;
  isFocusMode?: boolean; // New prop for focus mode styling
}

// ============================================
// CONSTANTES
// ============================================

const SWIPE_THRESHOLD = 100;
const ROTATION_RANGE = 15;
const CARD_WIDTH = 320;
const CARD_HEIGHT = 200;

// ============================================
// COMPONENTE
// ============================================

export function EpisodicCard({
  content,
  textureType,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  disabled = false,
  className = '',
  isFocusMode = false,
}: EpisodicCardProps) {
  // Estado
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Hooks
  const haptic = useHaptic();
  const sound = useSoundEngine();

  // Obtener textura
  const texture: TextureProperties = textureType
    ? getTextureByType(textureType)
    : getTextureForContext(content.context);

  // Configuración de física basada en textura
  const physicsConfig = getPhysicsConfig(texture);

  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Transformaciones basadas en posición X
  const rotate = useTransform(x, [-200, 0, 200], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const scale = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.95, 0.98, 1, 0.98, 0.95]
  );

  // Indicadores de swipe
  const leftIndicatorOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

  // Spring para animaciones suaves
  const springX = useSpring(x, physicsConfig);
  const springY = useSpring(y, physicsConfig);
  const springRotateY = useSpring(rotateY, {
    stiffness: 200,
    damping: 30,
  });

  // Sombra dinámica basada en elevación
  const shadowY = useTransform(y, [-50, 0, 50], [20, 12, 4]);
  const shadowBlur = useTransform(y, [-50, 0, 50], [30, 20, 10]);
  const shadowOpacity = useTransform(y, [-50, 0, 50], [0.3, 0.15, 0.05]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFlip = useCallback(() => {
    if (disabled) return;

    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    rotateY.set(newFlipped ? 180 : 0);

    // Feedback
    haptic.cardFlip();
    sound.playCardFlip();

    onFlip?.(newFlipped);
  }, [isFlipped, disabled, rotateY, haptic, sound, onFlip]);

  const handleDragStart = useCallback(() => {
    if (disabled) return;
    setIsDragging(true);
    haptic.dragStart();
  }, [disabled, haptic]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled) return;
      setIsDragging(false);

      const offsetX = info.offset.x;
      const velocityX = info.velocity.x;

      // Detectar swipe basado en offset y velocidad
      const isSwipeLeft = offsetX < -SWIPE_THRESHOLD || velocityX < -500;
      const isSwipeRight = offsetX > SWIPE_THRESHOLD || velocityX > 500;

      if (isSwipeLeft && onSwipeLeft) {
        haptic.dragEnd();
        sound.playError();
        onSwipeLeft();
      } else if (isSwipeRight && onSwipeRight) {
        haptic.dragEnd();
        sound.playSuccess();
        onSwipeRight();
      } else {
        // Volver a posición original
        x.set(0);
        y.set(0);
        haptic.tap();
      }
    },
    [disabled, x, y, haptic, sound, onSwipeLeft, onSwipeRight]
  );

  const handleTap = useCallback(() => {
    if (disabled || isDragging) return;
    haptic.tap();
    sound.playTap();
    onTap?.();
  }, [disabled, isDragging, haptic, sound, onTap]);

  // ============================================
  // ESTILOS DINÁMICOS
  // ============================================

  const cardStyle: React.CSSProperties = {
    width: isFocusMode ? CARD_WIDTH * 1.1 : CARD_WIDTH,
    height: isFocusMode ? CARD_HEIGHT * 1.1 : CARD_HEIGHT,
    perspective: 1000,
    transformStyle: 'preserve-3d',
  };

  const faceBaseStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    // SOLID background instead of transparent gradient
    background: isFocusMode
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    border: '2px solid rgba(99, 102, 241, 0.5)',
    boxShadow: isFocusMode
      ? '0 25px 50px -12px rgba(99, 102, 241, 0.5), 0 0 30px rgba(99, 102, 241, 0.3)'
      : '0 10px 40px rgba(0, 0, 0, 0.3)',
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`relative ${className}`} style={cardStyle}>
      {/* Indicador Swipe Izquierda (Incorrecto) */}
      <motion.div
        className="absolute -left-16 top-1/2 -translate-y-1/2 text-4xl"
        style={{ opacity: leftIndicatorOpacity }}
      >
        <span className="text-red-500 drop-shadow-lg">✗</span>
      </motion.div>

      {/* Indicador Swipe Derecha (Correcto) */}
      <motion.div
        className="absolute -right-16 top-1/2 -translate-y-1/2 text-4xl"
        style={{ opacity: rightIndicatorOpacity }}
      >
        <span className="text-green-500 drop-shadow-lg">✓</span>
      </motion.div>

      {/* Tarjeta Principal */}
      <motion.div
        ref={cardRef}
        className="cursor-grab active:cursor-grabbing select-none"
        style={{
          x: springX,
          y: springY,
          rotate,
          scale,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
        drag={!disabled}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        dragCursor="grab"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        onDoubleClick={handleFlip}
        whileHover={!disabled ? { scale: 1.02, cursor: 'grab' } : undefined}
        whileTap={!disabled ? { scale: 0.98, cursor: 'grabbing' } : undefined}
        whileDrag={{ cursor: 'grabbing' }}
      >
        {/* Sombra dinámica */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: useTransform(
              [shadowY, shadowBlur, shadowOpacity],
              ([sy, sb, so]) =>
                `0 ${sy}px ${sb}px rgba(0, 0, 0, ${so})`
            ),
            zIndex: -1,
          }}
        />

        {/* Cara Frontal */}
        <motion.div
          style={{
            ...faceBaseStyle,
            rotateY: 0,
            zIndex: isFlipped ? 0 : 1,
          }}
        >
          <div className="text-center">
            <p
              className="text-2xl font-bold text-white drop-shadow-lg"
            >
              {content.front.text}
            </p>
            {content.front.subtext && (
              <p className="text-base mt-3 text-white/80 font-medium">
                {content.front.subtext}
              </p>
            )}
          </div>

          {/* Indicador de dificultad */}
          {content.difficulty && (
            <div className="absolute bottom-3 right-3">
              <DifficultyIndicator difficulty={content.difficulty} />
            </div>
          )}

          {/* Indicador de flip */}
          <div className="absolute bottom-3 left-3 text-xs text-white/50 bg-black/30 px-2 py-1 rounded-full">
            Doble click para voltear
          </div>
        </motion.div>

        {/* Cara Posterior */}
        <motion.div
          style={{
            ...faceBaseStyle,
            rotateY: 180,
            zIndex: isFlipped ? 1 : 0,
          }}
        >
          <div className="text-center">
            <p
              className="text-2xl font-bold text-white drop-shadow-lg"
            >
              {content.back.text}
            </p>
            {content.back.subtext && (
              <p className="text-base mt-3 text-white/80 font-medium">
                {content.back.subtext}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Instrucciones */}
      {!disabled && !isFocusMode && (
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-white/70 bg-black/30 px-3 py-1 rounded-full mx-auto w-fit">
          Desliza para responder • Doble click para voltear
        </div>
      )}
    </div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

interface DifficultyIndicatorProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

function DifficultyIndicator({ difficulty }: DifficultyIndicatorProps) {
  const colors = {
    easy: 'bg-green-400 shadow-green-400/50',
    medium: 'bg-yellow-400 shadow-yellow-400/50',
    hard: 'bg-red-400 shadow-red-400/50',
  };

  const dots = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return (
    <div className="flex gap-1.5 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
      {Array.from({ length: dots[difficulty] }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${colors[difficulty]} shadow-lg`}
        />
      ))}
    </div>
  );
}

// ============================================
// EXPORTACIONES
// ============================================

export default EpisodicCard;
