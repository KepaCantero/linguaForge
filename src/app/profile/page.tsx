'use client';

import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/useProgressStore';
import { useInputStore } from '@/store/useInputStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { getLevelByXP, SUPPORTED_LANGUAGES, SUPPORTED_LEVELS } from '@/lib/constants';

const LANGUAGE_INFO: Record<string, { flag: string; name: string }> = {
  fr: { flag: '🇫🇷', name: 'Francés' },
  de: { flag: '🇩🇪', name: 'Alemán' },
};

export default function ProfilePage() {
  const {
    activeLanguage,
    activeLevel,
    setActiveLanguage,
    setActiveLevel,
    resetProgress,
  } = useProgressStore();
  const { resetStats } = useInputStore();
  const { xp, level, resetGamification } = useGamificationStore();

  const userLevel = getLevelByXP(xp);

  const handleResetAll = () => {
    if (confirm('¿Estás seguro de que quieres resetear todo el progreso? Esta acción no se puede deshacer.')) {
      resetProgress();
      resetStats();
      resetGamification();
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-5xl">👤</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Perfil
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {userLevel.title} - Nivel {level}
        </p>
      </motion.div>

      {/* Selector de idioma */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          Idioma de estudio
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(SUPPORTED_LANGUAGES as readonly string[]).map((lang) => {
            const info = LANGUAGE_INFO[lang];
            const isActive = lang === activeLanguage;

            return (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang as 'fr' | 'de')}
                className={`
                  p-4 rounded-xl flex items-center gap-3 transition-all
                  ${isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }
                `}
              >
                <span className="text-3xl">{info?.flag}</span>
                <div className="text-left">
                  <p className={`font-medium ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                    {info?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lang.toUpperCase()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Selector de nivel */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          Nivel CEFR
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(SUPPORTED_LEVELS as readonly string[]).map((lvl) => {
            const isActive = lvl === activeLevel;
            const isDisabled = !['A1', 'A2'].includes(lvl); // Solo A1 y A2 disponibles por ahora

            return (
              <button
                key={lvl}
                onClick={() => !isDisabled && setActiveLevel(lvl as 'A1' | 'A2')}
                disabled={isDisabled}
                className={`
                  py-3 rounded-lg font-bold transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : isDisabled
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }
                `}
              >
                {lvl}
                {isDisabled && <span className="ml-1 text-xs">🔒</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Niveles B1-C2 próximamente
        </p>
      </motion.div>

      {/* Configuración */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          Configuración
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <span className="text-gray-700 dark:text-gray-300">Notificaciones</span>
            </div>
            <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔊</span>
              <span className="text-gray-700 dark:text-gray-300">Sonidos</span>
            </div>
            <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌙</span>
              <span className="text-gray-700 dark:text-gray-300">Modo oscuro</span>
            </div>
            <span className="text-sm text-gray-500">Sistema</span>
          </div>
        </div>
      </motion.div>

      {/* Información de la app */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          Acerca de
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Versión</span>
            <span className="text-gray-900 dark:text-white font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Metodología</span>
            <span className="text-gray-900 dark:text-white font-medium">Krashen + Janulus</span>
          </div>
        </div>
      </motion.div>

      {/* Zona de peligro */}
      <motion.div
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-bold text-red-700 dark:text-red-400 mb-4">
          Zona de peligro
        </h3>

        <button
          onClick={handleResetAll}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
        >
          Resetear todo el progreso
        </button>
        <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
          Esta acción eliminará todo tu progreso y no se puede deshacer
        </p>
      </motion.div>
    </div>
  );
}
