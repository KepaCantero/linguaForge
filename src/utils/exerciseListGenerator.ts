import type { ExerciseType, ExerciseData } from '@/hooks/useExerciseFlow';
import type { ExerciseMenuItem } from '@/components/exercises/ExerciseMenu';

/**
 * Generates exercise menu items from exercise data
 * Filters out exercises with zero count
 */
export function generateExerciseList(
  exerciseData: ExerciseData
): ExerciseMenuItem[] {
  const exerciseDefinitions = [
    {
      type: 'cloze' as ExerciseType,
      icon: '✏️',
      title: 'Cloze',
      description: 'Completa las frases con la palabra correcta',
      count: exerciseData.cloze?.length || 0,
    },
    {
      type: 'variations' as ExerciseType,
      icon: '🔄',
      title: 'Variaciones',
      description: 'Aprende diferentes formas de decir lo mismo',
      count: exerciseData.variations?.length || 0,
    },
    {
      type: 'conversationalEcho' as ExerciseType,
      icon: '💬',
      title: 'Echo Conversacional',
      description: 'Responde en contexto conversacional',
      count: exerciseData.conversationalEcho?.length || 0,
    },
    {
      type: 'dialogueIntonation' as ExerciseType,
      icon: '🎤',
      title: 'Entonación de Diálogo',
      description: 'Practica el ritmo y entonación',
      count: exerciseData.dialogueIntonation?.length || 0,
    },
    {
      type: 'janusComposer' as ExerciseType,
      icon: '🧩',
      title: 'Matriz Janus',
      description: 'Construye frases combinando columnas',
      count: exerciseData.janusComposer?.length || 0,
    },
  ];

  return exerciseDefinitions.filter((ex) => ex.count > 0);
}
