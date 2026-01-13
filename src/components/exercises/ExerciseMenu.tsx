'use client';

import { motion } from 'framer-motion';
import type { ExerciseType } from '@/hooks/useExerciseFlow';

export interface ExerciseMenuItem {
  type: ExerciseType;
  icon: string;
  title: string;
  description: string;
  count: number;
}

interface ExerciseMenuProps {
  exercises: ExerciseMenuItem[];
  subtopicTitle: string;
  onSelectExercise: (type: ExerciseType) => void;
}

/**
 * Exercise Menu Component
 * Displays a list of available exercise types with AAA design
 * Reduces complexity of main exercise page component
 */
export function ExerciseMenu({
  exercises,
  subtopicTitle: _subtopicTitle,
  onSelectExercise,
}: ExerciseMenuProps) {
  return (
    <main className="max-w-lg mx-auto px-4 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Ejercicios
        </h2>
        <p className="text-lf-muted">
          Elige el tipo de ejercicio que quieres practicar
        </p>
      </motion.div>

      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <motion.button
            key={exercise.type}
            onClick={() => onSelectExercise(exercise.type)}
            className="relative w-full overflow-hidden group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-lf-primary/20 via-lf-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            />

            {/* Content */}
            <div className="relative flex items-center justify-between p-4 border-b border-lf-muted/20 hover:border-lf-primary/30 transition-all">
              <div className="flex items-center gap-4">
                {/* Icon with animated background */}
                <div className="relative">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-lf-primary/20"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    {exercise.icon}
                  </motion.div>
                </div>

                {/* Title and info */}
                <div className="text-left">
                  <h3 className="font-semibold text-white">
                    {exercise.title}
                  </h3>
                  <p className="text-sm text-lf-muted/70">
                    {exercise.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-lf-primary bg-lf-primary/10 px-2 py-0.5 rounded-md">
                      {exercise.count} ejercicio{exercise.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <motion.span
                className="text-lf-muted/50 text-xl group-hover:text-lf-primary group-hover:translate-x-1 transition-all"
                animate={{
                  x: [0, 4, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.1,
                }}
              >
                →
              </motion.span>
            </div>
          </motion.button>
        ))}
      </div>
    </main>
  );
}
