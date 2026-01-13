/**
 * BrainZoneActivation - Visualización de Zonas de Desbloqueo Cerebral
 *
 * Muestra las áreas del cerebro que se activan durante el aprendizaje:
 * - Prefrontal: Planificación, toma de decisiones, memoria de trabajo
 * - Temporal: Procesamiento auditivo, comprensión del lenguaje
 * - Parietal: Procesamiento espacial, atención
 * - Occipital: Procesamiento visual
 * - Cerebelo: Coordinación motora, automatización
 * - Broca/Wernicke: Producción y comprensión del lenguaje
 *
 * Basado en neuroplasticidad y las 4 zonas de desbloqueo del MASTER_PLAN.
 */

'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

// ============================================================
// TIPOS
// ============================================================

export type BrainZoneId =
  | 'prefrontal'
  | 'temporal'
  | 'parietal'
  | 'occipital'
  | 'cerebellum'
  | 'broca'
  | 'wernicke';

export interface BrainZone {
  id: BrainZoneId;
  name: string;
  description: string;
  color: string;
  defaultPosition: { x: number; y: number };
  functions: string[];
  relatedSkills: string[];
}

export interface ZoneActivation {
  zone: BrainZoneId;
  level: number; // 0-1
  timestamp: number;
}

export interface BrainZoneActivationProps {
  activations?: ZoneActivation[];
  currentZones?: BrainZoneId[];
  size?: number;
  showLabels?: boolean;
  interactive?: boolean;
  onZoneClick?: (zone: BrainZoneId) => void;
  className?: string;
}

// ============================================================
// CONSTANTES - Zonas cerebrales y sus funciones
// ============================================================

export const BRAIN_ZONES: Record<BrainZoneId, BrainZone> = {
  prefrontal: {
    id: 'prefrontal',
    name: 'Corteza Prefrontal',
    description: 'Planificación y memoria de trabajo',
    color: 'var(--sky-500)', // Indigo 500
    defaultPosition: { x: 50, y: 25 },
    functions: ['Planificación', 'Toma de decisiones', 'Memoria de trabajo', 'Atención ejecutiva'],
    relatedSkills: ['gramática', 'construcción de frases', 'estrategia'],
  },
  temporal: {
    id: 'temporal',
    name: 'Lóbulo Temporal',
    description: 'Procesamiento auditivo y memoria',
    color: 'var(--accent-500)', // Green 500
    defaultPosition: { x: 75, y: 50 },
    functions: ['Procesamiento auditivo', 'Comprensión verbal', 'Memoria declarativa'],
    relatedSkills: ['escucha', 'vocabulario', 'pronunciación'],
  },
  parietal: {
    id: 'parietal',
    name: 'Lóbulo Parietal',
    description: 'Atención y procesamiento espacial',
    color: '#F59E0B', // Amber 500
    defaultPosition: { x: 25, y: 50 },
    functions: ['Atención espacial', 'Manipulación mental', 'Cálculo'],
    relatedSkills: ['lectura', 'escritura', 'matemáticas'],
  },
  occipital: {
    id: 'occipital',
    name: 'Lóbulo Occipital',
    description: 'Procesamiento visual',
    color: '#EC4899', // Pink 500
    defaultPosition: { x: 50, y: 85 },
    functions: ['Procesamiento visual', 'Reconocimiento visual'],
    relatedSkills: ['lectura', 'reconocimiento de palabras'],
  },
  cerebellum: {
    id: 'cerebellum',
    name: 'Cerebelo',
    description: 'Automatización y coordinación',
    color: '#3B82F6', // Blue 500
    defaultPosition: { x: 30, y: 80 },
    functions: ['Coordinación motora', 'Automatización', 'Memoria procedural'],
    relatedSkills: ['pronunciación', 'fluidez', 'automatización'],
  },
  broca: {
    id: 'broca',
    name: 'Área de Broca',
    description: 'Producción del lenguaje',
    color: '#8B5CF6', // Purple 500
    defaultPosition: { x: 70, y: 30 },
    functions: ['Producción del habla', 'Gramática', 'Sintaxis'],
    relatedSkills: ['habla', 'gramática', 'construcción de frases'],
  },
  wernicke: {
    id: 'wernicke',
    name: 'Área de Wernicke',
    description: 'Comprensión del lenguaje',
    color: '#14B8A6', // Teal 500
    defaultPosition: { x: 80, y: 40 },
    functions: ['Comprensión', 'Semántica', 'Procesamiento del lenguaje'],
    relatedSkills: ['escucha', 'comprensión', 'vocabulario'],
  },
};

// Las 4 zonas de desbloqueo del MASTER_PLAN
export const UNLOCK_ZONES = [
  {
    id: 'zone1',
    name: 'Zona 1: Input Comprensible',
    description: 'Activación temporal y occipital',
    zones: ['temporal', 'occipital'],
    unlockThreshold: 30, // 30% de progreso
    color: 'var(--accent-500)',
  },
  {
    id: 'zone2',
    name: 'Zona 2: Producción Guiada',
    description: 'Activación de Broca y Wernicke',
    zones: ['broca', 'wernicke'],
    unlockThreshold: 50,
    color: 'var(--sky-500)',
  },
  {
    id: 'zone3',
    name: 'Zona 3: Automatización',
    description: 'Activación del cerebelo',
    zones: ['cerebellum'],
    unlockThreshold: 70,
    color: '#F59E0B',
  },
  {
    id: 'zone4',
    name: 'Zona 4: Maestría Cognitiva',
    description: 'Activación prefrontal completa',
    zones: ['prefrontal'],
    unlockThreshold: 90,
    color: '#EC4899',
  },
];

// ============================================================
// COMPONENTES
// ============================================================

/**
 * BrainZoneActivation - Visualización principal de zonas cerebrales
 */
export function BrainZoneActivation({
  activations = [],
  currentZones = [],
  size = 400,
  showLabels = true,
  interactive = true,
  onZoneClick,
  className = '',
}: BrainZoneActivationProps) {
  const [hoveredZone, setHoveredZone] = useState<BrainZoneId | null>(null);
  const [selectedZone, setSelectedZone] = useState<BrainZoneId | null>(null);

  // Calcular nivel de activación para cada zona
  const zoneLevels = useMemo(() => {
    const levels: Record<BrainZoneId, number> = {
      prefrontal: 0,
      temporal: 0,
      parietal: 0,
      occipital: 0,
      cerebellum: 0,
      broca: 0,
      wernicke: 0,
    };

    activations.forEach((activation) => {
      // Las activaciones decaen con el tiempo
      const age = Date.now() - activation.timestamp;
      const decay = Math.max(0, 1 - age / 60000); // Decae en 60 segundos
      levels[activation.zone] = Math.max(levels[activation.zone], activation.level * decay);
    });

    // Zonas actualmente activas mantienen nivel mínimo
    currentZones.forEach((zone) => {
      levels[zone] = Math.max(levels[zone], 0.5);
    });

    return levels;
  }, [activations, currentZones]);

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} viewBox="0 0 200 200" className="overflow-visible">
        {/* Silueta del cerebro - forma simplificada */}
        <motion.path
          d="M100,20 C60,20 30,50 30,90 C30,130 50,160 70,170 L130,170 C150,160 170,130 170,90 C170,50 140,20 100,20 Z"
          fill="none"
          stroke="#334155"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Zonas cerebrales */}
        {Object.entries(BRAIN_ZONES).map(([zoneId, zone]) => {
          const level = zoneLevels[zoneId as BrainZoneId];
          const isActive = level > 0.3;
          const isHovered = hoveredZone === zoneId;
          const isSelected = selectedZone === zoneId;

          return (
            <BrainZoneCircle
              key={zoneId}
              zone={zone}
              level={level}
              x={zone.defaultPosition.x * 2}
              y={zone.defaultPosition.y * 2}
              isActive={isActive}
              isHovered={isHovered}
              isSelected={isSelected}
              showLabel={showLabels}
              interactive={interactive}
              onHover={() => setHoveredZone(zoneId as BrainZoneId)}
              onHoverEnd={() => setHoveredZone(null)}
              onClick={() => {
                setSelectedZone(zoneId as BrainZoneId);
                onZoneClick?.(zoneId as BrainZoneId);
              }}
            />
          );
        })}

        {/* Conexiones entre zonas relacionadas */}
        <g opacity="0.3">
          <line
            x1="100"
            y1="50"
            x2="150"
            y2="80"
            stroke="var(--sky-500)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="150"
            y1="80"
            x2="160"
            y2="100"
            stroke="#8B5CF6"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="50"
            y1="100"
            x2="100"
            y2="170"
            stroke="#3B82F6"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </g>
      </svg>

      {/* Panel de información de zona */}
      {(hoveredZone || selectedZone) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 right-0 w-64 bg-calm-bg-primary/95 backdrop-blur-sm rounded-lg p-4 border border-calm-warm-200"
        >
          {hoveredZone && <ZoneInfo zoneId={hoveredZone} level={zoneLevels[hoveredZone]} />}
          {selectedZone && !hoveredZone && <ZoneInfo zoneId={selectedZone} level={zoneLevels[selectedZone]} />}
        </motion.div>
      )}
    </div>
  );
}

/**
 * BrainZoneCircle - Círculo de zona cerebral
 */
function BrainZoneCircle({
  zone,
  level,
  x,
  y,
  isActive,
  isHovered,
  isSelected,
  showLabel,
  interactive,
  onHover,
  onHoverEnd,
  onClick,
}: {
  zone: BrainZone;
  level: number;
  x: number;
  y: number;
  isActive: boolean;
  isHovered: boolean;
  isSelected: boolean;
  showLabel: boolean;
  interactive: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}) {
  const size = 20 + level * 15;
  const opacity = 0.3 + level * 0.7;

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={interactive ? onClick : undefined}
      className={interactive ? 'cursor-pointer' : ''}
    >
      {/* Círculo de activación */}
      <motion.circle
        cx={x}
        cy={y}
        r={size}
        fill={zone.color}
        opacity={opacity}
        initial={{ scale: 0 }}
        animate={{ scale: isActive ? 1 : 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Anillo pulsante si está activa */}
      {isActive && (
        <motion.circle
          cx={x}
          cy={y}
          r={size}
          fill="none"
          stroke={zone.color}
          strokeWidth="2"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Brillo al hover/selection */}
      {(isHovered || isSelected) && (
        <circle
          cx={x}
          cy={y}
          r={size + 5}
          fill="none"
          stroke={zone.color}
          strokeWidth="3"
          opacity="0.5"
        />
      )}

      {/* Etiqueta */}
      {showLabel && (isHovered || isSelected || isActive) && (
        <text
          x={x}
          y={y + size + 12}
          textAnchor="middle"
          className="font-quicksand font-semibold text-xs"
          fill="white"
          fontSize="9"
        >
          {zone.name.split(' ')[0]}
        </text>
      )}
    </g>
  );
}

/**
 * ZoneInfo - Información de zona cerebral
 */
function ZoneInfo({ zoneId, level }: { zoneId: BrainZoneId; level: number }) {
  const zone = BRAIN_ZONES[zoneId];
  const levelPercent = Math.round(level * 100);

  return (
    <div>
      <h3 className="font-quicksand font-semibold text-base mb-2" style={{ color: zone.color }}>
        {zone.name}
      </h3>
      <p className="font-inter text-sm text-calm-text-muted mb-3">{zone.description}</p>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-calm-text-muted">Activación</span>
          <span className="font-inter text-sm font-semibold" style={{ color: zone.color }}>
            {levelPercent}%
          </span>
        </div>
        <div className="h-2 bg-calm-bg-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: zone.color }}
            initial={{ width: 0 }}
            animate={{ width: `${levelPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs text-calm-text-muted block mb-1">Funciones:</span>
        <div className="flex flex-wrap gap-1">
          {zone.functions.map((func) => (
            <span
              key={func}
              className="px-2 py-0.5 bg-calm-bg-elevated rounded text-xs text-calm-text-tertiary"
            >
              {func}
            </span>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs text-calm-text-muted block mb-1">Skills relacionados:</span>
        <div className="flex flex-wrap gap-1">
          {zone.relatedSkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: zone.color + '30', color: zone.color }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * UnlockProgress - Progreso de desbloqueo de las 4 zonas
 */
export function UnlockProgress({
  currentProgress,
  className = '',
}: {
  currentProgress: number; // 0-100
  className?: string;
}) {
  const currentUnlockZone = UNLOCK_ZONES.find(
    (zone) => currentProgress < zone.unlockThreshold
  ) || UNLOCK_ZONES[UNLOCK_ZONES.length - 1];

  const previousZones = UNLOCK_ZONES.filter(
    (zone) => zone.unlockThreshold <= currentProgress
  );

  return (
    <div className={`flex gap-2 ${className}`}>
      {UNLOCK_ZONES.map((zone, index) => {
        const isUnlocked = zone.unlockThreshold <= currentProgress;
        const isCurrent = zone.id === currentUnlockZone.id;
        const isPrevious = previousZones.some((z) => z.id === zone.id);

        return (
          <motion.div
            key={zone.id}
            className="flex-1 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Barra de progreso */}
            <div className="h-12 bg-calm-bg-elevated rounded-lg overflow-hidden relative">
              {/* Fondo */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: isUnlocked ? zone.color + '40' : '#1F2937',
                }}
              />

              {/* Barra de progreso */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-y-0 left-0"
                  style={{ backgroundColor: zone.color }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentProgress - (previousZones.length > 0 ? previousZones[previousZones.length - 1].unlockThreshold : 0)) / (zone.unlockThreshold - (previousZones.length > 0 ? previousZones[previousZones.length - 1].unlockThreshold : 0))) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Completado */}
              {isPrevious && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: zone.color }}
                />
              )}

              {/* Indicador */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isPrevious ? (
                  <span className="font-inter font-bold text-lg">✓</span>
                ) : isCurrent ? (
                  <span className="font-inter font-bold text-xs text-white">
                    {Math.round(currentProgress)}%
                  </span>
                ) : (
                  <span className="font-inter text-calm-text-muted text-xs">🔒</span>
                )}
              </div>
            </div>

            {/* Label */}
            <div className="mt-1 text-center">
              <span className="font-quicksand font-medium text-xs text-calm-text-muted">
                Zona {index + 1}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * ZoneActivationMini - Mini visualización de activación de zonas
 */
export function ZoneActivationMini({
  activations,
  size = 60,
}: {
  activations: Partial<Record<BrainZoneId, number>>;
  size?: number;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Círculo base */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="8" />

        {/* Segmentos de zona */}
        {Object.entries(BRAIN_ZONES).map(([zoneId, zone], index) => {
          const level = activations[zoneId as BrainZoneId] || 0;
          if (level < 0.1) return null;

          const angle = (index / Object.keys(BRAIN_ZONES).length) * 360;
          const radians = (angle - 90) * (Math.PI / 180);
          const x = 50 + Math.cos(radians) * 30;
          const y = 50 + Math.sin(radians) * 30;

          return (
            <circle
              key={zoneId}
              cx={x}
              cy={y}
              r={5 + level * 5}
              fill={zone.color}
              opacity={0.5 + level * 0.5}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default BrainZoneActivation;
