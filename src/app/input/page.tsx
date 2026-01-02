'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInputStore } from '@/store/useInputStore';
import { useSRSStore, selectDueCount, selectHasCardsToReview } from '@/store/useSRSStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { estimateSessionDuration } from '@/lib/sm2';
import { formatDuration } from '@/services/youtubeService';

// ============================================
// COMPONENTES INTERNOS
// ============================================

function MetricCard({
  icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  color: 'indigo' | 'emerald' | 'amber' | 'purple';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
          {subValue && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InputTypeCard({
  href,
  icon,
  title,
  description,
  stats,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  stats?: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        className={`
          relative overflow-hidden rounded-2xl p-6 cursor-pointer
          bg-gradient-to-br ${color}
          hover:shadow-lg transition-shadow
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative z-10">
          <span className="text-4xl mb-4 block">{icon}</span>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-white/80 text-sm mb-3">{description}</p>
          {stats && (
            <p className="text-white/60 text-xs">{stats}</p>
          )}
        </div>

        {/* Decoración de fondo */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-8 translate-y-8" />
      </motion.div>
    </Link>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function InputHubPage() {
  const [mounted, setMounted] = useState(false);

  // Stores
  const inputStats = useInputStore((state) => state.getStats('fr', 'A1'));
  const srsStats = useSRSStore((state) => state.getStats());
  const dueCount = useSRSStore(selectDueCount);
  const hasCardsToReview = useSRSStore(selectHasCardsToReview);
  const { streak } = useGamificationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Calcular métricas
  const totalInputMinutes = (inputStats?.minutesListened || 0) + (inputStats?.minutesRead || 0);
  const totalInputHours = totalInputMinutes / 60;
  const todayMinutes = 0; // TODO: Implementar tracking diario
  const dailyGoal = 30; // minutos
  const dailyProgress = Math.min(100, (todayMinutes / dailyGoal) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/tree"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                INPUT
              </h1>
            </div>

            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <span>🔥</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{streak}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Panel de Progreso */}
        <section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4 opacity-90">Tu Progreso de Input</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-3xl font-bold">{totalInputHours.toFixed(1)}h</p>
              <p className="text-sm opacity-75">Total input</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{srsStats.totalCards}</p>
              <p className="text-sm opacity-75">Frases SRS</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{Math.round(srsStats.retentionRate)}%</p>
              <p className="text-sm opacity-75">Retención</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{inputStats?.wordsHeard || 0}</p>
              <p className="text-sm opacity-75">Palabras oídas</p>
            </div>
          </div>

          {/* Barra de progreso diario */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Hoy: {todayMinutes} min</span>
              <span>Meta: {dailyGoal} min</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            {dailyProgress >= 100 && (
              <p className="text-sm text-center">✅ ¡Meta diaria completada!</p>
            )}
          </div>
        </section>

        {/* Tipos de Input */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Elige tu Input
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputTypeCard
              href="/input/video"
              icon="🎬"
              title="VIDEO"
              description="YouTube y más"
              stats={`${formatDuration((inputStats?.minutesListened || 0) * 60 * 0.6)} vistos`}
              color="from-red-500 to-pink-600"
            />

            <InputTypeCard
              href="/input/audio"
              icon="🎧"
              title="AUDIO"
              description="Podcasts y diálogos"
              stats={`${formatDuration((inputStats?.minutesListened || 0) * 60 * 0.4)} escuchados`}
              color="from-green-500 to-teal-600"
            />

            <InputTypeCard
              href="/input/text"
              icon="📖"
              title="TEXTO"
              description="Historias y diálogos"
              stats={`${inputStats?.wordsRead || 0} palabras leídas`}
              color="from-blue-500 to-indigo-600"
            />
          </div>
        </section>

        {/* SRS Review */}
        {hasCardsToReview && (
          <section>
            <Link href="/input/srs">
              <motion.div
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 cursor-pointer"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Repaso SRS
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dueCount > 0
                          ? `${dueCount} tarjetas pendientes`
                          : `${srsStats.newCards} tarjetas nuevas`}
                        {' · '}
                        ~{estimateSessionDuration(dueCount || srsStats.newCards)} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {dueCount > 0 && (
                      <span className="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
                        {dueCount}
                      </span>
                    )}
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </Link>
          </section>
        )}

        {/* Recomendación */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Recomendado para ti
          </h2>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm cursor-pointer"
            whileHover={{ scale: 1.01 }}
          >
            <Link href="/input/video?v=demo" className="flex items-center gap-4">
              <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🎬
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  French A1 - Salutations de base
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Basado en tu progreso en saludos
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  5:30 · Video con transcripción
                </p>
              </div>
              <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-full transition-colors">
                Ver
              </button>
            </Link>
          </motion.div>
        </section>

        {/* Métricas detalladas */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Métricas
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon="🎬"
              label="Video"
              value={formatDuration((inputStats?.minutesListened || 0) * 60 * 0.6)}
              color="indigo"
            />
            <MetricCard
              icon="🎧"
              label="Audio"
              value={formatDuration((inputStats?.minutesListened || 0) * 60 * 0.4)}
              color="emerald"
            />
            <MetricCard
              icon="📖"
              label="Texto"
              value={`${inputStats?.wordsRead || 0}`}
              subValue="palabras"
              color="amber"
            />
            <MetricCard
              icon="📚"
              label="SRS"
              value={`${srsStats.graduatedCards}`}
              subValue="dominadas"
              color="purple"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
