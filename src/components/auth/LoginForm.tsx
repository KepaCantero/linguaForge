'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'password' | 'magic-link';

export function LoginForm() {
  const [email, setEmail] = useState('admin'); // Default to admin username
  const [password, setPassword] = useState(''); // Default to admin password
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { signIn, signInWithGoogle, signInWithMagicLink } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/learn';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (authMode === 'magic-link') {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        setError(error.message);
      } else {
        setMagicLinkSent(true);
      }
      setLoading(false);
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push(redirect);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    await signInWithGoogle();
  };

  // Si se envió el magic link, mostrar mensaje de confirmación
  if (magicLinkSent) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
        >
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Revisa tu email!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hemos enviado un enlace mágico a <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Haz clic en el enlace del email para iniciar sesión automáticamente.
          </p>
          <button
            onClick={() => {
              setMagicLinkSent(false);
              setEmail('');
            }}
            className="text-lf-primary hover:text-lf-primary/80 font-medium"
          >
            Usar otro email
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Demo credentials hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>🔧 Credenciales de Demo:</strong><br />
            Usuario: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin</code><br />
            Contraseña: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin</code>
          </p>
        </motion.div>

        {/* Selector de modo */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMode === 'password'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Contraseña
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('magic-link')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMode === 'magic-link'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Magic Link
          </button>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email o Usuario
          </label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lf-primary focus:border-transparent"
            placeholder="admin o tu@email.com"
          />
        </div>

        {authMode === 'password' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lf-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        )}

        {authMode === 'magic-link' && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Te enviaremos un enlace mágico a tu email para iniciar sesión sin contraseña.
          </p>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-lf-primary text-white rounded-lg font-medium hover:bg-lf-primary/90 focus:outline-none focus:ring-2 focus:ring-lf-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? authMode === 'magic-link'
              ? 'Enviando enlace...'
              : 'Iniciando sesión...'
            : authMode === 'magic-link'
            ? 'Enviar Magic Link'
            : 'Iniciar sesión'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">O continúa con</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-lf-primary focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </button>

        <div className="text-center text-sm">
          <a
            href="/auth/forgot-password"
            className="text-lf-primary hover:text-lf-primary/80 font-medium"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </motion.form>
    </div>
  );
}

