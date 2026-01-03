'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SessionMetrics, CognitiveLoadMetrics } from '@/store/useCognitiveLoadStore';

interface SessionSummaryProps {
  session: SessionMetrics;
  cognitiveLoad: CognitiveLoadMetrics;
  focusModeUsed: boolean;
  focusDuration?: number; // segundos en modo focus
  onClose: () => void;
  onViewDetails?: () => void;
  onShareProgress?: () => void;
}

/**
 * SessionSummary Component
 *
 * Muestra un resumen completo de la sesión de estudio incluyendo:
 * - Estadísticas de rendimiento
 * - Métricas de carga cognitiva
 * - Visualización del progreso
 * - Recomendaciones personalizadas
 */
export function SessionSummary({
  session,
  cognitiveLoad,
  focusModeUsed,
  focusDuration = 0,
  onClose,
  onViewDetails,
  onShareProgress,
}: SessionSummaryProps) {
  // Calcular métricas derivadas
  const metrics = useMemo(() => {
    const durationSeconds = (Date.now() - session.startTime) / 1000;
    const durationMinutes = Math.floor(durationSeconds / 60);
    const accuracy = session.totalAttempts > 0
      ? (session.correctAnswers / session.totalAttempts) * 100
      : 0;
    const avgTimePerExercise = session.exercisesCompleted > 0
      ? durationSeconds / session.exercisesCompleted
      : 0;

    return {
      durationMinutes,
      durationSeconds,
      accuracy,
      avgTimePerExercise,
      exercisesPerMinute: durationMinutes > 0
        ? session.exercisesCompleted / durationMinutes
        : session.exercisesCompleted,
    };
  }, [session]);

  // Determinar el estado general de la sesión
  const sessionRating = useMemo(() => {
    let score = 0;

    // Puntos por precisión
    if (metrics.accuracy >= 90) score += 3;
    else if (metrics.accuracy >= 75) score += 2;
    else if (metrics.accuracy >= 60) score += 1;

    // Puntos por ejercicios completados
    if (session.exercisesCompleted >= 20) score += 3;
    else if (session.exercisesCompleted >= 10) score += 2;
    else if (session.exercisesCompleted >= 5) score += 1;

    // Puntos por carga cognitiva óptima
    if (cognitiveLoad.total >= 40 && cognitiveLoad.total <= 70) score += 2;

    // Puntos por carga germana alta
    if (cognitiveLoad.germane >= 60) score += 2;

    if (score >= 8) return { level: 'excellent', emoji: '🌟', label: 'Excelente' };
    if (score >= 5) return { level: 'good', emoji: '✨', label: 'Bueno' };
    if (score >= 3) return { level: 'fair', emoji: '👍', label: 'Regular' };
    return { level: 'basic', emoji: '📚', label: 'Completado' };
  }, [metrics, session, cognitiveLoad]);

  // Generar insights
  const insights = useMemo(() => {
    const items: { icon: string; text: string; type: 'positive' | 'neutral' | 'suggestion' }[] = [];

    // Insights de precisión
    if (metrics.accuracy >= 90) {
      items.push({
        icon: '🎯',
        text: `Excelente precisión: ${metrics.accuracy.toFixed(0)}%`,
        type: 'positive',
      });
    } else if (metrics.accuracy < 70) {
      items.push({
        icon: '📖',
        text: 'Considera repasar el material antes de continuar',
        type: 'suggestion',
      });
    }

    // Insights de velocidad
    if (metrics.avgTimePerExercise < 30) {
      items.push({
        icon: '⚡',
        text: 'Respuestas rápidas y precisas',
        type: 'positive',
      });
    } else if (metrics.avgTimePerExercise > 60) {
      items.push({
        icon: '⏱️',
        text: 'Tómate tu tiempo, pero intenta mantener el ritmo',
        type: 'neutral',
      });
    }

    // Insights de carga cognitiva
    if (cognitiveLoad.germane >= 70) {
      items.push({
        icon: '🧠',
        text: 'Alto nivel de aprendizaje profundo',
        type: 'positive',
      });
    }

    if (cognitiveLoad.extraneous > 50) {
      items.push({
        icon: '🧘',
        text: 'Prueba el modo Focus para reducir distracciones',
        type: 'suggestion',
      });
    }

    // Insights de modo focus
    if (focusModeUsed && focusDuration > 600) {
      items.push({
        icon: '🎯',
        text: `${Math.floor(focusDuration / 60)} minutos en modo Focus`,
        type: 'positive',
      });
    }

    // Insights de duración
    if (metrics.durationMinutes >= 30) {
      items.push({
        icon: '🏃',
        text: `¡${metrics.durationMinutes} minutos de estudio!`,
        type: 'positive',
      });
    }

    return items;
  }, [metrics, cognitiveLoad, focusModeUsed, focusDuration]);

  // Colores para los indicadores de carga
  const getLoadColor = (value: number, isGermane: boolean = false) => {
    if (isGermane) {
      // Para germane, alto es bueno
      if (value >= 60) return 'text-green-400';
      if (value >= 40) return 'text-blue-400';
      return 'text-gray-400';
    }
    // Para otros, bajo es mejor
    if (value <= 40) return 'text-green-400';
    if (value <= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-gray-900 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-5xl mb-3"
          >
            {sessionRating.emoji}
          </motion.div>
          <h2 className="text-2xl font-bold text-white">
            Resumen de Sesión
          </h2>
          <p className="text-gray-400 mt-1">
            {sessionRating.label} - {metrics.durationMinutes} min de estudio
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="p-6 border-b border-gray-800">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-white">
                {session.exercisesCompleted}
              </p>
              <p className="text-sm text-gray-500">Ejercicios</p>
            </div>
            <div>
              <p className={`text-3xl font-bold ${
                metrics.accuracy >= 80 ? 'text-green-400' :
                metrics.accuracy >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {metrics.accuracy.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500">Precisión</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">
                {session.peakLoad}
              </p>
              <p className="text-sm text-gray-500">Carga Pico</p>
            </div>
          </div>
        </div>

        {/* Métricas de Carga Cognitiva */}
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Carga Cognitiva
          </h3>
          <div className="space-y-3">
            {/* Intrinsic */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Intrínseca</span>
                <span className={getLoadColor(cognitiveLoad.intrinsic)}>
                  {cognitiveLoad.intrinsic.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cognitiveLoad.intrinsic}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Complejidad del contenido
              </p>
            </div>

            {/* Extraneous */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Extraña</span>
                <span className={getLoadColor(cognitiveLoad.extraneous)}>
                  {cognitiveLoad.extraneous.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cognitiveLoad.extraneous}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Distracciones y ruido
              </p>
            </div>

            {/* Germane */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Germana</span>
                <span className={getLoadColor(cognitiveLoad.germane, true)}>
                  {cognitiveLoad.germane.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cognitiveLoad.germane}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-full bg-green-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Aprendizaje profundo (mayor es mejor)
              </p>
            </div>
          </div>
        </div>

        {/* Historial de carga */}
        {session.loadHistory.length > 0 && (
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Evolución de Carga
            </h3>
            <div className="h-16 flex items-end gap-1">
              {session.loadHistory.slice(-20).map((load, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${load}%` }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex-1 rounded-t ${
                    load > 80 ? 'bg-red-500' :
                    load > 60 ? 'bg-amber-500' :
                    'bg-indigo-500'
                  }`}
                  style={{ maxHeight: '100%' }}
                  title={`${load.toFixed(0)}%`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Últimos {Math.min(20, session.loadHistory.length)} puntos de medición
            </p>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Insights
            </h3>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    insight.type === 'positive' ? 'bg-green-900/20 border border-green-500/20' :
                    insight.type === 'suggestion' ? 'bg-amber-900/20 border border-amber-500/20' :
                    'bg-gray-800/50'
                  }`}
                >
                  <span className="text-xl">{insight.icon}</span>
                  <span className={`text-sm ${
                    insight.type === 'positive' ? 'text-green-300' :
                    insight.type === 'suggestion' ? 'text-amber-300' :
                    'text-gray-300'
                  }`}>
                    {insight.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Detalles adicionales */}
        <div className="p-6 border-b border-gray-800">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tiempo promedio</span>
              <span className="text-gray-300">
                {metrics.avgTimePerExercise.toFixed(1)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ritmo</span>
              <span className="text-gray-300">
                {metrics.exercisesPerMinute.toFixed(1)}/min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Correctas</span>
              <span className="text-green-400">
                {session.correctAnswers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Intentos</span>
              <span className="text-gray-300">
                {session.totalAttempts}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-4 flex gap-3">
          {onShareProgress && (
            <button
              onClick={onShareProgress}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              📤 Compartir
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
            >
              Ver Detalles
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SessionSummary;
