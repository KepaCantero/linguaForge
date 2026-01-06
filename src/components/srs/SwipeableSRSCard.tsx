/**
 * SwipeableSRSCard Component
 *
 * Tarjeta SRS con soporte para gestos de swipe:
 * - Swipe derecho = "Conocido" (Good/Easy)
 * - Swipe izquierdo = "Repasar" (Again/Hard)
 * - Animación fluida con Framer Motion
 * - Soporte táctil y desktop (drag equivalente)
 */

'use client';

import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { SRSRating } from '@/hooks/useKeyboardShortcuts';

interface SwipeableSRSCardProps {
  front: React.ReactNode;
  back?: React.ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  onRating?: (rating: SRSRating) => void;
  disabled?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 100; // píxeles para considerar como swipe
const SWIPE_VELOCITY_THRESHOLD = 500; // px/s para considerar como swipe intencional

/**
 * Componente de tarjeta con gestos de swipe para SRS
 */
export function SwipeableSRSCard({
  front,
  back,
  onSwipeRight,
  onSwipeLeft,
  onRating,
  disabled = false,
  className = '',
}: SwipeableSRSCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const rotateZ = useTransform(x, [-200, 200], [-15, 15]); // Rotación basada en posición X
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Manejar el final del drag/swipe
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);

      if (disabled) return;

      const { offset, velocity } = info;

      // Determinar si es un swipe válido
      const isSwipeRight = offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD;
      const isSwipeLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD;

      if (isSwipeRight) {
        setDirection('right');
        onSwipeRight?.();
        onRating?.('good');
        // Reset después de un delay
        setTimeout(() => {
          x.set(0);
          setDirection(null);
        }, 300);
      } else if (isSwipeLeft) {
        setDirection('left');
        onSwipeLeft?.();
        onRating?.('again');
        setTimeout(() => {
          x.set(0);
          setDirection(null);
        }, 300);
      } else {
        // Reset sin acción - volver al centro
        x.set(0);
      }
    },
    [disabled, onSwipeLeft, onSwipeRight, onRating, x]
  );

  // Manejar inicio de drag
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDirection(null);
  }, []);

  // Indicadores de dirección (flechas)
  const rightArrowOpacity = useTransform(x, [0, 100], [0, 1]);
  const leftArrowOpacity = useTransform(x, [-100, 0], [1, 0]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <motion.div
        style={{
          x,
          rotateZ,
          opacity,
          cursor: disabled ? 'default' : 'grab',
        }}
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
        animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
        className="relative w-full h-full"
      >
        {/* Contenido frontal de la tarjeta */}
        <div className="w-full h-full">{front}</div>

        {/* Indicador de swipe derecho (Good/Easy) */}
        <motion.div
          style={{ opacity: rightArrowOpacity }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500/20 backdrop-blur-sm rounded-full p-4 border-2 border-green-500/50"
        >
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs text-green-300 mt-1">Good</span>
        </motion.div>

        {/* Indicador de swipe izquierdo (Again/Hard) */}
        <motion.div
          style={{ opacity: leftArrowOpacity }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-500/20 backdrop-blur-sm rounded-full p-4 border-2 border-red-500/50"
        >
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs text-red-300 mt-1">Again</span>
        </motion.div>

        {/* Overlay de dirección durante swipe */}
        {isDragging && direction !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className={`absolute inset-0 ${
              direction === 'right' ? 'bg-green-500' : 'bg-red-500'
            } -z-10`}
          />
        )}
      </motion.div>

      {/* Contenido trasero (opcional) */}
      {back && (
        <motion.div
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          className="absolute inset-0 backface-hidden"
        >
          {back}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Variantes de swipe con diferentes comportamientos
 */
export interface SwipeableCardVariantsProps extends Omit<SwipeableSRSCardProps, 'onSwipeRight' | 'onSwipeLeft'> {
  variant?: 'srs' | 'binary' | 'trinary';
  onAccept?: () => void;
  onReject?: () => void;
  onSkip?: () => void;
}

/**
 * Variante SRS con 4 opciones de rating
 */
export function SRSSwipeCard({
  onRating,
  ...props
}: SwipeableCardVariantsProps) {
  return (
    <SwipeableSRSCard
      {...props}
      onSwipeRight={() => onRating?.('good')}
      onSwipeLeft={() => onRating?.('again')}
    />
  );
}

/**
 * Variante binaria (aceptar/rechazar)
 */
export function BinarySwipeCard({
  onAccept,
  onReject,
  ...props
}: SwipeableCardVariantsProps) {
  return (
    <SwipeableSRSCard
      {...props}
      {...(onAccept && { onSwipeRight: onAccept })}
      {...(onReject && { onSwipeLeft: onReject })}
    />
  );
}

/**
 * Variante ternaria con skip
 */
export function TrinarySwipeCard({
  front,
  onAccept,
  onReject,
  onSkip,
  disabled,
  className,
}: {
  front: React.ReactNode;
  back?: React.ReactNode;
  onAccept?: () => void;
  onReject?: () => void;
  onSkip?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  // Para ternaria, swipe up = skip
  const y = useMotionValue(0);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <motion.div
        style={{
          x: useMotionValue(0),
          y,
          cursor: disabled ? 'default' : 'grab',
        }}
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_event, info) => {
          const { offset } = info;

          // Swipe up para skip
          if (offset.y < -SWIPE_THRESHOLD && onSkip) {
            onSkip();
            y.set(0);
            return;
          }

          // Swipe derecho para accept
          if (offset.x > SWIPE_THRESHOLD && onAccept) {
            onAccept();
          } else if (offset.x < -SWIPE_THRESHOLD && onReject) {
            onReject();
          }

          y.set(0);
        }}
        whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
        animate={{ scale: 1 }}
        className="relative w-full h-full"
      >
        {front}

        {/* Indicador de skip (swipe up) */}
        <motion.div
          style={{ opacity: useTransform(y, [-50, 0], [1, 0]) }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 border-2 border-blue-500/50"
        >
          <span className="text-xs text-blue-300">↑ Skip</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SwipeableSRSCard;
