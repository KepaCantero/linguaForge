'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JanusColumn } from '@/types';
import { useProgressStore } from '@/store/useProgressStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useTTS } from '@/services/ttsService';
import { JANUS_CONFIG, XP_RULES } from '@/lib/constants';

interface IntoningModeProps {
  column: JanusColumn;
  worldId: string;
  onComplete?: () => void;
  onBack?: () => void;
}

type IntoningPhase = 'intro' | 'listening' | 'repeating' | 'complete';

export function IntoningMode({ column, worldId, onComplete, onBack }: IntoningModeProps) {
  const { worldProgress } = useProgressStore();
  const { addXP } = useGamificationStore();
  const { speak, isSpeaking } = useTTS();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const progressData = useMemo(() => worldProgress[worldId]?.intoningProgress || [], [worldProgress, worldId]);
  const columnProgress = progressData.find(p => p.columnId === column.id);
  const cyclesCompleted = columnProgress?.cyclesCompleted || 0;

  const [phase, setPhase] = useState<IntoningPhase>('intro');
  const [currentCellIndex, setCurrentCellIndex] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(cyclesCompleted);

  const currentCell = column.cells[currentCellIndex];
  const totalCells = column.cells.length;

  // Reproducir audio con TTS
  const playAudio = useCallback((text: string) => {
    speak(text);
  }, [speak]);

  // Avanzar a siguiente celda
  const nextCell = useCallback(() => {
    if (currentCellIndex < totalCells - 1) {
      setCurrentCellIndex(prev => prev + 1);
      setPhase('listening');
    } else {
      // Completar ciclo
      const newCycle = currentCycle + 1;
      setCurrentCycle(newCycle);

      // Actualizar progreso
      const newProgress = progressData.filter(p => p.columnId !== column.id);
      newProgress.push({
        matrixId: worldId,
        columnId: column.id,
        cyclesCompleted: newCycle,
        isComplete: newCycle >= JANUS_CONFIG.intoningCycles,
      });

      // Guardar en store (esto se haría diferente, necesitamos un método específico)
      addXP(XP_RULES.intoningCycleComplete);

      if (newCycle >= JANUS_CONFIG.intoningCycles) {
        setPhase('complete');
        onComplete?.();
      } else {
        // Reiniciar para siguiente ciclo
        setCurrentCellIndex(0);
        setPhase('intro');
      }
    }
  }, [currentCellIndex, totalCells, currentCycle, column.id, worldId, progressData, addXP, onComplete]);

  // Iniciar modo listening
  const startListening = useCallback(() => {
    setPhase('listening');
    playAudio(currentCell.text);
  }, [currentCell.text, playAudio]);

  // Confirmar repetición
  const confirmRepetition = useCallback(() => {
    nextCell();
  }, [nextCell]);

  // Efecto para auto-avanzar a repeating después de listening
  useEffect(() => {
    if (phase === 'listening' && !isSpeaking) {
      const timer = setTimeout(() => setPhase('repeating'), 500);
      return () => clearTimeout(timer);
    }
  }, [phase, isSpeaking]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h2 className="font-bold text-gray-900 dark:text-white">
            Modo Intoning
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {column.label}
          </p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progreso de ciclos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ciclos completados
          </span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {currentCycle}/{JANUS_CONFIG.intoningCycles}
          </span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: JANUS_CONFIG.intoningCycles }).map((_, i) => (
            <div
              key={i}
              className={`
                flex-1 h-2 rounded-full
                ${i < currentCycle
                  ? 'bg-emerald-500'
                  : i === currentCycle
                    ? 'bg-indigo-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }
              `}
            />
          ))}
        </div>
      </div>

      {/* Progreso dentro del ciclo */}
      <div className="flex justify-center gap-2">
        {column.cells.map((_, i) => (
          <motion.div
            key={i}
            className={`
              w-3 h-3 rounded-full
              ${i < currentCellIndex
                ? 'bg-emerald-500'
                : i === currentCellIndex
                  ? 'bg-indigo-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }
            `}
            animate={i === currentCellIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-5xl mb-4 block">🎧</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Ciclo {currentCycle + 1} de {JANUS_CONFIG.intoningCycles}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Escucha cada elemento y repítelo en voz alta con el ritmo correcto
            </p>
            <button
              onClick={startListening}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Comenzar
            </button>
          </motion.div>
        )}

        {phase === 'listening' && (
          <motion.div
            key="listening"
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <span className="text-4xl">🔊</span>
            </motion.div>
            <p className="text-white/80 text-sm mb-2">Escucha...</p>
            <p className="text-white text-2xl font-bold">{currentCell.text}</p>
            <p className="text-white/60 text-sm mt-2">{currentCell.translation}</p>
          </motion.div>
        )}

        {phase === 'repeating' && (
          <motion.div
            key="repeating"
            className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <span className="text-4xl">🎤</span>
            </motion.div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Repite en voz alta:</p>
            <p className="text-gray-900 dark:text-white text-2xl font-bold mb-2">
              {currentCell.text}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {currentCell.translation}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => playAudio(currentCell.text)}
                disabled={isSpeaking}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isSpeaking
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isSpeaking ? '🔊' : '🔄'} Repetir audio
              </button>
              <button
                onClick={confirmRepetition}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                ✓ Listo
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.div
            key="complete"
            className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-white text-xl font-bold mb-2">
              ¡Columna completada!
            </h3>
            <p className="text-white/80 mb-6">
              Has completado {JANUS_CONFIG.intoningCycles} ciclos de intoning para &quot;{column.label}&quot;
            </p>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Volver a Janus Matrix
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
