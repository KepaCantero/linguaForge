'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, type LearningMode } from '@/store/useUserStore';
import { useProgressStore } from '@/store/useProgressStore';
import { getTranslations, type AppLanguage } from '@/i18n';

type Step = 'language' | 'mode';

function getLanguageButtonClasses(selectedLang: AppLanguage, buttonLang: AppLanguage): string {
  const baseClasses = 'w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ';
  return selectedLang === buttonLang
    ? baseClasses + 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
    : baseClasses + 'border-calm-warm-100 hover:border-accent-300';
}

export default function OnboardingPage() {
  const router = useRouter();
  const { appLanguage, setAppLanguage, setMode, completeOnboarding } = useUserStore();
  const { setActiveLanguage, setActiveLevel } = useProgressStore();
  const [step, setStep] = useState<Step>('language');
  const [selectedLang, setSelectedLang] = useState<AppLanguage>('es');
  const [isHydrated, setIsHydrated] = useState(false);

  // Esperar a que el store se hidrate desde localStorage
  useEffect(() => {
    // Verificar si hay datos guardados en localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('linguaforge-user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.state) {
            setSelectedLang(parsed.state.appLanguage || 'es');
          }
        } catch {
          // Si hay error, usar el valor del store
          setSelectedLang(appLanguage);
        }
      } else {
        setSelectedLang(appLanguage);
      }
      setIsHydrated(true);
    }
  }, [appLanguage]);

  const t = getTranslations(selectedLang);

  const handleLanguageSelect = (lang: AppLanguage) => {
    setSelectedLang(lang);
    setAppLanguage(lang);
    // También guardar el idioma de aprendizaje (francés por defecto)
    setActiveLanguage('fr');
    setActiveLevel('A1');
  };

  const handleContinue = () => {
    if (step === 'language') {
      setStep('mode');
    }
  };

  const handleModeSelect = (mode: LearningMode) => {
    // Guardar todas las preferencias antes de completar onboarding
    setMode(mode);
    // Asegurar que el idioma y nivel estén guardados
    setActiveLanguage('fr');
    setActiveLevel('A1');
    // Completar onboarding y redirigir
    completeOnboarding();

    setTimeout(() => {
      router.push('/learn');
    }, 200);
  };

  // No renderizar hasta que el store esté hidratado
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-bg-primary to-calm-bg-elevated flex flex-col items-center justify-center p-6">
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
              <h1 className="text-3xl font-bold text-accent-500">
                {t.app.name}
              </h1>
              <p className="text-calm-text-secondary mt-2">
                {t.app.tagline}
              </p>
            </div>

            {/* Step content */}
            <div className="bg-calm-bg-elevated rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-calm-text-primary mb-6 text-center">
                {t.onboarding.selectLanguage}
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => handleLanguageSelect('es')}
                  className={getLanguageButtonClasses(selectedLang, 'es')}
                >
                  <span className="text-3xl">🇪🇸</span>
                  <span className="text-lg font-medium text-calm-text-primary">
                    Español
                  </span>
                </button>

                <button
                  onClick={() => handleLanguageSelect('en')}
                  className={getLanguageButtonClasses(selectedLang, 'en')}
                >
                  <span className="text-3xl">🇬🇧</span>
                  <span className="text-lg font-medium text-calm-text-primary">
                    English
                  </span>
                </button>
              </div>

              <button
                onClick={handleContinue}
                className="w-full mt-6 py-3 px-4 bg-accent-500 hover:bg-accent-600 text-calm-text-primary font-medium rounded-xl transition-colors"
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
              <h2 className="text-2xl font-bold text-calm-text-primary">
                {t.onboarding.selectMode}
              </h2>
            </div>

            {/* Mode selection */}
            <div className="space-y-4">
              {/* Guided Mode */}
              <button
                onClick={() => handleModeSelect('guided')}
                className="w-full bg-calm-bg-elevated rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-accent-500 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📚</span>
                    <div>
                      <h3 className="text-lg font-semibold text-calm-text-primary dark:text-calm-text-primary">
                        {t.onboarding.guidedMode.title}
                      </h3>
                      <p className="text-sm text-calm-text-secondary dark:text-calm-text-muted">
                        {t.onboarding.guidedMode.description}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 text-xs font-medium rounded-full">
                    {t.onboarding.guidedMode.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm text-calm-text-muted dark:text-calm-text-muted pl-12">
                  {t.onboarding.guidedMode.detail}
                </p>
                <div className="mt-4 pl-12 flex gap-2">
                  {['🏠', '🍽️', '🚇', '🏥', '🆘'].map((emoji) => (
                    <span
                      key={emoji}
                      className="w-8 h-8 flex items-center justify-center bg-calm-bg-secondary dark:bg-calm-bg-tertiary rounded-full text-sm"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </button>

              {/* Autonomous Mode */}
              <button
                onClick={() => handleModeSelect('autonomous')}
                className="w-full bg-calm-bg-elevated dark:bg-calm-bg-elevated rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-sky-500 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="text-lg font-semibold text-calm-text-primary dark:text-calm-text-primary">
                      {t.onboarding.autonomousMode.title}
                    </h3>
                    <p className="text-sm text-calm-text-secondary dark:text-calm-text-muted">
                      {t.onboarding.autonomousMode.description}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-calm-text-muted dark:text-calm-text-muted pl-12">
                  {t.onboarding.autonomousMode.detail}
                </p>
                <div className="mt-4 pl-12 flex gap-2">
                  {['🎙️', '📰', '▶️'].map((emoji) => (
                    <span
                      key={emoji}
                      className="w-8 h-8 flex items-center justify-center bg-calm-bg-secondary dark:bg-calm-bg-tertiary rounded-full text-sm"
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
              className="w-full mt-6 py-3 text-calm-text-secondary dark:text-calm-text-muted hover:text-calm-text-primary dark:hover:text-calm-text-primary font-medium transition-colors"
            >
              ← {t.common.back}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
