/**
 * Lazy-loaded exercise components
 *
 * Use these imports for better code splitting and initial load performance.
 * Each exercise is loaded on-demand when first used.
 */

import dynamic from 'next/dynamic';

// Loading placeholder component
const ExerciseLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
  </div>
);

// ============================================================
// LAZY-LOADED EXERCISES
// ============================================================

// Ejercicios clásicos
export const LazyClozeExercise = dynamic(
  () => import('./ClozeExercise').then((mod) => mod.ClozeExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyVariationsExercise = dynamic(
  () => import('./VariationsExercise').then((mod) => mod.VariationsExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyVocabularyExercise = dynamic(
  () => import('./VocabularyExercise').then((mod) => mod.VocabularyExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyPragmaStrikeExercise = dynamic(
  () => import('./PragmaStrikeExercise').then((mod) => mod.PragmaStrikeExercise),
  { loading: ExerciseLoading, ssr: false }
);

// Ejercicios core v2.0
export const LazyConversationalEchoExercise = dynamic(
  () => import('./ConversationalEchoExercise').then((mod) => mod.ConversationalEchoExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyDialogueIntonationExercise = dynamic(
  () => import('./DialogueIntonationExercise').then((mod) => mod.DialogueIntonationExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyInteractiveSpeechExercise = dynamic(
  () => import('./InteractiveSpeechExercise').then((mod) => mod.InteractiveSpeechExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyJanusComposerExercise = dynamic(
  () => import('./JanusComposerExercise').then((mod) => mod.JanusComposerExercise),
  { loading: ExerciseLoading, ssr: false }
);

// Otros ejercicios
export const LazyMiniTaskExercise = dynamic(
  () => import('./MiniTaskExercise').then((mod) => mod.MiniTaskExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyBlockEchoExercise = dynamic(
  () => import('./BlockEchoExercise').then((mod) => mod.BlockEchoExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyShadowingExercise = dynamic(
  () => import('./ShadowingExercise').then((mod) => mod.ShadowingExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyBlockBuilderExercise = dynamic(
  () => import('./BlockBuilderExercise').then((mod) => mod.BlockBuilderExercise),
  { loading: ExerciseLoading, ssr: false }
);

export const LazyBlockSwapExercise = dynamic(
  () => import('./BlockSwapExercise').then((mod) => mod.BlockSwapExercise),
  { loading: ExerciseLoading, ssr: false }
);
