'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, type LearningMode } from '@/store/useUserStore';
import { getTranslations, type AppLanguage } from '@/i18n';

type Step = 'language' | 'mode';

export default function OnboardingPage() {
  const router = useRouter();
  const { appLanguage, setAppLanguage, setMode, completeOnboarding } = useUserStore();
  const [step, setStep] = useState<Step>('language');
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(appLanguage);

  const t = getTranslations(selectedLang);

  const handleLanguageSelect = (lang: AppLanguage) => {
    setSelectedLang(lang);
    setAppLanguage(lang);
  };

  const handleContinue = () => {
    if (step === 'language') {
      setStep('mode');
    }
  };

  const handleModeSelect = (mode: LearningMode) => {
    setMode(mode);
    completeOnboarding();
    router.push('/learn');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 'language' && (
          <motion.div
            key="language"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {t.app.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t.app.tagline}
              </p>
            </div>

            {/* Step content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                {t.onboarding.selectLanguage}
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => handleLanguageSelect('es')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedLang === 'es'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-3xl">🇪🇸</span>
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    Español
                  </span>
                </button>

                <button
                  onClick={() => handleLanguageSelect('en')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedLang === 'en'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-3xl">🇬🇧</span>
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    English
                  </span>
                </button>
              </div>

              <button
                onClick={handleContinue}
                className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
              >
                {t.onboarding.continue}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'mode' && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🇫🇷</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.onboarding.selectMode}
              </h2>
            </div>

            {/* Mode selection */}
            <div className="space-y-4">
              {/* Guided Mode */}
              <button
                onClick={() => handleModeSelect('guided')}
                className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-indigo-500 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📚</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t.onboarding.guidedMode.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t.onboarding.guidedMode.description}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                    {t.onboarding.guidedMode.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 pl-12">
                  {t.onboarding.guidedMode.detail}
                </p>
                <div className="mt-4 pl-12 flex gap-2">
                  {['🏠', '🍽️', '🚇', '🏥', '🆘'].map((emoji, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </button>

              {/* Autonomous Mode */}
              <button
                onClick={() => handleModeSelect('autonomous')}
                className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-purple-500 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.onboarding.autonomousMode.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.onboarding.autonomousMode.description}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 pl-12">
                  {t.onboarding.autonomousMode.detail}
                </p>
                <div className="mt-4 pl-12 flex gap-2">
                  {['🎙️', '📰', '▶️'].map((emoji, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </button>
            </div>

            {/* Back button */}
            <button
              onClick={() => setStep('language')}
              className="w-full mt-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              ← {t.common.back}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
