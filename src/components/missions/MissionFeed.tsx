'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore, type Mission } from '@/store/useMissionStore';
import { useCognitiveLoad } from '@/store/useCognitiveLoadStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { suggestMissionOrder, shouldTakeBreak } from '@/services/missionGenerator';
import { WarmupGate } from '@/components/warmups';
import type { MissionType as WarmupMissionType, Difficulty } from '@/schemas/warmup';

interface MissionFeedProps {
  onMissionStart?: (mission: Mission) => void;
  showCognitiveLoad?: boolean;
  compact?: boolean;
  sessionMinutes?: number;
}

/**
 * MissionFeed Component
 *
 * Muestra las misiones diarias con:
 * - Indicadores de carga cognitiva
 * - Progreso visual
 * - Sugerencias de orden
 * - Triggers para warmups
 */
export function MissionFeed({
  onMissionStart,
  showCognitiveLoad = true,
  compact = false,
  sessionMinutes = 0,
}: MissionFeedProps) {
  const { dailyMissions } = useMissionStore();
  const { status: loadStatus } = useCognitiveLoad();
  const { level } = useGamificationStore();
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [showWarmupGate, setShowWarmupGate] = useState(false);

  // Ordenar misiones por carga cognitiva óptima
  const sortedMissions = useMemo(
    () => suggestMissionOrder(dailyMissions),
    [dailyMissions]
  );

  // Calcular estadísticas
  const stats = useMemo(() => {
    const completed = dailyMissions.filter((m) => m.completed).length;
    const total = dailyMissions.length;
    const totalXP = dailyMissions.reduce((acc, m) => acc + m.reward.xp, 0);
    const earnedXP = dailyMissions
      .filter((m) => m.completed)
      .reduce((acc, m) => acc + m.reward.xp, 0);
    const estimatedMinutes = dailyMissions
      .filter((m) => !m.completed)
      .reduce((acc, m) => acc + (m.estimatedMinutes || 0), 0);

    return { completed, total, totalXP, earnedXP, estimatedMinutes };
  }, [dailyMissions]);

  // Verificar si todas las misiones están completadas
  const allMissionsComplete = useMemo(() => {
    return dailyMissions.length > 0 && dailyMissions.every((m) => m.completed);
  }, [dailyMissions]);

  // Verificar si debería tomar descanso
  const breakSuggestion = useMemo(() => {
    const completedCount = dailyMissions.filter((m) => m.completed).length;
    const currentLoad = loadStatus === 'overload' ? 90 : loadStatus === 'high' ? 75 : 50;
    return shouldTakeBreak(completedCount, sessionMinutes, currentLoad);
  }, [dailyMissions, sessionMinutes, loadStatus]);

  // Manejar click en misión
  const handleMissionClick = useCallback(
    (mission: Mission) => {
      if (mission.completed) return;

      if (expandedMission === mission.id) {
        // Si ya está expandida, expandir detalles pero no iniciar
        // El inicio se hace con los botones
      } else {
        // Expandir para ver detalles
        setExpandedMission(mission.id);
      }
    },
    [expandedMission]
  );

  // Manejar inicio de warmup (antes de la misión)
  const handleStartWithWarmup = useCallback(
    (mission: Mission) => {
      setActiveMission(mission);
      setShowWarmupGate(true);
    },
    []
  );

  // Manejar inicio directo de misión (sin warmup)
  const handleStartMission = useCallback(
    (mission: Mission) => {
      setActiveMission(null);
      setShowWarmupGate(false);
      onMissionStart?.(mission);
    },
    [onMissionStart]
  );

  // Manejar completar warmup
  const handleWarmupComplete = useCallback(
    (score: number) => {
      console.log(`Warmup completed with score: ${score}`);
      // El score se guarda en el store, no necesitamos hacer nada más aquí
    },
    []
  );

  // Manejar saltar warmup
  const handleWarmupSkip = useCallback(() => {
    console.log('Warmup skipped');
  }, []);

  // Manejar comenzar misión después de warmup
  const handleMissionStartAfterWarmup = useCallback(() => {
    if (activeMission) {
      setShowWarmupGate(false);
      onMissionStart?.(activeMission);
      setActiveMission(null);
    }
  }, [activeMission, onMissionStart]);

  // Obtener color de carga cognitiva
  const getLoadColor = (load: number) => {
    if (load <= 30) return 'bg-green-500';
    if (load <= 50) return 'bg-blue-500';
    if (load <= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Obtener icono de tipo de misión
  const getMissionIcon = (type: Mission['type']) => {
    const icons: Record<string, string> = {
      input: '🎧',
      exercises: '📝',
      janus: '🔀',
      forgeMandate: '⚔️',
      streak: '🔥',
    };
    return icons[type] || '📌';
  };

  // Obtener color de dificultad
  const getDifficultyColor = (difficulty?: 'low' | 'medium' | 'high') => {
    switch (difficulty) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-amber-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (dailyMissions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No hay misiones disponibles.</p>
        <p className="text-sm mt-2">Las misiones se generan cada día.</p>
      </div>
    );
  }

  return (
    <>
      {/* WarmupGate Modal */}
      <AnimatePresence>
        {showWarmupGate && activeMission && (
          <WarmupGate
            missionId={activeMission.id}
            missionType={(activeMission.warmupMissionType || 'mixed') as WarmupMissionType}
            missionTitle={activeMission.title}
            difficulty={(activeMission.difficulty || 'medium') as Difficulty}
            userLevel={level}
            onWarmupComplete={handleWarmupComplete}
            onWarmupSkip={handleWarmupSkip}
            onStartMission={handleMissionStartAfterWarmup}
          />
        )}
      </AnimatePresence>

      <div className={`space-y-4 ${compact ? 'space-y-2' : ''}`}>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 rounded-xl">
        <div>
          <h3 className="text-lg font-semibold text-white">Misiones del Día</h3>
          <p className="text-sm text-gray-400">
            {stats.completed}/{stats.total} completadas
          </p>
        </div>
        <div className="text-right">
          <p className="text-amber-400 font-medium">
            {stats.earnedXP}/{stats.totalXP} XP
          </p>
          {stats.estimatedMinutes > 0 && (
            <p className="text-xs text-gray-500">
              ~{stats.estimatedMinutes} min restantes
            </p>
          )}
        </div>
      </div>

      {/* Sugerencia de descanso */}
      <AnimatePresence>
        {breakSuggestion.shouldBreak && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-xl"
          >
            <p className="text-indigo-300 text-sm">
              💡 {breakSuggestion.reason}
            </p>
            <p className="text-indigo-400 text-xs mt-1">
              Recomendación: {breakSuggestion.recommendedMinutes} min de descanso
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de misiones */}
      <div className="space-y-3">
        {sortedMissions.map((mission, index) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={index}
            isExpanded={expandedMission === mission.id}
            showCognitiveLoad={showCognitiveLoad}
            compact={compact}
            onClick={() => handleMissionClick(mission)}
            onWarmup={() => handleStartWithWarmup(mission)}
            onStartDirect={() => handleStartMission(mission)}
            getLoadColor={getLoadColor}
            getMissionIcon={getMissionIcon}
            getDifficultyColor={getDifficultyColor}
          />
        ))}
      </div>

      {/* Bonus por completar todo */}
      {allMissionsComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-amber-900/40 to-amber-600/20 border border-amber-500/30 rounded-xl text-center"
        >
          <p className="text-amber-400 font-semibold">
            🎉 ¡Todas las misiones completadas!
          </p>
          <p className="text-amber-300/70 text-sm mt-1">
            +50 XP bonus ganados
          </p>
        </motion.div>
      )}
      </div>
    </>
  );
}

// ============================================================
// SUBCOMPONENTE: MissionCard
// ============================================================

interface MissionCardProps {
  mission: Mission;
  index: number;
  isExpanded: boolean;
  showCognitiveLoad: boolean;
  compact: boolean;
  onClick: () => void;
  onWarmup: () => void;
  onStartDirect: () => void;
  getLoadColor: (load: number) => string;
  getMissionIcon: (type: Mission['type']) => string;
  getDifficultyColor: (difficulty?: 'low' | 'medium' | 'high') => string;
}

function MissionCard({
  mission,
  index,
  isExpanded,
  showCognitiveLoad,
  compact,
  onClick,
  onWarmup,
  onStartDirect,
  getLoadColor,
  getMissionIcon,
  getDifficultyColor,
}: MissionCardProps) {
  const progress = Math.min(100, (mission.current / mission.target) * 100);
  const isComplete = mission.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
        isComplete
          ? 'bg-green-900/20 border border-green-500/30'
          : isExpanded
          ? 'bg-gray-800/80 border border-indigo-500/50 shadow-lg shadow-indigo-500/10'
          : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
      } ${compact ? 'p-3' : 'p-4'}`}
      onClick={onClick}
    >
      {/* Barra de progreso de fondo */}
      <div
        className={`absolute inset-0 ${isComplete ? 'bg-green-500/10' : 'bg-indigo-500/5'}`}
        style={{ width: `${progress}%` }}
      />

      <div className="relative z-10">
        {/* Header de la misión */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getMissionIcon(mission.type)}</span>
            <div>
              <h4
                className={`font-medium ${
                  isComplete ? 'text-green-400 line-through' : 'text-white'
                }`}
              >
                {mission.title}
              </h4>
              <p className="text-sm text-gray-400">{mission.description}</p>
            </div>
          </div>

          {/* Estado de completado */}
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-lg">✓</span>
            </motion.div>
          )}
        </div>

        {/* Barra de progreso */}
        {!compact && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-sm text-gray-400 min-w-[60px] text-right">
              {mission.current}/{mission.target}
            </span>
          </div>
        )}

        {/* Detalles expandidos */}
        <AnimatePresence>
          {isExpanded && !isComplete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700/50"
            >
              <div className="flex flex-wrap gap-4 text-sm">
                {/* Recompensa */}
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">+{mission.reward.xp} XP</span>
                  <span className="text-yellow-400">+{mission.reward.coins} 🪙</span>
                  {mission.reward.gems && (
                    <span className="text-purple-400">+{mission.reward.gems} 💎</span>
                  )}
                </div>

                {/* Dificultad */}
                {mission.difficulty && (
                  <div className={`${getDifficultyColor(mission.difficulty)}`}>
                    {mission.difficulty === 'low' && '⬇️ Fácil'}
                    {mission.difficulty === 'medium' && '➡️ Media'}
                    {mission.difficulty === 'high' && '⬆️ Difícil'}
                  </div>
                )}

                {/* Tiempo estimado */}
                {mission.estimatedMinutes && (
                  <div className="text-gray-400">
                    ⏱️ ~{mission.estimatedMinutes} min
                  </div>
                )}
              </div>

              {/* Indicador de carga cognitiva */}
              {showCognitiveLoad && mission.cognitiveLoadTarget && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Carga Cognitiva</span>
                    <span>{mission.cognitiveLoadTarget}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getLoadColor(mission.cognitiveLoadTarget)}`}
                      style={{ width: `${mission.cognitiveLoadTarget}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="mt-4 flex gap-3">
                {mission.warmupMissionType && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onWarmup();
                    }}
                    className="flex-1 py-2 px-4 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    🧠 Con Calentamiento
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartDirect();
                  }}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  ▶️ Comenzar Directo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default MissionFeed;
