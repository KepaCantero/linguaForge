/**
 * useCardMotion - Custom hook para manejar todos los motion values de la tarjeta
 * Agrupa useMotionValue, useTransform, y useSpring relacionados con animaciones
 */

import { useMotionValue, useTransform, useSpring } from 'framer-motion';
import type { TextureProperties } from '@/lib/textures';
import { getPhysicsConfig } from '@/lib/textures';

const SWIPE_THRESHOLD = 100;
const ROTATION_RANGE = 15;

export function useCardMotion(texture: TextureProperties) {
  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Configuración de física
  const physicsConfig = getPhysicsConfig(texture);

  // Springs para animaciones suaves
  const springX = useSpring(x, physicsConfig);
  const springY = useSpring(y, physicsConfig);
  const springRotateY = useSpring(rotateY, {
    stiffness: 200,
    damping: 30,
  });

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

  // Sombra dinámica basada en elevación
  const shadowY = useTransform(y, [-50, 0, 50], [20, 12, 4]);
  const shadowBlur = useTransform(y, [-50, 0, 50], [30, 20, 10]);
  const shadowOpacity = useTransform(y, [-50, 0, 50], [0.3, 0.15, 0.05]);

  // Transformación completa de la sombra
  const shadowTransform = useTransform(
    [shadowY, shadowBlur, shadowOpacity],
    ([sy, sb, so]) => `0 ${sy}px ${sb}px rgba(0, 0, 0, ${so})`
  );

  return {
    x,
    y,
    rotateY,
    springX,
    springY,
    springRotateY,
    rotate,
    scale,
    leftIndicatorOpacity,
    rightIndicatorOpacity,
    shadowTransform,
  };
}
