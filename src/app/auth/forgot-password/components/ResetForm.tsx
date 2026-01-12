import { motion } from 'framer-motion';
import Link from 'next/link';

interface ResetFormProps {
  email: string;
  error: string | null;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResetForm({
  email,
  error,
  loading,
  onEmailChange,
  onSubmit,
}: ResetFormProps) {
  return (
    <div className="min-h-[calc(100dvh-var(--header-height)-var(--nav-height))] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lf-primary focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

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
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-lf-primary hover:text-lf-primary/80 font-medium"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
