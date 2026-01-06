/**
 * NeuralDashboard - Dashboard Neural Principal
 *
 * Panel central de visualización del músculo cognitivo que integra:
 * - Krashen Rings (Progreso i+1)
 * - Densidad Sináptica (Conexiones neuronales)
 * - Activación de Zonas Cerebrales
 * - Métricas de Riego Neuronal
 * - Neuroplasticidad Score
 *
 * Objetivo: Dar al usuario una visión clara de su progreso neurolingüístico.
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KrashenRings } from './KrashenRings';
import { SynapticDensity, SynapticGrowth, PathwayVisualization } from './SynapticDensity';
import { BrainZoneActivation, UnlockProgress, BRAIN_ZONES } from './BrainZoneActivation';
import type { BrainZoneId } from './BrainZoneActivation';
import type { NeuronalIrrigationMetrics } from '@/services/cognitiveLoadMetrics';

// ============================================================
// TIPOS
// ============================================================

export interface NeuralDashboardProps {
  // Métricas del usuario
  currentLevel: number; // 0-100
  inputLevel?: number; // 0-100
  synapsesCount: number;
  synapticStrength: number;
  activePathways: string[];
  activatedZones: BrainZoneId[];
  neuronalIrrigation?: NeuronalIrrigationMetrics;

  // Configuración
  variant?: 'compact' | 'standard' | 'full';
  showAnimations?: boolean;
  className?: string;

  // Callbacks
  onZoneClick?: (zone: BrainZoneId) => void;
}

export interface NeuralScore {
  overall: number; // 0-100
  breakdown: {
    comprehension: number;
    production: number;
    retention: number;
    fluency: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

// ============================================================
// COMPONENTES
// ============================================================

/**
 * NeuralDashboard - Dashboard principal de visualización neural
 */
export function NeuralDashboard({
  currentLevel,
  inputLevel,
  synapsesCount,
  synapticStrength,
  activePathways,
  activatedZones,
  neuronalIrrigation,
  variant = 'standard',
  className = '',
  onZoneClick,
}: NeuralDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'connections'>('overview');

  // Calcular puntuación neural
  const neuralScore = useMemo(() => {
    const comprehension = currentLevel;
    const production = synapticStrength * 100;
    const retention = Math.min(synapsesCount / 2, 100);
    const fluency = (comprehension + production) / 2;

    const overall = (comprehension + production + retention + fluency) / 4;

    return {
      overall: Math.round(overall),
      breakdown: {
        comprehension: Math.round(comprehension),
        production: Math.round(production),
        retention: Math.round(retention),
        fluency: Math.round(fluency),
      },
      trend: 'improving' as const,
    };
  }, [currentLevel, synapticStrength, synapsesCount]);

  // Vista compacta (solo métricas clave)
  if (variant === 'compact') {
    return (
      <div className={`bg-lf-soft rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-quicksand font-semibold text-white">Neural Score</h3>
          <motion.span
            className="font-inter font-bold text-2xl"
            style={{ color: getScoreColor(neuralScore.overall) }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {neuralScore.overall}
          </motion.span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniMetric label="Nivel" value={currentLevel} color="#6366F1" />
          <MiniMetric label="Sinapsis" value={synapsesCount} color="#22C55E" />
          <MiniMetric label="Fortaleza" value={Math.round(synapticStrength * 100)} color="#F59E0B" suffix="%" />
          <MiniMetric label="Riego" value={neuronalIrrigation?.effectiveMinutes || 0} color="#3B82F6" suffix="min" />
        </div>
      </div>
    );
  }

  // Vista estándar
  return (
    <div className={`bg-lf-dark rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-quicksand font-bold text-xl text-white">Dashboard Neural</h2>
            <p className="font-inter text-sm text-white/80 mt-0.5">
              Visualización de tu progreso cognitivo
            </p>
          </div>
          <div className="text-right">
            <div className="font-inter font-bold text-3xl text-white">
              {neuralScore.overall}
            </div>
            <div className="font-inter text-xs text-white/70">Neural Score</div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex border-b border-gray-700">
        <TabButton
          label="Resumen"
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <TabButton
          label="Zonas"
          active={activeTab === 'zones'}
          onClick={() => setActiveTab('zones')}
        />
        <TabButton
          label="Conexiones"
          active={activeTab === 'connections'}
          onClick={() => setActiveTab('connections')}
        />
      </div>

      {/* Contenido */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab
              key="overview"
              currentLevel={currentLevel}
              {...(inputLevel !== undefined && { inputLevel })}
              neuralScore={neuralScore}
              {...(neuronalIrrigation !== undefined && { neuronalIrrigation })}
            />
          )}

          {activeTab === 'zones' && (
            <ZonesTab
              key="zones"
              currentLevel={currentLevel}
              activatedZones={activatedZones}
              onZoneClick={(zone) => {
                onZoneClick?.(zone);
              }}
            />
          )}

          {activeTab === 'connections' && (
            <ConnectionsTab
              key="connections"
              synapsesCount={synapsesCount}
              synapticStrength={synapticStrength}
              activePathways={activePathways}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// TABS
// ============================================================

/**
 * OverviewTab - Tab de resumen general
 */
function OverviewTab({
  currentLevel,
  inputLevel,
  neuralScore,
  neuronalIrrigation,
}: {
  currentLevel: number;
  inputLevel?: number;
  neuralScore: NeuralScore;
  neuronalIrrigation?: NeuronalIrrigationMetrics;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Krashen Rings */}
      <div className="flex justify-center">
        <KrashenRings
          currentLevel={currentLevel}
          {...(inputLevel !== undefined && { inputLevel })}
          variant="interactive"
          size={200}
        />
      </div>

      {/* Métricas clave */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="Comprensión"
          value={neuralScore.breakdown.comprehension}
          max={100}
          color="#6366F1"
          icon="🧠"
        />
        <MetricCard
          title="Producción"
          value={neuralScore.breakdown.production}
          max={100}
          color="#22C55E"
          icon="🎤"
        />
        <MetricCard
          title="Retención"
          value={neuralScore.breakdown.retention}
          max={100}
          color="#F59E0B"
          icon="💾"
        />
        <MetricCard
          title="Fluidez"
          value={neuralScore.breakdown.fluency}
          max={100}
          color="#EC4899"
          icon="⚡"
        />
      </div>

      {/* Riego Neuronal */}
      {neuronalIrrigation && (
        <div className="bg-lf-soft rounded-lg p-4">
          <h3 className="font-quicksand font-semibold text-white mb-3">Riego Neuronal</h3>
          <div className="space-y-2">
            <NeuronalMetric
              label="Minutos efectivos"
              value={Math.round(neuronalIrrigation.effectiveMinutes)}
              unit="min"
            />
            <NeuronalMetric
              label="Palabras procesadas"
              value={neuronalIrrigation.wordsProcessed}
              unit="palabras"
            />
            <NeuronalMetric
              label="Tasa de riego"
              value={Math.round(neuronalIrrigation.irrigationRate)}
              unit="palabras/min"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * ZonesTab - Tab de zonas cerebrales
 */
function ZonesTab({
  currentLevel,
  activatedZones,
  onZoneClick,
}: {
  currentLevel: number;
  activatedZones: BrainZoneId[];
  onZoneClick?: (zone: BrainZoneId) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Activación cerebral */}
      <div className="flex justify-center">
        <BrainZoneActivation
          currentZones={activatedZones}
          size={280}
          interactive
          {...(onZoneClick !== undefined && { onZoneClick })}
        />
      </div>

      {/* Progreso de desbloqueo */}
      <div>
        <h3 className="font-quicksand font-semibold text-white mb-3">Progreso de Desbloqueo</h3>
        <UnlockProgress currentProgress={currentLevel} />
      </div>

      {/* Información de zonas */}
      <div className="grid grid-cols-2 gap-3">
        {Object.values(BRAIN_ZONES).map((zone) => {
          const isActive = activatedZones.includes(zone.id);
          return (
            <div
              key={zone.id}
              className={`p-3 rounded-lg border-2 ${
                isActive
                  ? ''
                  : 'opacity-40'
              }`}
              style={{
                backgroundColor: isActive ? zone.color + '20' : 'transparent',
                borderColor: zone.color,
              }}
            >
              <div className="font-quicksand font-semibold text-sm mb-1" style={{ color: zone.color }}>
                {zone.name}
              </div>
              <div className="font-inter text-xs text-gray-400">
                {isActive ? 'Activo' : 'Inactivo'}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/**
 * ConnectionsTab - Tab de conexiones sinápticas
 */
function ConnectionsTab({
  synapsesCount,
  synapticStrength,
  activePathways,
}: {
  synapsesCount: number;
  synapticStrength: number;
  activePathways: string[];
}) {
  const pathwaysData = useMemo(() => {
    const colors = ['#6366F1', '#22C55E', '#F59E0B', '#EC4899'];
    return activePathways.map((pathway, index) => ({
      name: pathway,
      activity: 0.5 + Math.random() * 0.5,
      color: colors[index % colors.length],
    }));
  }, [activePathways]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Visualización de densidad sináptica */}
      <div className="flex justify-center">
        <SynapticDensity
          connectionCount={synapsesCount}
          strength={synapticStrength * 100}
          activePathways={activePathways}
          size={280}
        />
      </div>

      {/* Crecimiento sináptico */}
      <div>
        <h3 className="font-quicksand font-semibold text-white mb-3">Crecimiento Sináptico</h3>
        <SynapticGrowth
          currentConnections={synapsesCount}
          totalConnections={200}
        />
      </div>

      {/* Vías activas */}
      {activePathways.length > 0 && (
        <div>
          <h3 className="font-quicksand font-semibold text-white mb-3">Vías Neuronales Activas</h3>
          <PathwayVisualization pathways={pathwaysData} />
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

/**
 * TabButton - Botón de tab
 */
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 font-quicksand font-medium text-sm transition-colors relative ${
        active
          ? 'text-white'
          : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
        />
      )}
    </button>
  );
}

/**
 * MiniMetric - Métrica mini
 */
function MiniMetric({
  label,
  value,
  color,
  suffix = '',
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="bg-lf-dark/50 rounded p-2 text-center">
      <div className="font-inter text-xs text-gray-400">{label}</div>
      <div className="font-inter font-semibold text-sm" style={{ color }}>
        {value}
        {suffix}
      </div>
    </div>
  );
}

/**
 * MetricCard - Tarjeta de métrica
 */
function MetricCard({
  title,
  value,
  max,
  color,
  icon,
}: {
  title: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="bg-lf-soft rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-inter font-bold text-xl" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="font-quicksand font-medium text-sm text-white mb-2">{title}</div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

/**
 * NeuronalMetric - Métrica neuronal
 */
function NeuronalMetric({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-inter text-sm text-gray-400">{label}</span>
      <span className="font-inter font-semibold text-white">
        {value} <span className="text-xs text-gray-500">{unit}</span>
      </span>
    </div>
  );
}

// ============================================================
// UTILIDADES
// ============================================================

/**
 * getScoreColor - Obtiene el color según el score
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'; // Green
  if (score >= 60) return '#6366F1'; // Indigo
  if (score >= 40) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
}

export default NeuralDashboard;
