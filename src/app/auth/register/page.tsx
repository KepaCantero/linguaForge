'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100dvh-var(--header-height)-var(--nav-height))] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-calm-text-primary dark:text-calm-text-primary mb-2">
            Crear Cuenta
          </h1>
          <p className="text-calm-text-secondary dark:text-calm-text-muted">
            Comienza tu viaje hacia el dominio del francés
          </p>
        </motion.div>

        <RegisterForm />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center text-sm"
        >
          <span className="text-calm-text-secondary dark:text-calm-text-muted">
            ¿Ya tienes cuenta?{' '}
          </span>
          <Link
            href="/auth/login"
            className="text-calm-text-primary hover:text-calm-text-primary/80 font-medium"
          >
            Inicia sesión aquí
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

