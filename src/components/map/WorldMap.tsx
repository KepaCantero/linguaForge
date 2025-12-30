'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapNode } from './MapNode';
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

  const getNodeStatus = (matrixId: string, order: number): NodeStatus => {
    if (!progress) {
      return order === 0 ? 'active' : 'locked';
    }

    if (progress.completedMatrices.includes(matrixId)) {
      return 'completed';
    }

    // La primera matriz no completada está activa
    const completedCount = progress.completedMatrices.length;
    if (order === completedCount) {
      return 'active';
    }

    return order < completedCount ? 'completed' : 'locked';
  };

  const getJanusStatus = (): NodeStatus => {
    if (!progress?.janusProgress) return 'active'; // Janus siempre disponible
    if (progress.janusProgress.isComplete) return 'completed';
    return 'active';
  };

  const handleNodeClick = (matrix: Matrix, status: NodeStatus) => {
    if (status === 'locked') return;
    router.push(`/world/${worldId}/matrix/${matrix.id}`);
  };

  const handleJanusClick = () => {
    router.push(`/world/${worldId}/janus`);
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

      {/* Mapa de nodos */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Janus Matrix Node (siempre primero y especial) */}
        <div className="relative">
          <MapNode
            title="Janus Matrix"
            order={0}
            status={getJanusStatus()}
            isJanus
            onClick={handleJanusClick}
          />
        </div>

        {/* Línea conectora desde Janus */}
        <motion.div
          className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-indigo-400 rounded-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.2 }}
        />

        {/* Matrices de ejercicios */}
        {world.matrices.map((matrix, index) => {
          const status = getNodeStatus(matrix.id, index);
          const isOdd = index % 2 === 0;

          return (
            <div key={matrix.id} className="relative">
              {/* Línea conectora (excepto el primero) */}
              {index > 0 && (
                <motion.div
                  className={`
                    absolute -top-8 left-1/2 -translate-x-1/2
                    w-1 h-8 rounded-full
                    ${status === 'locked'
                      ? 'bg-gray-300 dark:bg-gray-600'
                      : 'bg-gradient-to-b from-indigo-400 to-emerald-400'}
                  `}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: (index + 1) * 0.1 }}
                />
              )}

              {/* Posición alternada para efecto de camino */}
              <motion.div
                className={isOdd ? 'ml-0' : 'mr-0'}
                style={{ marginLeft: isOdd ? 0 : 40, marginRight: isOdd ? 40 : 0 }}
              >
                <MapNode
                  title={matrix.title}
                  order={index + 1}
                  status={status}
                  onClick={() => handleNodeClick(matrix, status)}
                />
              </motion.div>
            </div>
          );
        })}

        {/* Indicador de progreso general */}
        <motion.div
          className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg w-full max-w-sm"
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
    </div>
  );
}
