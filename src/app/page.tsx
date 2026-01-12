'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { getTranslations } from '@/i18n';

export default function Home() {
  const router = useRouter();
  const { hasCompletedOnboarding, appLanguage } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const t = getTranslations(appLanguage);

  // Esperar a que Zustand se hidrate desde localStorage
  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Verificar estado del store
  useEffect(() => {
    if (isHydrated) {
      console.log('[HomePage] hasCompletedOnboarding:', hasCompletedOnboarding);
      const stored = localStorage.getItem('linguaforge-user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('[HomePage] LocalStorage hasCompletedOnboarding:', parsed.state?.hasCompletedOnboarding);
        } catch (e) {
          console.error('[HomePage] Error parsing localStorage:', e);
        }
      }
    }
  }, [hasCompletedOnboarding, isHydrated]);

  // Si ya completó el onboarding, redirigir a /learn
  useEffect(() => {
    if (isHydrated && hasCompletedOnboarding) {
      console.log('[HomePage] Redirigiendo a /learn...');
      router.push('/learn');
    }
  }, [hasCompletedOnboarding, router, isHydrated]);

  // Mostrar loading mientras se hidrata el store
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-600 via-indigo-700 to-purple-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  // Si ya completó onboarding, no mostrar nada (está redirigiendo)
  if (hasCompletedOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Landing page para nuevos usuarios
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-indigo-700 to-purple-800 flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
            <span className="text-5xl">🇫🇷</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-3"
        >
          {t.app.name}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-indigo-200 mb-12 max-w-xs"
        >
          {t.app.tagline}
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-12 w-full max-w-sm"
        >
          {[
            { icon: '🎯', label: 'A0 Level' },
            { icon: '🗣️', label: 'Real French' },
            { icon: '🎮', label: 'Gamified' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-white/10 backdrop-blur rounded-xl p-3 text-center"
            >
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-xs text-white/80">{feature.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-sm"
        >
          <Link
            href="/onboarding"
            className="block w-full py-4 bg-white text-indigo-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            {t.onboarding.start} →
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-indigo-300/60">
          Made with ❤️ for language learners
        </p>
      </footer>
    </div>
  );
}
