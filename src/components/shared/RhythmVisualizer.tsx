"use client";

import { motion } from "framer-motion";

export interface RhythmPattern {
  segments: number[]; // Duración de cada segmento en ms
  pauses: number[]; // Duración de pausas entre segmentos
}

// Calcular similitud de ritmo
// Acepta tanto RhythmPattern como number[] para compatibilidad
export function calculateRhythmSimilarity(
  nativePattern: RhythmPattern | number[],
  userPattern: RhythmPattern | number[]
): number {
  // Normalizar a arrays de segmentos
  const nativeSegments = Array.isArray(nativePattern)
    ? nativePattern
    : nativePattern.segments;
  const userSegments = Array.isArray(userPattern)
    ? userPattern
    : userPattern.segments;

  if (!nativeSegments.length || !userSegments.length) {
    return 0;
  }

  let totalSimilarity = 0;
  const maxSegments = Math.max(nativeSegments.length, userSegments.length);

  for (let i = 0; i < maxSegments; i++) {
    const native = nativeSegments[i] || 0;
    const user = userSegments[i] || 0;

    if (native === 0 && user === 0) {
      totalSimilarity += 100;
    } else if (native === 0 || user === 0) {
      totalSimilarity += 0;
    } else {
      const ratio = Math.min(native, user) / Math.max(native, user);
      totalSimilarity += ratio * 100;
    }
  }

  return totalSimilarity / maxSegments;
}

// Componente de feedback de ritmo
interface RhythmFeedbackProps {
  similarity: number;
  // Props adicionales para compatibilidad (se ignoran pero permiten pasar)
  nativePattern?: RhythmPattern | number[];
  userPattern?: RhythmPattern | number[];
  words?: string[];
  className?: string;
}

export function RhythmFeedback({ similarity, className = "" }: RhythmFeedbackProps) {
  const getFeedback = () => {
    if (similarity >= 90) return { emoji: "🌟", text: "¡Perfecto!", color: "text-green-600" };
    if (similarity >= 80) return { emoji: "✨", text: "¡Excelente!", color: "text-green-500" };
    if (similarity >= 70) return { emoji: "👍", text: "¡Muy bien!", color: "text-blue-500" };
    if (similarity >= 60) return { emoji: "💪", text: "¡Bien!", color: "text-yellow-500" };
    if (similarity >= 50) return { emoji: "🎯", text: "Casi...", color: "text-orange-500" };
    return { emoji: "🔄", text: "Intenta de nuevo", color: "text-red-500" };
  };

  const feedback = getFeedback();

  return (
    <div className={`text-center ${className}`}>
      <span className="text-2xl mr-2">{feedback.emoji}</span>
      <span className={`font-semibold ${feedback.color}`}>{feedback.text}</span>
    </div>
  );
}

interface RhythmVisualizerProps {
  // Acepta RhythmPattern o number[] para compatibilidad
  nativePattern: RhythmPattern | number[];
  userPattern?: RhythmPattern | number[];
  // Propiedades adicionales para compatibilidad con API legacy
  words?: string[];
  showComparison?: boolean;
  similarity?: number; // 0-100
  className?: string;
}

export function RhythmVisualizer({
  nativePattern,
  userPattern,
  words,
  showComparison = true,
  similarity,
  className = "",
}: RhythmVisualizerProps) {
  // Normalizar patrones
  const nativeSegments = Array.isArray(nativePattern)
    ? nativePattern
    : nativePattern.segments;
  const nativePauses = Array.isArray(nativePattern)
    ? []
    : nativePattern.pauses;
  const userSegments = userPattern
    ? Array.isArray(userPattern)
      ? userPattern
      : userPattern.segments
    : undefined;
  const userPauses = userPattern
    ? Array.isArray(userPattern)
      ? []
      : userPattern.pauses
    : undefined;

  const maxSegmentDuration = Math.max(
    ...nativeSegments,
    ...(userSegments || [])
  );

  const normalizeDuration = (duration: number) => {
    if (maxSegmentDuration === 0) return 0;
    return (duration / maxSegmentDuration) * 100;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Patrón nativo */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            🎯 Nativo:
          </span>
        </div>
        <div className="flex items-center gap-1">
          {nativeSegments.map((duration, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <motion.div
                className="bg-indigo-500 rounded"
                initial={{ width: 0, height: 0 }}
                animate={{
                  width: `${Math.max(normalizeDuration(duration), 8)}px`,
                  height: "24px",
                }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
              />
              {words && words[idx] && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {words[idx]}
                </span>
              )}
              {idx < nativePauses.length && (
                <div
                  className="bg-transparent"
                  style={{
                    width: `${normalizeDuration(nativePauses[idx])}px`,
                    height: "24px",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Patrón del usuario (si existe y showComparison es true) */}
      {showComparison && userSegments && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              🎤 Tú:
            </span>
            {similarity !== undefined && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Similitud: {Math.round(similarity)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {userSegments.map((duration, idx) => {
              const nativeDuration = nativeSegments[idx] || 0;
              const diff = Math.abs(duration - nativeDuration);
              const isSimilar = nativeDuration > 0 && diff / nativeDuration < 0.3; // 30% de tolerancia

              return (
                <div key={idx} className="flex items-center gap-1">
                  <motion.div
                    className={`rounded ${
                      isSimilar ? "bg-green-500" : "bg-orange-500"
                    }`}
                    initial={{ width: 0, height: 0 }}
                    animate={{
                      width: `${Math.max(normalizeDuration(duration), 8)}px`,
                      height: "24px",
                    }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                  />
                  {userPauses && idx < userPauses.length && (
                    <div
                      className="bg-transparent"
                      style={{
                        width: `${normalizeDuration(userPauses[idx])}px`,
                        height: "24px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de similitud */}
      {similarity !== undefined && showComparison && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Similitud de ritmo</span>
            <span>{Math.round(similarity)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                similarity >= 80
                  ? "bg-green-500"
                  : similarity >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${similarity}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
