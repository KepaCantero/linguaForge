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
    color: 'var(--accent-500)', // Green 500
    minLevel: 0,
    maxLevel: 60,
    recommendation: 'Repaso y mantenimiento',
  },
  learning: {
    id: 'learning',
    name: 'Zona de Aprendizaje (i+1)',
    description: 'Input comprensible óptimo',
    color: 'var(--sky-500)', // Indigo 500
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
// HELPER FUNCTIONS
// ============================================================

function getCurrentZone(currentLevel: number): 'comfort' | 'learning' | 'challenge' {
  if (currentLevel < 50) return 'comfort';
  if (currentLevel < 80) return 'learning';
  return 'challenge';
}

function getInputAppropriateness(currentLevel: number, inputLevel?: number): 'optimal' | 'good' | 'too-hard' | 'too-easy' | null {
  if (!inputLevel) return null;
  const diff = Math.abs(inputLevel - currentLevel);
  if (diff <= 15) return 'optimal';
  if (diff <= 30) return 'good';
  if (inputLevel > currentLevel + 30) return 'too-hard';
  return 'too-easy';
}

function getInputBadgeColor(appropriateness: 'optimal' | 'good' | 'too-hard' | 'too-easy'): string {
  const colors = {
    optimal: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300',
    good: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    'too-hard': 'bg-semantic-error-bg dark:bg-semantic-error-bg text-semantic-error-text dark:text-semantic-error-text',
    'too-easy': 'bg-calm-bg-secondary dark:bg-calm-bg-elevated text-calm-text-secondary dark:text-calm-text-tertiary',
  };
  return colors[appropriateness];
}

function getInputBadgeLabel(appropriateness: 'optimal' | 'good' | 'too-hard' | 'too-easy'): string {
  const labels = {
    optimal: '✨ Nivel perfecto de input (i+1)',
    good: '👍 Nivel apropiado',
    'too-hard': '⚠️ Material avanzado - necesitas apoyo',
    'too-easy': '📚 Material de repaso',
  };
  return labels[appropriateness];
}

// ============================================================
// SUB-COMPONENTES
// ============================================================

// SVG Definitions - gradients and filters
function SvgDefinitions() {
  return (
    <defs>
      <linearGradient id="gradient-comfort" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--accent-500)" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#16A34A" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="gradient-learning" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--sky-500)" stopOpacity="0.8" />
        <stop offset="100%" stopColor="var(--sky-600)" stopOpacity="0.9" />
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
  );
}

// KrashenRing - individual ring component
interface KrashenRingProps {
  zone: 'comfort' | 'learning' | 'challenge';
  currentZone: 'comfort' | 'learning' | 'challenge';
  showLabel: boolean;
  onClick?: () => void;
}

function KrashenRing({ zone, currentZone, showLabel, onClick }: KrashenRingProps) {
  const isActive = currentZone === zone;
  const config = {
    comfort: { r: 70, label: 'i', labelY: 95, delay: 0.2, opacity: isActive ? 1 : 0.7 },
    learning: { r: 100, label: 'i+1', labelY: 65, delay: 0.1, opacity: isActive ? 1 : 0.5 },
    challenge: { r: 130, label: 'i+2+', labelY: 35, delay: 0, opacity: isActive ? 1 : 0.25 },
  }[zone];

  return (
    <g className="cursor-pointer" onClick={onClick}>
      <motion.circle
        cx="140"
        cy="140"
        r={config.r}
        fill="none"
        stroke={`url(#gradient-${zone})`}
        strokeWidth="16"
        opacity={config.opacity}
        filter={isActive ? 'url(#glow)' : undefined}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: config.opacity }}
        transition={{ duration: 0.5, delay: config.delay }}
      />
      {showLabel && isActive && (
        <motion.text
          x="140"
          y={config.labelY}
          textAnchor="middle"
          className="font-quicksand font-semibold text-sm"
          fill={KRASHEN_ZONES[zone].color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + config.delay }}
        >
          {config.label}
        </motion.text>
      )}
    </g>
  );
}

// CurrentLevelIndicator - center indicator showing current level
interface CurrentLevelIndicatorProps {
  currentLevel: number;
  currentZone: 'comfort' | 'learning' | 'challenge';
}

function CurrentLevelIndicator({ currentLevel, currentZone }: CurrentLevelIndicatorProps) {
  return (
    <>
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
    </>
  );
}

// InputLevelIndicator - shows input level relative to current level
interface InputLevelIndicatorProps {
  inputLevel: number;
  appropriateness: 'optimal' | 'good' | 'too-hard' | 'too-easy';
}

function InputLevelIndicator({ inputLevel, appropriateness }: InputLevelIndicatorProps) {
  const color = appropriateness === 'optimal' ? 'var(--accent-500)' : appropriateness === 'good' ? 'var(--sky-500)' : '#EF4444';

  return (
    <g>
      <motion.line
        x1="140"
        y1="140"
        x2="240"
        y2="80"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      />
      <motion.circle
        cx="240"
        cy="80"
        r="12"
        fill={color}
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
  );
}

// InputAppropriatenessBadge - shows badge with input level message
interface InputAppropriatenessBadgeProps {
  appropriateness: 'optimal' | 'good' | 'too-hard' | 'too-easy';
}

function InputAppropriatenessBadge({ appropriateness }: InputAppropriatenessBadgeProps) {
  return (
    <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${getInputBadgeColor(appropriateness)}`}>
      {getInputBadgeLabel(appropriateness)}
    </div>
  );
}

// ZoneLabel - label component for zones
function ZoneLabel({ zone, isActive }: { zone: KrashenZone; isActive: boolean }) {
  return (
    <motion.div
      className={`p-2 rounded-lg border-2 ${isActive ? '' : 'opacity-50'}`}
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

// CompactKrashenRings - compact variant without complex animations
function CompactKrashenRings({ currentZone, size }: { currentZone: 'comfort' | 'learning' | 'challenge'; size: number }) {
  return (
    <div className="relative inline-block">
      <svg width={size / 2} height={size / 2} viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r="65"
          fill="none"
          stroke={currentZone === 'challenge' ? KRASHEN_ZONES.challenge.color : '#FEE2E2'}
          strokeWidth="8"
          opacity={currentZone === 'challenge' ? 1 : 0.3}
        />
        <circle
          cx="70"
          cy="70"
          r="50"
          fill="none"
          stroke={currentZone === 'learning' ? KRASHEN_ZONES.learning.color : '#DBEAFE'}
          strokeWidth="8"
          opacity={currentZone === 'learning' ? 1 : 0.5}
        />
        <circle
          cx="70"
          cy="70"
          r="35"
          fill="none"
          stroke={currentZone === 'comfort' ? KRASHEN_ZONES.comfort.color : '#DCFCE7'}
          strokeWidth="8"
          opacity={currentZone === 'comfort' ? 1 : 0.7}
        />
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

// ============================================================
// MAIN COMPONENT
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
  const currentZone = getCurrentZone(currentLevel);
  const inputAppropriateness = getInputAppropriateness(currentLevel, inputLevel);

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={className}>
        <CompactKrashenRings currentZone={currentZone} size={size} />
      </div>
    );
  }

  // Full variant with animations
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 280 280" className="overflow-visible">
        <SvgDefinitions />

        {/* Rings */}
        <KrashenRing
          zone="challenge"
          currentZone={currentZone}
          showLabel={showLabels}
          onClick={() => onZoneClick?.('challenge')}
        />
        <KrashenRing
          zone="learning"
          currentZone={currentZone}
          showLabel={showLabels}
          onClick={() => onZoneClick?.('learning')}
        />
        <KrashenRing
          zone="comfort"
          currentZone={currentZone}
          showLabel={showLabels}
          onClick={() => onZoneClick?.('comfort')}
        />

        {/* Current level indicator */}
        <CurrentLevelIndicator currentLevel={currentLevel} currentZone={currentZone} />

        {/* Input level indicator */}
        {inputLevel !== undefined && inputAppropriateness && (
          <InputLevelIndicator inputLevel={inputLevel} appropriateness={inputAppropriateness} />
        )}
      </svg>

      {/* Zone labels */}
      {variant === 'full' && showLabels && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <ZoneLabel zone={KRASHEN_ZONES.comfort} isActive={currentZone === 'comfort'} />
          <ZoneLabel zone={KRASHEN_ZONES.learning} isActive={currentZone === 'learning'} />
          <ZoneLabel zone={KRASHEN_ZONES.challenge} isActive={currentZone === 'challenge'} />
        </div>
      )}

      {/* Input appropriateness badge */}
      {inputLevel !== undefined && inputAppropriateness && (
        <InputAppropriatenessBadge appropriateness={inputAppropriateness} />
      )}
    </div>
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
    <div className={`relative h-4 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden ${className}`}>
      {/* Fondo con zonas marcadas */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-accent-200 dark:bg-accent-900/30" title="Zona de confort" />
        <div className="w-1/3 bg-accent-200 dark:bg-accent-900/30" title="Zona de aprendizaje" />
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
        <div className="w-1/2 border-r border-calm-warm-200 dark:border-calm-warm-200 h-full" />
        <div className="w-1/3 border-r border-calm-warm-200 dark:border-calm-warm-200 h-full" />
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
