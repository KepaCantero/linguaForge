'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ============================================
// TIPOS
// ============================================

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  maxWidth?: number;
  disabled?: boolean;
}

// ============================================
// CONSTANTES DE POSICIÓN
// ============================================

const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const ARROW_CLASSES: Record<TooltipPosition, string> = {
  top: 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b',
  bottom: 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t',
  left: 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r',
  right: 'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l',
};

// ============================================
// COMPONENTE
// ============================================

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  maxWidth = 250,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReduced = useReducedMotion();

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            role="tooltip"
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 px-3 py-2 text-sm text-white
              bg-lf-dark/95 backdrop-blur-md rounded-lg
              border border-lf-primary/20 shadow-xl
              pointer-events-none
              ${POSITION_CLASSES[position]}
            `}
            style={{ maxWidth, width: 'max-content' }}
          >
            {content}
            {/* Arrow */}
            <div
              className={`
                absolute w-2.5 h-2.5 bg-lf-dark/95 rotate-45
                border-lf-primary/20
                ${ARROW_CLASSES[position]}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// TOOLTIPS PREDEFINIDOS PARA STATS
// ============================================

export const STAT_TOOLTIPS = {
  xp: (
    <div>
      <p className="font-semibold mb-1">⚡ Puntos de Experiencia</p>
      <p className="text-xs text-gray-300">
        Ganas XP completando ejercicios, manteniendo tu racha y subiendo de nivel.
      </p>
    </div>
  ),
  coins: (
    <div>
      <p className="font-semibold mb-1">🪙 Monedas</p>
      <p className="text-xs text-gray-300">
        Usa monedas para desbloquear materiales de construcción y contenido especial.
      </p>
    </div>
  ),
  gems: (
    <div>
      <p className="font-semibold mb-1">💎 Gemas</p>
      <p className="text-xs text-gray-300">
        Gemas premium para congelar racha, skip cooldowns y contenido exclusivo.
      </p>
    </div>
  ),
  streak: (
    <div>
      <p className="font-semibold mb-1">🔥 Racha</p>
      <p className="text-xs text-gray-300">
        Días consecutivos practicando. ¡Mantén tu racha para bonificaciones!
      </p>
    </div>
  ),
  hp: (
    <div>
      <p className="font-semibold mb-1">❤️ Salud</p>
      <p className="text-xs text-gray-300">
        Necesitas HP para practicar. Se recupera con el tiempo o completando ejercicios fáciles.
      </p>
    </div>
  ),
  level: (
    <div>
      <p className="font-semibold mb-1">📊 Nivel</p>
      <p className="text-xs text-gray-300">
        Tu nivel de maestría general. Sube de nivel ganando XP.
      </p>
    </div>
  ),
  synapses: (
    <div>
      <p className="font-semibold mb-1">🧠 Sinapsis</p>
      <p className="text-xs text-gray-300">
        Conexiones neuronales formadas. Representan conceptos que has aprendido y reforzado.
      </p>
    </div>
  ),
  rank: (
    <div>
      <p className="font-semibold mb-1">🏆 Rango</p>
      <p className="text-xs text-gray-300">
        Tu clasificación de cazador: E → D → C → B → A → S. Desbloquea rangos con XP.
      </p>
    </div>
  ),
  cognitiveLoad: (
    <div>
      <p className="font-semibold mb-1">🧪 Carga Cognitiva</p>
      <p className="text-xs text-gray-300 mb-1">
        Basado en la Teoría de Carga Cognitiva (CLT):
      </p>
      <ul className="text-xs text-gray-400 space-y-0.5">
        <li>• <strong>Intrínseca:</strong> Dificultad del material</li>
        <li>• <strong>Germane:</strong> Esfuerzo de aprendizaje útil</li>
        <li>• <strong>Extrínseca:</strong> Distracciones (minimizar)</li>
      </ul>
    </div>
  ),
};

// ============================================
// TOOLTIP CON STAT PREDEFINIDO
// ============================================

interface StatTooltipProps {
  stat: keyof typeof STAT_TOOLTIPS;
  children: ReactNode;
  position?: TooltipPosition;
}

export function StatTooltip({ stat, children, position = 'bottom' }: StatTooltipProps) {
  return (
    <Tooltip content={STAT_TOOLTIPS[stat]} position={position}>
      {children}
    </Tooltip>
  );
}
