'use client';

import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { radialGlow } from '@/constants/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary that catches JavaScript errors anywhere in the child component tree
 * Displays a beautiful fallback UI instead of crashing the entire app
 */
export class AAAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log errors with centralized service
    import('@/services/logger').then(({ logger }) => {
      logger.componentError('ErrorBoundary', 'React component error caught', error);
      logger.componentError('ErrorBoundary', 'Component stack trace', {
        componentStack: errorInfo.componentStack,
      });
    });

    // Future: Integrar Sentry o LogRocket para producción
    // Ejemplo: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-screen bg-calm-bg-tertiary"
          >
            <div className="text-center p-8 max-w-md">
              {/* Error orb */}
              <motion.div
                className="relative w-32 h-32 mx-auto mb-6 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #EF4444, #DC2626)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{
                    background: radialGlow('error', 0.6),
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  ⚠️
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Algo salió mal
              </h2>
              <p className="text-calm-text-muted mb-2">
                La animación se ha detenido para proteger tu experiencia
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-semantic-error hover:text-semantic-error-text mb-2">
                    Error details
                  </summary>
                  <pre className="text-xs bg-semantic-error-bg/80 p-3 rounded-lg overflow-auto max-h-40 text-semantic-error-text">
                    {this.state.error.toString()}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <motion.button
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl font-bold text-white"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, var(--sky-500), var(--sky-600))',
                }}
              >
                Recargar
              </motion.button>
            </div>
          </motion.div>
        )
      );
    }

    return this.props.children;
  }
}
