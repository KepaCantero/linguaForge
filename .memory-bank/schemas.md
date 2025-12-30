# Schemas Zod — v4.0 Completo

> Copiar a `/src/schemas/content.ts`

```typescript
import { z } from 'zod';

// ============================================================
// ENUMS Y CONSTANTES
// ============================================================

export const LanguageCodeSchema = z.enum(['fr', 'de', 'es', 'it', 'pt']);
export const LevelCodeSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export const InputTypeSchema = z.enum(['audio', 'video', 'text']);
export const NodeStatusSchema = z.enum(['locked', 'active', 'completed']);
export const WeaknessTypeSchema = z.enum(['listening', 'reading', 'speaking']);
export const GrammaticalRoleSchema = z.enum(['subject', 'modal', 'verb', 'complement']);

// ============================================================
// JANUS MATRIX (Método Janulus)
// ============================================================

export const JanusCellSchema = z.object({
  id: z.string(),
  text: z.string(),
  translation: z.string(),
  audioUrl: z.string().optional(),
});

export const JanusColumnSchema = z.object({
  id: z.string(),
  label: z.string(),
  grammaticalRole: GrammaticalRoleSchema,
  cells: z.array(JanusCellSchema).min(4).max(6),
});

export const JanusMatrixSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  title: z.string(),
  description: z.string(),
  columns: z.tuple([
    JanusColumnSchema,
    JanusColumnSchema,
    JanusColumnSchema,
    JanusColumnSchema,
  ]),
  targetRepetitions: z.number().default(25),
});

export const JanusCombinationSchema = z.object({
  cellIds: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  resultPhrase: z.string(),
  timestamp: z.string(),
});

// ============================================================
// EJERCICIOS CLÁSICOS
// ============================================================

export const VariationSchema = z.object({
  id: z.string(),
  text: z.string(),
  translation: z.string(),
  audioUrl: z.string().optional(),
});

export const ClozeOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const PhraseSchema = z.object({
  id: z.string(),
  text: z.string(),
  translation: z.string(),
  audioUrl: z.string().optional(),
  clozeWord: z.string(),
  clozeOptions: z.array(ClozeOptionSchema).length(4),
  variations: z.array(VariationSchema).min(2),
});

export const MiniTaskSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  promptTranslation: z.string(),
  keywords: z.array(z.string()).min(3),
  exampleResponse: z.string(),
  minWords: z.number().default(5),
});

// ============================================================
// ESTRUCTURA DE CONTENIDO
// ============================================================

export const MatrixSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  context: z.string(), // "check-in", "cocina", etc.
  phrases: z.array(PhraseSchema).min(5).max(10),
  miniTask: MiniTaskSchema,
});

export const WorldSchema = z.object({
  id: z.string(),
  languageCode: LanguageCodeSchema,
  levelCode: LevelCodeSchema,
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  janusMatrix: JanusMatrixSchema,
  matrices: z.array(MatrixSchema).min(3).max(7),
});

// ============================================================
// INPUT COMPRENSIBLE
// ============================================================

export const ComprehensionQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  questionTranslation: z.string(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean(),
  })).length(4),
});

export const InputContentSchema = z.object({
  id: z.string(),
  languageCode: LanguageCodeSchema,
  levelCode: LevelCodeSchema,
  type: InputTypeSchema,
  title: z.string(),
  description: z.string(),
  url: z.string(),
  wordCount: z.number(),
  durationSeconds: z.number().optional(),
  transcript: z.string().optional(),
  comprehensionQuestions: z.array(ComprehensionQuestionSchema).min(1).max(3),
});

// ============================================================
// INPUT STATS (Krashen)
// ============================================================

export const InputStatsSchema = z.object({
  wordsRead: z.number().default(0),
  wordsHeard: z.number().default(0),
  wordsSpoken: z.number().default(0),
  minutesListened: z.number().default(0),
  minutesRead: z.number().default(0),
});

export const InputEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: InputTypeSchema,
  contentId: z.string(),
  wordsCounted: z.number(),
  durationSeconds: z.number().optional(),
  understood: z.boolean(),
});

// ============================================================
// PROGRESO DE JANULUS
// ============================================================

export const JanusProgressSchema = z.object({
  matrixId: z.string(),
  cellUsage: z.record(z.string(), z.number()), // cellId -> timesUsed
  combinations: z.array(JanusCombinationSchema),
  totalCombinations: z.number().default(0),
  uniqueCombinations: z.number().default(0),
  isComplete: z.boolean().default(false),
});

export const IntoningProgressSchema = z.object({
  matrixId: z.string(),
  columnId: z.string(),
  cyclesCompleted: z.number().default(0),
  isComplete: z.boolean().default(false),
});

// ============================================================
// GAMIFICACIÓN
// ============================================================

export const LevelInfoSchema = z.object({
  level: z.number(),
  xpRequired: z.number(),
  title: z.string(),
});

export const GamificationStateSchema = z.object({
  xp: z.number().default(0),
  level: z.number().default(1),
  coins: z.number().default(0),
  gems: z.number().default(0),
  streak: z.number().default(0),
  lastActiveDate: z.string().nullable(),
  longestStreak: z.number().default(0),
});

// ============================================================
// PROGRESO GLOBAL DEL USUARIO
// ============================================================

export const UserProgressSchema = z.object({
  id: z.string(),
  activeLanguage: LanguageCodeSchema,
  activeLevel: LevelCodeSchema,

  // Progreso por mundo
  worldProgress: z.record(z.string(), z.object({
    janusProgress: JanusProgressSchema.optional(),
    intoningProgress: z.array(IntoningProgressSchema).optional(),
    completedMatrices: z.array(z.string()),
    currentMatrixId: z.string().nullable(),
    isComplete: z.boolean().default(false),
  })),

  // Stats Krashen (por idioma+nivel)
  inputStats: z.record(z.string(), InputStatsSchema), // "fr-A1" -> stats

  // Gamificación
  gamification: GamificationStateSchema,

  // Historial
  inputEvents: z.array(InputEventSchema),

  // Metadata
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================
// TYPE INFERENCE
// ============================================================

export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export type LevelCode = z.infer<typeof LevelCodeSchema>;
export type InputType = z.infer<typeof InputTypeSchema>;
export type NodeStatus = z.infer<typeof NodeStatusSchema>;
export type WeaknessType = z.infer<typeof WeaknessTypeSchema>;
export type GrammaticalRole = z.infer<typeof GrammaticalRoleSchema>;

export type JanusCell = z.infer<typeof JanusCellSchema>;
export type JanusColumn = z.infer<typeof JanusColumnSchema>;
export type JanusMatrix = z.infer<typeof JanusMatrixSchema>;
export type JanusCombination = z.infer<typeof JanusCombinationSchema>;
export type JanusProgress = z.infer<typeof JanusProgressSchema>;
export type IntoningProgress = z.infer<typeof IntoningProgressSchema>;

export type Variation = z.infer<typeof VariationSchema>;
export type ClozeOption = z.infer<typeof ClozeOptionSchema>;
export type Phrase = z.infer<typeof PhraseSchema>;
export type MiniTask = z.infer<typeof MiniTaskSchema>;
export type Matrix = z.infer<typeof MatrixSchema>;
export type World = z.infer<typeof WorldSchema>;

export type ComprehensionQuestion = z.infer<typeof ComprehensionQuestionSchema>;
export type InputContent = z.infer<typeof InputContentSchema>;
export type InputStats = z.infer<typeof InputStatsSchema>;
export type InputEvent = z.infer<typeof InputEventSchema>;

export type LevelInfo = z.infer<typeof LevelInfoSchema>;
export type GamificationState = z.infer<typeof GamificationStateSchema>;
export type UserProgress = z.infer<typeof UserProgressSchema>;
```

---

## Ejemplo: Janus Matrix JSON

```json
{
  "id": "janus-fr-a1-airbnb",
  "worldId": "fr-a1-airbnb",
  "title": "Frases de Reservación",
  "description": "Combina elementos para crear frases de alojamiento",
  "targetRepetitions": 25,
  "columns": [
    {
      "id": "col-subject",
      "label": "Sujeto",
      "grammaticalRole": "subject",
      "cells": [
        { "id": "s1", "text": "Je", "translation": "Yo" },
        { "id": "s2", "text": "Nous", "translation": "Nosotros" },
        { "id": "s3", "text": "Vous", "translation": "Usted" },
        { "id": "s4", "text": "On", "translation": "Uno/Se" }
      ]
    },
    {
      "id": "col-modal",
      "label": "Modal",
      "grammaticalRole": "modal",
      "cells": [
        { "id": "m1", "text": "veux", "translation": "quiero" },
        { "id": "m2", "text": "dois", "translation": "debo" },
        { "id": "m3", "text": "peux", "translation": "puedo" },
        { "id": "m4", "text": "voudrais", "translation": "quisiera" }
      ]
    },
    {
      "id": "col-verb",
      "label": "Acción",
      "grammaticalRole": "verb",
      "cells": [
        { "id": "v1", "text": "réserver", "translation": "reservar" },
        { "id": "v2", "text": "voir", "translation": "ver" },
        { "id": "v3", "text": "utiliser", "translation": "usar" },
        { "id": "v4", "text": "trouver", "translation": "encontrar" }
      ]
    },
    {
      "id": "col-complement",
      "label": "Complemento",
      "grammaticalRole": "complement",
      "cells": [
        { "id": "c1", "text": "la chambre", "translation": "la habitación" },
        { "id": "c2", "text": "l'appartement", "translation": "el apartamento" },
        { "id": "c3", "text": "la cuisine", "translation": "la cocina" },
        { "id": "c4", "text": "les clés", "translation": "las llaves" }
      ]
    }
  ]
}
```

---

## Ejemplo: World JSON Completo

```json
{
  "id": "fr-a1-airbnb",
  "languageCode": "fr",
  "levelCode": "A1",
  "title": "Airbnb en París",
  "description": "Aprende francés para tu estancia en Airbnb",
  "imageUrl": "/images/worlds/airbnb.png",
  "janusMatrix": { /* Ver ejemplo arriba */ },
  "matrices": [
    {
      "id": "matrix-1-checkin",
      "title": "Check-in",
      "description": "Llegada y presentación",
      "order": 1,
      "context": "llegada",
      "phrases": [ /* 10 frases */ ],
      "miniTask": { /* MiniTask */ }
    }
    // ... 4 matrices más
  ]
}
```
