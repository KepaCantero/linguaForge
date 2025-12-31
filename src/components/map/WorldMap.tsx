'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapNode } from './MapNode';
import { MatrixModal } from './MatrixModal';
import { World, NodeStatus, Matrix } from '@/types';
import { useProgressStore } from '@/store/useProgressStore';
import { loadWorld } from '@/services/contentLoader';

interface WorldMapProps {
  lang: string;
  level: string;
  worldId: string;
}

export function WorldMap({ lang, level, worldId }: WorldMapProps) {
  const router = useRouter();
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatrix, setSelectedMatrix] = useState<Matrix | null>(null);

  const { worldProgress, initWorldProgress } = useProgressStore();
  const progress = worldProgress[worldId];

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await loadWorld(lang as 'fr' | 'de', level as 'A1' | 'A2', worldId);
        setWorld(data);
        initWorldProgress(worldId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading world');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lang, level, worldId, initWorldProgress]);

  const getNodeStatus = (matrixId: string): NodeStatus => {
    // DESBLOQUEAR TODOS LOS NIVELES
    if (!progress) {
      return 'active';
    }

    if (progress.completedMatrices.includes(matrixId)) {
      return 'completed';
    }

    // Todos los nodos están activos (desbloqueados)
    return 'active';
  };

  const getJanusStatus = (): NodeStatus => {
    if (!progress?.janusProgress) return 'active';
    if (progress.janusProgress.isComplete) return 'completed';
    return 'active';
  };

  const handleNodeClick = (matrix: Matrix, status: NodeStatus) => {
    if (status === 'locked') return;
    // Mostrar modal en lugar de navegar directamente
    setSelectedMatrix(matrix);
  };

  const handleJanusClick = () => {
    router.push(`/world/${worldId}/janus`);
  };

  const handleStartMatrix = (matrixId: string) => {
    setSelectedMatrix(null);
    router.push(`/world/${worldId}/matrix/${matrixId}`);
  };

  const handleCloseModal = () => {
    setSelectedMatrix(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  if (error || !world) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <span className="text-4xl mb-4">😢</span>
        <p className="text-gray-600 dark:text-gray-400">{error || 'World not found'}</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header del mundo */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {world.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{world.description}</p>
      </motion.div>

      {/* Mapa de nodos mejorado */}
      <div className="relative flex flex-col items-center gap-0 py-8">
        {/* Janus Matrix Node */}
        <div className="relative z-10">
          <MapNode
            title="Janus Matrix"
            order={0}
            status={getJanusStatus()}
            isJanus
            onClick={handleJanusClick}
          />
        </div>

        {/* Conector SVG desde Janus - Mejorado para tocar el nodo */}
        <svg
          className="absolute top-16 left-1/2 -translate-x-1/2 z-0"
          width="4"
          height="32"
          style={{ top: '64px' }}
        >
          <motion.line
            x1="2"
            y1="0"
            x2="2"
            y2="32"
            stroke="url(#gradient-connector)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          <defs>
            <linearGradient id="gradient-connector" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Matrices de ejercicios */}
        {world.matrices.map((matrix, index) => {
          const status = getNodeStatus(matrix.id);

          return (
            <div key={matrix.id} className="relative z-10" style={{ marginTop: index === 0 ? '32px' : '64px' }}>
              {/* Conector SVG mejorado - Toca ambos nodos */}
              {index > 0 && (
                <svg
                  className="absolute -top-16 left-1/2 -translate-x-1/2 z-0"
                  width="4"
                  height="64"
                >
                  <motion.line
                    x1="2"
                    y1="0"
                    x2="2"
                    y2="64"
                    stroke={status === 'locked' ? '#9ca3af' : 'url(#gradient-connector-main)'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: (index + 1) * 0.1, duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="gradient-connector-main" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              <MapNode
                title={matrix.title}
                order={index + 1}
                status={status}
                onClick={() => handleNodeClick(matrix, status)}
              />
            </div>
          );
        })}

        {/* Indicador de progreso general */}
        <motion.div
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso del mundo
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {progress?.completedMatrices.length || 0} / {world.matrices.length}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((progress?.completedMatrices.length || 0) / world.matrices.length) * 100}%`,
              }}
              transition={{ delay: 0.6, duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Modal de matriz mejorado */}
      {selectedMatrix && (
        <MatrixModal
          matrix={selectedMatrix}
          worldId={worldId}
          onStart={handleStartMatrix}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
