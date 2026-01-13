import { AnimatePresence, motion } from 'framer-motion';

interface WelcomeModalProps {
  show: boolean;
  onDismiss: () => void;
}

export function WelcomeModal({ show, onDismiss }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-calm-bg-elevated rounded-2xl p-6 max-w-md w-full border border-amber-500/30"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🏰</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Bienvenido al Constructor!
              </h2>
              <p className="text-calm-text-tertiary mb-4">
                Cada tema de francés que completes te dará materiales para construir
                tu propio palacio del conocimiento.
              </p>
              <ul className="text-left text-sm text-calm-text-muted space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">🪵</span>
                  Completa lecciones para ganar madera, piedra y más
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">💎</span>
                  Materiales raros por rachas y logros especiales
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">🏗️</span>
                  Desbloquea elementos arquitectónicos únicos
                </li>
              </ul>
              <button
                onClick={onDismiss}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-calm-text-primary font-bold rounded-xl transition-colors"
              >
                ¡Empezar a Construir!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
