/**
 * SynapticDensity - Visualización de Densidad Sináptica
 *
 * Representa la fortaleza de las conexiones neuronales a través de:
 * - Nodos (neuronas) que crecen y se fortalecen
 * - Conexiones (sinapsis) que se forman entre conceptos
 * - Actividad eléctrica que muestra el flujo de información
 *
 * Métricas visualizadas:
 * - Connection count: Número de sinapsis formadas
 * - Synaptic strength: Fortaleza promedio de las conexiones
 * - Active pathways: Rutas neuronales activas recientemente
 */

'use client';

import { motion } from 'framer-motion';
import { useMemo, useState, useRef } from 'react';

// ============================================================
// TIPOS
// ============================================================

export interface Synapse {
  id: string;
  from: string;
  to: string;
  strength: number; // 0-1
  lastActivated: number;
  pathway?: string; // 'auditory', 'visual', 'semantic', etc.
}

export interface Neuron {
  id: string;
  x: number;
  y: number;
  activation: number; // 0-1
  type: 'input' | 'hidden' | 'output';
  label?: string;
}

export interface SynapticDensityProps {
  synapses?: Synapse[];
  neurons?: Neuron[];
  strength?: number; // 0-100
  connectionCount?: number;
  activePathways?: string[];
  showAnimation?: boolean;
  size?: number;
  className?: string;
  variant?: 'minimal' | 'standard' | 'detailed';
}

export interface SynapticCluster {
  id: string;
  neurons: Neuron[];
  synapses: Synapse[];
  label: string;
  color: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const COLORS = {
  weak: '#94A3B8',      // Slate 400 - Sinapsis débules
  medium: '#6366F1',    // Indigo 500 - Sinapsis medias
  strong: '#22C55E',    // Green 500 - Sinapsis fuertes
  active: '#FDE047',    // Yellow 300 - Sinapsis activas
  background: '#0F172A', // Slate 900 - Fondo
};

const NEURON_SIZE = {
  input: 8,
  hidden: 6,
  output: 10,
};

// ============================================================
// COMPONENTES
// ============================================================

/**
 * SynapticDensity - Visualización principal de densidad sináptica
 */
export function SynapticDensity({
  synapses = [],
  neurons = [],
  strength = 50,
  connectionCount = 0,
  activePathways = [],
  showAnimation = true,
  size = 400,
  className = '',
  variant = 'standard',
}: SynapticDensityProps) {
  const [hoveredSynapse, setHoveredSynapse] = useState<string | null>(null);
  const [activeNeuron, setActiveNeuron] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generar neuronas y sinapsis simuladas si no se proporcionan
  const { displayNeurons, displaySynapses } = useMemo(() => {
    if (neurons.length > 0 && synapses.length > 0) {
      return { displayNeurons: neurons, displaySynapses: synapses };
    }

    // Generar visualización basada en métricas
    const simulatedNeurons: Neuron[] = [];
    const simulatedSynapses: Synapse[] = [];

    const neuronCount = Math.min(50, 10 + Math.floor(connectionCount / 5));
    const synapseCount = Math.min(100, connectionCount);

    // Crear neuronas en patrón de red neuronal
    const layers = 3;
    const neuronsPerLayer = Math.ceil(neuronCount / layers);

    for (let layer = 0; layer < layers; layer++) {
      for (let i = 0; i < neuronsPerLayer; i++) {
        if (simulatedNeurons.length >= neuronCount) break;

        const x = (layer / (layers - 1)) * 0.8 + 0.1;
        const y = (i / neuronsPerLayer) * 0.8 + 0.1;

        simulatedNeurons.push({
          id: `n-${layer}-${i}`,
          x: x * size,
          y: y * size,
          activation: Math.random() * 0.5,
          type: layer === 0 ? 'input' : layer === layers - 1 ? 'output' : 'hidden',
          ...(layer === 0 ? { label: 'Input' } : layer === layers - 1 ? { label: 'Output' } : {}),
        });
      }
    }

    // Crear sinapsis entre neuronas de capas adyacentes
    const inputNeurons = simulatedNeurons.filter(n => n.type === 'input');
    const hiddenNeurons = simulatedNeurons.filter(n => n.type === 'hidden');
    const outputNeurons = simulatedNeurons.filter(n => n.type === 'output');

    for (let i = 0; i < synapseCount; i++) {
      let from: Neuron | undefined;
      let to: Neuron | undefined;

      if (i < synapseCount * 0.4) {
        // Input to Hidden
        from = inputNeurons[Math.floor(Math.random() * inputNeurons.length)];
        to = hiddenNeurons[Math.floor(Math.random() * hiddenNeurons.length)];
      } else {
        // Hidden to Output
        from = hiddenNeurons[Math.floor(Math.random() * hiddenNeurons.length)];
        to = outputNeurons[Math.floor(Math.random() * outputNeurons.length)];
      }

      if (from && to) {
        simulatedSynapses.push({
          id: `s-${i}`,
          from: from.id,
          to: to.id,
          strength: strength / 100,
          lastActivated: Date.now() - Math.random() * 10000,
          pathway: activePathways[Math.floor(Math.random() * activePathways.length)] as string || 'semantic',
        });
      }
    }

    return { displayNeurons: simulatedNeurons, displaySynapses: simulatedSynapses };
  }, [neurons, synapses, strength, connectionCount, activePathways, size]);

  return (
    <div
      ref={canvasRef}
      className={`relative bg-lf-dark rounded-xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        {/* Conexiones (sinapsis) */}
        {displaySynapses.map((synapse) => {
          const fromNeuron = displayNeurons.find(n => n.id === synapse.from);
          const toNeuron = displayNeurons.find(n => n.id === synapse.to);

          if (!fromNeuron || !toNeuron) return null;

          const isHovered = hoveredSynapse === synapse.id;
          const isActive = activePathways.includes(synapse.pathway || '');
          const isStrong = synapse.strength > 0.7;

          return (
            <SynapseLine
              key={synapse.id}
              x1={fromNeuron.x}
              y1={fromNeuron.y}
              x2={toNeuron.x}
              y2={toNeuron.y}
              strength={synapse.strength}
              isHovered={isHovered}
              isActive={isActive}
              isStrong={isStrong}
              showAnimation={showAnimation}
              onHover={() => setHoveredSynapse(synapse.id)}
              onHoverEnd={() => setHoveredSynapse(null)}
            />
          );
        })}

        {/* Neuronas */}
        {displayNeurons.map((neuron) => (
          <NeuronCircle
            key={neuron.id}
            neuron={neuron}
            size={NEURON_SIZE[neuron.type]}
            isActive={activeNeuron === neuron.id}
            onHover={() => setActiveNeuron(neuron.id)}
            onHoverEnd={() => setActiveNeuron(null)}
          />
        ))}
      </svg>

      {/* Métricas superpuestas */}
      {variant === 'detailed' && (
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-xs">
          <div className="text-gray-300">Sinapsis: {connectionCount}</div>
          <div className="text-gray-300">Fortaleza: {Math.round(strength)}%</div>
          <div className="text-gray-300">Vías activas: {activePathways.length}</div>
        </div>
      )}
    </div>
  );
}

/**
 * SynapseLine - Línea de sinapsis con animación
 */
function SynapseLine({
  x1,
  y1,
  x2,
  y2,
  strength,
  isHovered,
  isActive,
  isStrong,
  showAnimation,
  onHover,
  onHoverEnd,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strength: number;
  isHovered: boolean;
  isActive: boolean;
  isStrong: boolean;
  showAnimation: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
}) {
  // Color basado en fortaleza
  const color = isStrong ? COLORS.strong : strength > 0.5 ? COLORS.medium : COLORS.weak;
  const strokeWidth = isHovered ? 3 : strength * 2 + 0.5;
  const opacity = isHovered ? 1 : strength * 0.7 + 0.3;

  return (
    <g onMouseEnter={onHover} onMouseLeave={onHoverEnd} className="cursor-pointer">
      {/* Línea base */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeLinecap="round"
      />

      {/* Pulso de actividad */}
      {showAnimation && (isActive || isStrong) && (
        <motion.circle
          r={3}
          fill={COLORS.active}
          initial={{ cx: x1, cy: y1, opacity: 1 }}
          animate={{
            cx: [x1, x2],
            cy: [y1, y2],
            opacity: [1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Brillo al hover */}
      {isHovered && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={strokeWidth + 2}
          opacity={0.3}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/**
 * NeuronCircle - Círculo de neurona con animación
 */
function NeuronCircle({
  neuron,
  size,
  isActive,
  onHover,
  onHoverEnd,
}: {
  neuron: Neuron;
  size: number;
  isActive: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
}) {
  const baseColor = neuron.type === 'input' ? '#3B82F6' : neuron.type === 'output' ? '#22C55E' : '#6366F1';

  return (
    <g onMouseEnter={onHover} onMouseLeave={onHoverEnd} className="cursor-pointer">
      {/* Círculo base */}
      <circle
        cx={neuron.x}
        cy={neuron.y}
        r={size}
        fill={baseColor}
        opacity={0.6 + neuron.activation * 0.4}
      />

      {/* Pulso de activación */}
      {isActive && (
        <motion.circle
          cx={neuron.x}
          cy={neuron.y}
          r={size}
          fill={baseColor}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      )}

      {/* Etiqueta para input/output */}
      {neuron.label && (
        <text
          x={neuron.x}
          y={neuron.y - size - 4}
          textAnchor="middle"
          className="font-quicksand font-semibold text-xs"
          fill="white"
          fontSize="10"
        >
          {neuron.label}
        </text>
      )}
    </g>
  );
}

/**
 * SynapticHeatmap - Mapa de calor de actividad sináptica
 */
export function SynapticHeatmap({
  data,
  size = 200,
}: {
  data: number[][]; // Matriz de valores 0-1
  size?: number;
}) {
  return (
    <div
      className="grid gap-0.5 bg-gray-900 rounded-lg p-1"
      style={{ width: size, height: size, gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
    >
      {data.flat().map((value, index) => (
        <motion.div
          key={index}
          className="rounded-sm"
          style={{
            backgroundColor: `rgba(99, 102, 241, ${value})`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.01 }}
        />
      ))}
    </div>
  );
}

/**
 * SynapticGrowth - Visualización de crecimiento sináptico
 */
export function SynapticGrowth({
  currentConnections,
  totalConnections = 100,
  className = '',
}: {
  currentConnections: number;
  totalConnections?: number;
  className?: string;
}) {
  const growth = Math.min(currentConnections / totalConnections, 1);
  const percentage = Math.round(growth * 100);

  return (
    <div className={`relative w-full h-4 bg-gray-800 rounded-full overflow-hidden ${className}`}>
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900" />

      {/* Barra de crecimiento */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Partículas de crecimiento */}
      <div className="absolute inset-0 overflow-hidden">
        {[...new Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 bottom-0 w-1 bg-white/30"
            initial={{ x: '-10%' }}
            animate={{
              x: [`${i * 20}%`, `${i * 20 + 100}%`],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Etiqueta de porcentaje */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-inter font-semibold text-sm text-white">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

/**
 * PathwayVisualization - Visualización de vías neuronales activas
 */
export function PathwayVisualization({
  pathways,
  className = '',
}: {
  pathways: Array<{ name: string; activity: number; color: string }>;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {pathways.map((pathway) => (
        <div key={pathway.name} className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: pathway.color }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-quicksand font-medium text-sm text-gray-300">
                {pathway.name}
              </span>
              <span className="font-inter text-xs text-gray-400">
                {Math.round(pathway.activity * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: pathway.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pathway.activity * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SynapticDensity;
