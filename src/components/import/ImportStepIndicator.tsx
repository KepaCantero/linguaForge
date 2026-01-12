'use client';

import { motion } from 'framer-motion';

type ImportStep = 'source' | 'content' | 'configure' | 'success';

interface ImportStepIndicatorProps {
  currentStep: ImportStep;
}

const STEPS: ImportStep[] = ['source', 'content', 'configure'];

/**
 * Import Step Indicator Component
 * Displays the progress of the multi-step import wizard
 * Reduces complexity of main import page component
 */
export function ImportStepIndicator({ currentStep }: ImportStepIndicatorProps) {
  const currentStepIndex = STEPS.indexOf(currentStep as ImportStep) ?? 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-lf-primary/10 to-lf-secondary/10"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="relative flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                currentStep === step || currentStep === 'success'
                  ? 'bg-gradient-to-r from-lf-primary to-lf-secondary border-lf-primary text-white shadow-glow-accent'
                  : i < currentStepIndex
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white'
                  : 'bg-lf-dark/30 border-white/20 text-lf-muted'
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {i < currentStepIndex ? '✓' : i + 1}
            </motion.div>
            {i < STEPS.length - 1 && (
              <motion.div
                className={`flex-1 h-1 mx-2 rounded-full ${
                  i < currentStepIndex
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-lf-dark/30'
                }`}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
