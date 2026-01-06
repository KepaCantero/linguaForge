'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NeuralDashboard } from '@/components/visualization/NeuralDashboard';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useCognitiveLoad } from '@/store/useCognitiveLoadStore';
import { useMissionStore } from '@/store/useMissionStore';
import type { BrainZoneId } from '@/components/visualization/BrainZoneActivation';

export default function DashboardPage() {
  const { xp, level, rank } = useGamificationStore();
  const { load } = useCognitiveLoad();
  const { dailyMissions } = useMissionStore();

  // Métricas derivadas
  const synapsesCount = useMemo(() => {
    // Sinapsas basadas en XP y ejercicios completados
    return Math.floor(xp / 10) + (level * 100);
  }, [xp, level]);

  const synapticStrength = useMemo(() => {
    // Fortaleza basada en nivel y carga cognitiva germana
    return Math.min(100, level * 5 + load.germane);
  }, [level, load.germane]);

  const activePathways = useMemo(() => {
    // Vías activas basadas en misiones completadas
    const completed = dailyMissions.filter(m => m.completed).length;
    const pathways = [];

    if (completed >= 1) pathways.push('comprehension');
    if (completed >= 2) pathways.push('production');
    if (completed >= 3) pathways.push('retention');
    if (completed >= 4) pathways.push('fluency');

    return pathways;
  }, [dailyMissions]);

  const activatedZones = useMemo(() => {
    // Zonas activas basadas en carga cognitiva
    const zones: BrainZoneId[] = [];

    if (load.germane > 60) zones.push('prefrontal');
    if (load.germane > 40) zones.push('temporal');
    if (load.intrinsic > 50) zones.push('parietal');
    if (load.germane > 30 && load.extraneous < 40) zones.push('broca');
    if (load.germane > 70) zones.push('wernicke');

    return zones;
  }, [load]);

  const neuronalIrrigation = useMemo(() => ({
    // Métricas de riego neuronal
    totalMinutes: Math.floor(xp / 10), // Estimado basado en XP
    effectiveMinutes: Math.floor((xp / 10) * (load.germane / 100)),
    wordsProcessed: synapsesCount * 10, // Estimado
    comprehensionLevel: load.germane / 100,
    irrigationRate: Math.max(0, load.germane),
    streakDays: 0, // Se obtendría del store de gamificación
    lastIrrigationTime: Date.now(),
  }), [xp, synapsesCount, load]);

  const currentLevel = useMemo(() => {
    // Nivel actual 0-100 basado en XP dentro del nivel actual
    const xpForCurrentLevel = level * 1000;
    const xpForNextLevel = (level + 1) * 1000;
    const progress = (xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);
    return Math.round(progress * 100);
  }, [xp, level]);

  const inputLevel = useMemo(() => {
    // Nivel de input basado en misiones de input completadas
    const inputMissions = dailyMissions.filter(m => m.type === 'input' && m.completed).length;
    return Math.min(100, inputMissions * 25);
  }, [dailyMissions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-indigo-500/20 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🧠</span>
            Dashboard Neural
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Visualiza tu progreso cognitivo
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-2xl font-bold text-white">{level}</div>
            <div className="text-xs text-gray-400">Nivel</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
            <div className="text-2xl mb-1">✨</div>
            <div className="text-2xl font-bold text-amber-400">{xp.toLocaleString()}</div>
            <div className="text-xs text-gray-400">XP Total</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
            <div className="text-2xl mb-1">🔗</div>
            <div className="text-2xl font-bold text-green-400">{synapsesCount.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Sinapsis</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
            <div className="text-2xl mb-1">🏅</div>
            <div className="text-2xl font-bold text-purple-400">{rank}</div>
            <div className="text-xs text-gray-400">Rango</div>
          </div>
        </motion.div>

        {/* Neural Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NeuralDashboard
            currentLevel={currentLevel}
            inputLevel={inputLevel}
            synapsesCount={synapsesCount}
            synapticStrength={synapticStrength}
            activePathways={activePathways}
            activatedZones={activatedZones}
            neuronalIrrigation={neuronalIrrigation}
            variant="standard"
            showAnimations={true}
          />
        </motion.div>

        {/* Cognitive Load Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/20"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Estado Cognitivo Actual</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Carga Intrínseca</span>
                <span className="text-blue-400">{Math.round(load.intrinsic)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${load.intrinsic}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Carga Extraña</span>
                <span className="text-amber-400">{Math.round(load.extraneous)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${load.extraneous}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Carga Germana (Aprendizaje)</span>
                <span className="text-green-400">{Math.round(load.germane)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${load.germane}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
