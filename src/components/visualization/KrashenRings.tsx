/**
 * KrashenRings - Visualización de los Anillos de Input de Krashen
 *
 * Basado en la Hipótesis del Input de Stephen Krashen (i+1):
 * - Anillo interior (i): Nivel actual de confort - material ya dominado
 * - Anillo medio (i+1): Zona óptima de aprendizaje - input comprensible
 * - Anillo exterior (i+2+): Zona de desafío - material que requiere esfuerzo
 *
 * Visualiza el progreso del estudiante y sugiere contenido adecuado.
 */

'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

// ============================================================
// TIPOS
// ============================================================

export interface KrashenRingsProps {
  currentLevel: number; // 0-100, nivel actual del estudiante
  inputLevel?: number; // 0-100, nivel del contenido actual
  showLabels?: boolean;
  size?: number;
  className?: string;
  variant?: 'compact' | 'full' | 'interactive';
  onZoneClick?: (zone: 'comfort' | 'learning' | 'challenge') => void;
}

export interface KrashenZone {
  id: string;
  name: string;
  description: string;
  color: string;
  minLevel: number;
  maxLevel: number;
  recommendation: string;
}

// ============================================================
// CONSTANTES
// ============================================================

// Zonas de aprendizaje según Krashen
export const KRASHEN_ZONES: Record<string, KrashenZone> = {
  comfort: {
    id: 'comfort',
    name: 'Zona de Confort (i)',
    description: 'Material que ya dominas',
    color: '#22C55E', // Green 500
    minLevel: 0,
    maxLevel: 60,
    recommendation: 'Repaso y mantenimiento',
  },
  learning: {
    id: 'learning',
    name: 'Zona de Aprendizaje (i+1)',
    description: 'Input comprensible óptimo',
    color: '#6366F1', // Indigo 500
    minLevel: 40,
    maxLevel: 80,
    recommendation: '¡Ideal para aprender!',
  },
  challenge: {
    id: 'challenge',
    name: 'Zona de Desafío (i+2+)',
    description: 'Material con vocabulario nuevo',
    color: '#F59E0B', // Amber 500
    minLevel: 70,
    maxLevel: 100,
    recommendation: 'Desafíate con apoyo',
  },
};

// ============================================================
// COMPONENTES
// ============================================================

/**
 * KrashenRings - Visualización principal de los anillos
 */
export function KrashenRings({
  currentLevel,
  inputLevel,
  showLabels = true,
  size = 280,
  className = '',
  variant = 'full',
  onZoneClick,
}: KrashenRingsProps) {
  // Determinar en qué zona se encuentra el estudiante
  const currentZone = useMemo(() => {
    if (currentLevel < 50) return 'comfort';
    if (currentLevel < 80) return 'learning';
    return 'challenge';
  }, [currentLevel]);

  // Determinar si el input es apropiado
  const inputAppropriateness = useMemo(() => {
    if (!inputLevel) return null;

    const diff = Math.abs(inputLevel - currentLevel);

    if (diff <= 15) return 'optimal'; // i+1 perfecto
    if (diff <= 30) return 'good'; // aceptable
    if (inputLevel > currentLevel + 30) return 'too-hard'; // i+3 o más
    return 'too-easy'; // muy por debajo del nivel
  }, [currentLevel, inputLevel]);

  // Renderizado compacto (sin animaciones complejas)
  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`}>
        <svg width={size / 2} height={size / 2} viewBox="0 0 140 140">
          {/* Anillo exterior - Zona de desafío */}
          <circle
            cx="70"
            cy="70"
            r="65"
            fill="none"
            stroke={currentZone === 'challenge' ? KRASHEN_ZONES.challenge.color : '#FEE2E2'}
            strokeWidth="8"
            opacity={currentZone === 'challenge' ? 1 : 0.3}
          />
          {/* Anillo medio - Zona de aprendizaje */}
          <circle
            cx="70"
            cy="70"
            r="50"
            fill="none"
            stroke={currentZone === 'learning' ? KRASHEN_ZONES.learning.color : '#DBEAFE'}
            strokeWidth="8"
            opacity={currentZone === 'learning' ? 1 : 0.5}
          />
          {/* Anillo interior - Zona de confort */}
          <circle
            cx="70"
            cy="70"
            r="35"
            fill="none"
            stroke={currentZone === 'comfort' ? KRASHEN_ZONES.comfort.color : '#DCFCE7'}
            strokeWidth="8"
            opacity={currentZone === 'comfort' ? 1 : 0.7}
          />
          {/* Indicador de nivel actual */}
          <motion.circle
            cx="70"
            cy="70"
            r="8"
            fill={KRASHEN_ZONES[currentZone].color}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      </div>
    );
  }

  // Renderizado completo con animaciones
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 280 280" className="overflow-visible">
        {/* Definiciones de gradientes */}
        <defs>
          <linearGradient id="gradient-comfort" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="gradient-learning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="gradient-challenge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Anillo exterior - Zona de desafío (i+2+) */}
        <g
          className="cursor-pointer"
          onClick={() => onZoneClick?.('challenge')}
        >
          <motion.circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke="url(#gradient-challenge)"
            strokeWidth="16"
            opacity={currentZone === 'challenge' ? 1 : 0.25}
            filter={currentZone === 'challenge' ? 'url(#glow)' : undefined}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: currentZone === 'challenge' ? 1 : 0.25 }}
            transition={{ duration: 0.5 }}
          />
          {showLabels && currentZone === 'challenge' && (
            <motion.text
              x="140"
              y="35"
              textAnchor="middle"
              className="font-quicksand font-semibold text-sm"
              fill="#F59E0B"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              i+2+
            </motion.text>
          )}
        </g>

        {/* Anillo medio - Zona de aprendizaje (i+1) */}
        <g
          className="cursor-pointer"
          onClick={() => onZoneClick?.('learning')}
        >
          <motion.circle
            cx="140"
            cy="140"
            r="100"
            fill="none"
            stroke="url(#gradient-learning)"
            strokeWidth="16"
            opacity={currentZone === 'learning' ? 1 : 0.5}
            filter={currentZone === 'learning' ? 'url(#glow)' : undefined}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: currentZone === 'learning' ? 1 : 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          {showLabels && currentZone === 'learning' && (
            <motion.text
              x="140"
              y="65"
              textAnchor="middle"
              className="font-quicksand font-semibold text-base"
              fill="#6366F1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              i+1
            </motion.text>
          )}
        </g>

        {/* Anillo interior - Zona de confort (i) */}
        <g
          className="cursor-pointer"
          onClick={() => onZoneClick?.('comfort')}
        >
          <motion.circle
            cx="140"
            cy="140"
            r="70"
            fill="none"
            stroke="url(#gradient-comfort)"
            strokeWidth="16"
            opacity={currentZone === 'comfort' ? 1 : 0.7}
            filter={currentZone === 'comfort' ? 'url(#glow)' : undefined}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: currentZone === 'comfort' ? 1 : 0.7 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          {showLabels && currentZone === 'comfort' && (
            <motion.text
              x="140"
              y="95"
              textAnchor="middle"
              className="font-quicksand font-semibold text-sm"
              fill="#22C55E"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              i
            </motion.text>
          )}
        </g>

        {/* Indicador de nivel actual */}
        <motion.circle
          cx="140"
          cy="140"
          r="15"
          fill={KRASHEN_ZONES[currentZone].color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
        />
        <motion.text
          x="140"
          y="145"
          textAnchor="middle"
          className="font-inter font-bold text-lg"
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {Math.round(currentLevel)}
        </motion.text>

        {/* Indicador de input si está disponible */}
        {inputLevel !== undefined && (
          <g>
            {/* Línea punteada al nivel de input */}
            <motion.line
              x1="140"
              y1="140"
              x2="240"
              y2="80"
              stroke={inputAppropriateness === 'optimal' ? '#22C55E' : inputAppropriateness === 'good' ? '#6366F1' : '#EF4444'}
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            />
            {/* Círculo de nivel de input */}
            <motion.circle
              cx="240"
              cy="80"
              r="12"
              fill={inputAppropriateness === 'optimal' ? '#22C55E' : inputAppropriateness === 'good' ? '#6366F1' : '#EF4444'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 }}
            />
            <motion.text
              x="240"
              y="84"
              textAnchor="middle"
              className="font-inter font-semibold text-xs"
              fill="white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {inputLevel}
            </motion.text>
          </g>
        )}
      </svg>

      {/* Labels descriptivos */}
      {variant === 'full' && showLabels && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <ZoneLabel zone={KRASHEN_ZONES.comfort} isActive={currentZone === 'comfort'} />
          <ZoneLabel zone={KRASHEN_ZONES.learning} isActive={currentZone === 'learning'} />
          <ZoneLabel zone={KRASHEN_ZONES.challenge} isActive={currentZone === 'challenge'} />
        </div>
      )}

      {/* Indicador de apropiación del input */}
      {inputLevel !== undefined && inputAppropriateness && (
        <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
          inputAppropriateness === 'optimal'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : inputAppropriateness === 'good'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : inputAppropriateness === 'too-hard'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          {inputAppropriateness === 'optimal' && '✨ Nivel perfecto de input (i+1)'}
          {inputAppropriateness === 'good' && '👍 Nivel apropiado'}
          {inputAppropriateness === 'too-hard' && '⚠️ Material avanzado - necesitas apoyo'}
          {inputAppropriateness === 'too-easy' && '📚 Material de repaso'}
        </div>
      )}
    </div>
  );
}

/**
 * ZoneLabel - Etiqueta de zona
 */
function ZoneLabel({ zone, isActive }: { zone: KrashenZone; isActive: boolean }) {
  return (
    <motion.div
      className={`p-2 rounded-lg border-2 ${
        isActive
          ? ''
          : 'opacity-50'
      }`}
      style={{
        backgroundColor: isActive ? zone.color + '20' : 'transparent',
        borderColor: zone.color,
      }}
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
    >
      <div className="text-xs font-semibold" style={{ color: zone.color }}>
        {zone.name}
      </div>
    </motion.div>
  );
}

/**
 * KrashenProgress - Barra de progreso con indicador de zona
 */
export function KrashenProgress({
  currentLevel,
  className = '',
}: {
  currentLevel: number;
  className?: string;
}) {
  const currentZone = currentLevel < 50 ? 'comfort' : currentLevel < 80 ? 'learning' : 'challenge';

  return (
    <div className={`relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      {/* Fondo con zonas marcadas */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-green-200 dark:bg-green-900/30" title="Zona de confort" />
        <div className="w-1/3 bg-indigo-200 dark:bg-indigo-900/30" title="Zona de aprendizaje" />
        <div className="flex-1 bg-amber-200 dark:bg-amber-900/30" title="Zona de desafío" />
      </div>

      {/* Indicador de progreso */}
      <motion.div
        className="absolute top-0 bottom-0 rounded-full"
        style={{
          backgroundColor: KRASHEN_ZONES[currentZone].color,
          left: 0,
          right: `${100 - currentLevel}%`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${currentLevel}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Marcadores de zona */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-1/2 border-r border-gray-400 dark:border-gray-600 h-full" />
        <div className="w-1/3 border-r border-gray-400 dark:border-gray-600 h-full" />
      </div>
    </div>
  );
}

/**
 * useKrashenZone - Hook para determinar la zona de aprendizaje
 */
export function useKrashenZone(currentLevel: number) {
  const zone = currentLevel < 50 ? 'comfort' : currentLevel < 80 ? 'learning' : 'challenge';
  return {
    zone,
    zoneInfo: KRASHEN_ZONES[zone],
    isInLearningZone: zone === 'learning',
    isReadyForNextLevel: currentLevel >= 75,
    needsReview: currentLevel < 40,
  };
}

export default KrashenRings;
