'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';

export default function InputHubPage() {
  const { activeLanguage, activeLevel } = useProgressStore();
  const inputStore = useInputStore();
  
  const statsKey = `${activeLanguage}-${activeLevel}`;
  const statsData = inputStore.stats[statsKey];
  
  // Calcular estadísticas desde el store
  const stats = useMemo(() => {
    if (!statsData) {
      return {
        wordsRead: 0,
        wordsHeard: 0,
        wordsSpoken: 0,
        minutesListened: 0,
        minutesRead: 0,
      };
    }
    return statsData;
  }, [statsData]);

  // Calcular horas totales de video (todas las visualizaciones)
  const videoHours = useMemo(() => {
    const videoEvents = inputStore.events.filter((e) => e.type === 'video');
    const totalSeconds = videoEvents.reduce((acc, e) => acc + (e.durationSeconds || 0), 0);
    return (totalSeconds / 3600).toFixed(2);
  }, [inputStore.events]);

  // Calcular horas de audio
  const audioHours = useMemo(() => {
    return (stats.minutesListened / 60).toFixed(2);
  }, [stats.minutesListened]);

  // Calcular palabras leídas
  const wordsRead = useMemo(() => {
    return stats.wordsRead;
  }, [stats.wordsRead]);

  // Contador de visualizaciones de video
  const videoViews = useMemo(() => {
    return inputStore.events.filter((e) => e.type === 'video').length;
  }, [inputStore.events]);

  // Contador de audios escuchados
  const audioCount = useMemo(() => {
    return inputStore.events.filter((e) => e.type === 'audio').length;
  }, [inputStore.events]);

  // Contador de textos leídos
  const textCount = useMemo(() => {
    return inputStore.events.filter((e) => e.type === 'text').length;
  }, [inputStore.events]);

  const inputOptions = [
    {
      id: 'video',
      href: '/input/video',
      icon: '🎬',
      title: 'Video',
      description: 'Videos de YouTube con transcripción',
      stats: [
        { label: 'Visualizaciones', value: videoViews },
        { label: 'Horas totales', value: `${videoHours}h` },
      ],
      color: 'from-red-500 to-pink-500',
    },
    {
      id: 'audio',
      href: '/input/audio',
      icon: '🎧',
      title: 'Audio',
      description: 'Podcasts y diálogos con texto',
      stats: [
        { label: 'Audios escuchados', value: audioCount },
        { label: 'Horas totales', value: `${audioHours}h` },
      ],
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'text',
      href: '/input/text',
      icon: '📖',
      title: 'Texto',
      description: 'Lecturas con audio generado',
      stats: [
        { label: 'Textos leídos', value: textCount },
        { label: 'Palabras leídas', value: wordsRead.toLocaleString() },
      ],
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Input
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Elige el tipo de contenido que quieres consumir
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 pt-6">
        <div className="grid gap-4">
          {inputOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={option.href}
                className="block bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-3xl">{option.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {option.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {option.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      {option.stats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-400">{stat.label}:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

