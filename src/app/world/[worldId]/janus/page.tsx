'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { JanusMatrix } from '@/components/janus/JanusMatrix';
import { IntoningMode } from '@/components/janus/IntoningMode';
import { useProgressStore } from '@/store/useProgressStore';
import { loadWorld } from '@/services/contentLoader';
import { World, JanusColumn } from '@/types';

interface JanusPageProps {
  params: { worldId: string };
}

type ViewMode = 'matrix' | 'intoning';

export default function JanusPage({ params }: JanusPageProps) {
  const { worldId } = params;
  const router = useRouter();
  const { activeLanguage, activeLevel } = useProgressStore();

  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [selectedColumn, setSelectedColumn] = useState<JanusColumn | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await loadWorld(activeLanguage, activeLevel, worldId);
        setWorld(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading world');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeLanguage, activeLevel, worldId]);

  const handleColumnClick = (column: JanusColumn) => {
    setSelectedColumn(column);
    setViewMode('intoning');
  };

  const handleBackToMatrix = () => {
    setViewMode('matrix');
    setSelectedColumn(null);
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
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Back button */}
      {viewMode === 'matrix' && (
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver al mapa</span>
        </button>
      )}

      {viewMode === 'matrix' && (
        <>
          <JanusMatrix
            matrix={world.janusMatrix}
            worldId={worldId}
          />

          {/* Selector de columnas para intoning */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Modo Intoning
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Practica la pronunciación rítmica de cada columna
            </p>
            <div className="grid grid-cols-2 gap-3">
              {world.janusMatrix.columns.map((column) => (
                <motion.button
                  key={column.id}
                  onClick={() => handleColumnClick(column)}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-lg">
                      🎵
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {column.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {column.cells.length} elementos
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'intoning' && selectedColumn && (
        <IntoningMode
          column={selectedColumn}
          worldId={worldId}
          onBack={handleBackToMatrix}
          onComplete={handleBackToMatrix}
        />
      )}
    </div>
  );
}
