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
          <h1 className="text-3xl font-bold text-calm-text-primary dark:text-calm-text-primary mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-calm-text-secondary dark:text-calm-text-muted">
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
            <label htmlFor="email" className="block text-sm font-medium text-calm-text-secondary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-calm-warm-200 bg-calm-bg-elevated text-calm-text-primary focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-semantic-error-bg dark:bg-semantic-error-bg border border-semantic-error dark:border-semantic-error"
            >
              <p className="text-sm text-semantic-error dark:text-semantic-error">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-accent-500 text-calm-text-primary rounded-lg font-medium hover:bg-accent-500/90 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-calm-text-primary hover:text-calm-text-primary/80 font-medium"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
