'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100dvh-var(--header-height)-var(--nav-height))] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Accede a tu cuenta de LinguaForge
          </p>
        </motion.div>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center text-sm"
        >
          <span className="text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
          </span>
          <Link
            href="/auth/register"
            className="text-lf-primary hover:text-lf-primary/80 font-medium"
          >
            Regístrate aquí
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
