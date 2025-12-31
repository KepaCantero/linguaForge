/**
 * Exercise Content Loader
 * Carga contenido para los ejercicios Core v2.0
 */

import { z } from 'zod';
import {
  ShardDetectionSchema,
  PragmaStrikeSchema,
  EchoStreamSchema,
  GlyphWeavingSchema,
  ResonancePathSchema,
} from '@/schemas/content';

const ExerciseContentSchema = z.object({
  worldId: z.string(),
  matrixId: z.string(),
  context: z.string(),
  exercises: z.object({
    shardDetection: z.array(ShardDetectionSchema).optional(),
    pragmaStrike: z.array(PragmaStrikeSchema).optional(),
    echoStream: z.array(EchoStreamSchema).optional(),
    glyphWeaving: z.array(GlyphWeavingSchema).optional(),
    resonancePath: z.array(ResonancePathSchema).optional(),
  }),
});

export type ExerciseContent = z.infer<typeof ExerciseContentSchema>;

/**
 * Carga contenido de ejercicios para una matriz específica
 */
export async function loadExerciseContent(
  worldId: string,
  matrixId: string
): Promise<ExerciseContent> {
  try {
    // Por ahora, cargar desde el archivo JSON estático
    // En producción, esto podría venir de Supabase o API
    const response = await fetch(`/content/fr/A1/airbnb-exercises.json`, {
      cache: 'no-store', // En desarrollo, siempre recargar
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load exercise content: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validar que el contenido corresponde a la matriz solicitada
    if (data.matrixId !== matrixId) {
      throw new Error(`Exercise content matrixId mismatch: expected ${matrixId}, got ${data.matrixId}`);
    }

    const validated = ExerciseContentSchema.parse(data);
    return validated;
  } catch (error) {
    console.error('Error loading exercise content:', error);
    throw error;
  }
}

/**
 * Obtiene ejercicios de un tipo específico para una matriz
 */
export async function getExercisesByType<T extends keyof ExerciseContent['exercises']>(
  worldId: string,
  matrixId: string,
  type: T
): Promise<ExerciseContent['exercises'][T]> {
  const content = await loadExerciseContent(worldId, matrixId);
  return content.exercises[type] || [];
}

