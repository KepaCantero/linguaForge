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
import { SwipeIndicators } from './SwipeIndicators';
import { CardFace } from './CardFace';

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

  return (
    <div className={`relative ${className}`} style={cardStyle}>
      <SwipeIndicators
        leftIndicatorOpacity={leftIndicatorOpacity}
        rightIndicatorOpacity={rightIndicatorOpacity}
      />

      <motion.div
        ref={cardRef}
        className={`select-none ${!disabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{
          x: springX,
          y: springY,
          rotate,
          scale,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
          cursor: !disabled ? 'grab' : 'default',
        }}
        drag={!disabled}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        onDoubleClick={handleFlip}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
      >
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

        <CardFace
          text={content.front.text}
          subtext={content.front.subtext}
          difficulty={content.difficulty}
          rotateY={0}
          zIndex={isFlipped ? 0 : 1}
          showFlipHint
        />

        <CardFace
          text={content.back.text}
          subtext={content.back.subtext}
          rotateY={180}
          zIndex={isFlipped ? 1 : 0}
        />
      </motion.div>

      {!disabled && !isFocusMode && (
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-white/70 bg-black/30 px-3 py-1 rounded-full mx-auto w-fit">
          Desliza para responder • Doble click para voltear
        </div>
      )}
    </div>
  );
}

// ============================================
// EXPORTACIONES
// ============================================

export default EpisodicCard;
