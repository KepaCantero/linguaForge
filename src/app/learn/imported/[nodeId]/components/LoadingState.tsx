import { motion } from 'framer-motion';
import { COLORS } from '@/constants/colors';
import Link from 'next/link';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Loading and not-found state for imported node page.
 * Displays when node is loading or not found.
 */
export function LoadingState() {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  return (
    <div className="relative min-h-screen bg-calm-bg-tertiary flex items-center justify-center">
      {/* Animated background */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, var(--sky-500) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, #F59E0B 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, var(--sky-500) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <div className="relative text-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-32 h-32 mx-auto mb-6 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #EF4444, #DC2626)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            404
          </div>
        </motion.div>
        <p
          className="text-lg mb-4"
          style={{ textShadow: COLORS.effects.textShadowLg }}
        >
          Nodo no encontrado
        </p>
        <Link
          href="/learn"
          className="inline-block px-6 py-3 rounded-2xl font-bold text-calm-text-primary focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-calm-bg-tertiary"
          style={{
            background: 'radial-gradient(circle at 30% 30%, var(--sky-500), var(--sky-600))',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          Volver al mapa
        </Link>
      </div>
    </div>
  );
}
