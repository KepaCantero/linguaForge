# Tareas v2.0 — Expansión LinguaForge

> Tareas adicionales para implementar el Plan Maestro v2.0 (Sistema Solo Leveling + 6 Ejercicios Core)

**Versión:** 2.0  
**Fecha:** 2025-01-XX  
**Estado:** Pendiente de implementación

---

## Leyenda

- `[ ]` Pendiente
- `[~]` En progreso
- `[x]` Completada
- `[!]` Bloqueada
- `[+]` Nueva tarea v2.0

---

# FASE 14 — SISTEMA DE RANGOS SOLO LEVELING

## TAREA 28 — Sistema de Rangos (E-S)

**Estado:** `[x]` Completada  
**Prioridad:** Alta  
**Dependencias:** TAREA 7 (Gamification Store)

**Descripción:**
Implementar sistema de rangos de cazador lingüístico (E → S) complementario al sistema de niveles Octalysis existente.

**Especificaciones:**

1. **Constantes en `constants.ts`:**

```typescript
export const HUNTER_RANKS = [
  { rank: "E", name: "Novato", xpRequired: 0, color: "#9CA3AF" },
  { rank: "D", name: "Aprendiz", xpRequired: 500, color: "#3B82F6" },
  { rank: "C", name: "Competente", xpRequired: 1500, color: "#10B981" },
  { rank: "B", name: "Experto", xpRequired: 3000, color: "#F59E0B" },
  { rank: "A", name: "Maestro", xpRequired: 5000, color: "#EF4444" },
  {
    rank: "S",
    name: "Leyenda Lingüística",
    xpRequired: 8000,
    color: "#8B5CF6",
  },
] as const;

export const RANK_UNLOCK_RULES = {
  E: { contentLevels: ["A1"] },
  D: { contentLevels: ["A1", "A2"] },
  C: { contentLevels: ["A1", "A2", "B1"] },
  B: { contentLevels: ["A1", "A2", "B1", "B2"] },
  A: { contentLevels: ["A1", "A2", "B1", "B2", "C1"] },
  S: { contentLevels: ["A1", "A2", "B1", "B2", "C1", "C2"] },
} as const;
```

2. **Funciones helper:**

   - `getRankByXP(xp: number): HunterRank`
   - `getRankProgress(xp: number): number` (0-100)
   - `canAccessContent(rank: Rank, level: Level): boolean`

3. **Actualizar `useGamificationStore.ts`:**

   - Agregar campo `rank: Rank`
   - Actualizar automáticamente cuando XP cambia
   - Evento `RANK_UP` cuando se sube de rango

4. **Componente `RankBadge.tsx`:**
   - Badge visual con color según rango
   - Animación al subir de rango
   - Tooltip con información del rango

**Archivos a crear/modificar:**

- `src/lib/constants.ts` (modificar)
- `src/store/useGamificationStore.ts` (modificar)
- `src/components/ui/RankBadge.tsx` (nuevo)
- `src/types/index.ts` (modificar - agregar tipos Rank)

**Tests:**

- `__tests__/unit/rankSystem.test.ts` (nuevo)
  - Cálculo de rangos por XP
  - Desbloqueo de contenido por rango
  - Progreso de rango

---

## TAREA 29 — UI de Rangos en Header

**Estado:** `[x]` Completada  
**Prioridad:** Media  
**Dependencias:** TAREA 28

**Descripción:**
Mostrar rango actual del usuario en el Header junto con nivel Octalysis.

**Especificaciones:**

1. **Modificar `Header.tsx`:**

   - Agregar componente `RankBadge` junto a nivel
   - Mostrar progreso hacia siguiente rango
   - Animación al subir de rango

2. **Componente `RankProgress.tsx`:**
   - Barra de progreso visual hacia siguiente rango
   - XP actual / XP requerido
   - Color según rango actual

**Archivos a crear/modificar:**

- `src/components/layout/Header.tsx` (modificar)
- `src/components/ui/RankProgress.tsx` (nuevo)

---

## TAREA 30 — Sistema de HP (Salud)

**Estado:** `[x]` Completada  
**Prioridad:** Media  
**Dependencias:** TAREA 31 (Daily Directives)

**Descripción:**
Implementar sistema de HP que se reduce si no se completan misiones diarias.

**Especificaciones:**

1. **Constantes en `constants.ts`:**

```typescript
export const HP_CONFIG = {
  maxHP: 100,
  dailyMissionHP: 20, // HP perdido por misión no completada
  recoveryPerMission: 10, // HP recuperado por misión completada
  minHPForPremium: 50, // HP mínimo para contenido premium
} as const;
```

2. **Actualizar `useGamificationStore.ts`:**

   - Agregar campo `hp: number` (default: 100)
   - Método `reduceHP(amount: number): void`
   - Método `recoverHP(amount: number): void`
   - Método `canAccessPremium(): boolean`

3. **Lógica de penalización:**
   - Al finalizar día sin completar misiones: reducir HP
   - HP mínimo: 0 (no puede ser negativo)
   - HP máximo: 100

**Archivos a crear/modificar:**

- `src/lib/constants.ts` (modificar)
- `src/store/useGamificationStore.ts` (modificar)

**Tests:**

- `__tests__/unit/hpSystem.test.ts` (nuevo)

---

# FASE 15 — EJERCICIOS CORE (GDD)

## TAREA 31 — Shard Detection Exercise

**Estado:** `[x]` Completada  
**Prioridad:** Alta  
**Dependencias:** TAREA 5 (Contenido JSON)

**Descripción:**
Implementar ejercicio de comprensión flash con audio corto y selección de imagen correcta.

**Especificaciones:**

1. **Schema en `content.ts`:**

```typescript
export const ShardDetectionSchema = z.object({
  id: z.string(),
  audioUrl: z.string(),
  audioDuration: z.number(), // 3-8 segundos
  shards: z
    .array(
      z.object({
        id: z.string(),
        imageUrl: z.string(),
        isCorrect: z.boolean(),
      })
    )
    .length(3),
  phrase: z.string(),
  translation: z.string(),
});
```

2. **Componente `ShardDetectionExercise.tsx`:**

   - Reproducir audio automáticamente al iniciar
   - Mostrar 3 imágenes (LinguaShards) en grid
   - Timer visual con presión temporal
   - Feedback inmediato al seleccionar
   - Animación de "shard" correcto

3. **Lógica de scoring:**

   - Correcto rápido (<3s): 20 XP
   - Correcto normal: 15 XP
   - Incorrecto: 5 XP

4. **Integración:**
   - Agregar a tipos de ejercicio en `types/index.ts`
   - Agregar a flujo de ejercicios en `matrix/[matrixId]/page.tsx`

**Archivos a crear/modificar:**

- `src/schemas/content.ts` (modificar)
- `src/components/exercises/ShardDetectionExercise.tsx` (nuevo)
- `src/types/index.ts` (modificar)
- `src/app/world/[worldId]/matrix/[matrixId]/page.tsx` (modificar)

**Tests:**

- `__tests__/unit/shardDetection.test.ts` (nuevo)

---

## TAREA 32 — Resonance Path Exercise (Voice Paint)

**Estado:** `[x]` Completada  
**Prioridad:** Alta  
**Dependencias:** TAREA 15 (Shadowing Exercise)

**Descripción:**
Evolución del Shadowing Exercise con visualización de curva de entonación y comparación con nativo.

**Especificaciones:**

1. **Schema en `content.ts`:**

```typescript
export const ResonancePathSchema = z.object({
  id: z.string(),
  phrase: z.string(),
  audioUrl: z.string(),
  nativeIntonation: z.array(z.number()), // Array de valores de frecuencia
  targetAccuracy: z.number(), // 0-100
});
```

2. **Componente `ResonancePathExercise.tsx`:**

   - Visualización de curva de entonación nativa (Canvas)
   - Reproducir audio nativo
   - Botón de grabación de voz del usuario
   - Análisis de frecuencia del audio grabado (Web Audio API)
   - Superposición de curvas (nativa vs. usuario)
   - Cálculo de similitud (algoritmo de correlación)
   - Feedback visual de precisión

3. **Lógica de scoring:**

   - Sincronización >80%: 30 XP
   - Sincronización >90%: 50 XP + 10 gems
   - Mejora progresiva: Bonus de streak

4. **Tecnologías:**
   - Web Audio API para análisis de frecuencia
   - MediaRecorder API para grabación
   - Canvas API para visualización

**Archivos a crear/modificar:**

- `src/schemas/content.ts` (modificar)
- `src/components/exercises/ResonancePathExercise.tsx` (nuevo)
- `src/lib/audioAnalysis.ts` (nuevo - utilidades de análisis)
- `src/types/index.ts` (modificar)

**Tests:**

- `__tests__/unit/resonancePath.test.ts` (nuevo)
- `__tests__/unit/audioAnalysis.test.ts` (nuevo)

---

## TAREA 33 — Pragma Strike Exercise

**Estado:** `[x]` Completada  
**Prioridad:** Media-Alta  
**Dependencias:** TAREA 5 (Contenido JSON)

**Descripción:**
Ejercicio de competencia pragmática con situaciones sociales y selección de frase más cortés.

**Especificaciones:**

1. **Schema en `content.ts`:**

```typescript
export const PragmaStrikeSchema = z.object({
  id: z.string(),
  situationImage: z.string(),
  situationDescription: z.string(),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        isCorrect: z.boolean(),
        explanation: z.string(), // Por qué es más/menos cortés
      })
    )
    .min(3)
    .max(4),
  timeLimit: z.number().default(5), // segundos
});
```

2. **Componente `PragmaStrikeExercise.tsx`:**

   - Mostrar imagen de situación social
   - Timer de 5 segundos con presión visual
   - 3-4 opciones de frases similares
   - Feedback explicativo después de selección
   - Explicación de por qué una opción es más apropiada

3. **Lógica de scoring:**

   - Correcto rápido (<3s): 25 XP
   - Correcto normal: 20 XP
   - Incorrecto: 10 XP + explicación educativa

4. **Contenido:**
   - Crear situaciones sociales reales para A1
   - Diferencias sutiles de cortesía en francés
   - Explicaciones culturales

**Archivos a crear/modificar:**

- `src/schemas/content.ts` (modificar)
- `src/components/exercises/PragmaStrikeExercise.tsx` (nuevo)
- `content/fr/A1/airbnb.json` (modificar - agregar ejercicios pragma)
- `src/types/index.ts` (modificar)

**Tests:**

- `__tests__/unit/pragmaStrike.test.ts` (nuevo)

---

## TAREA 34 — Echo Stream Exercise

**Estado:** `[x]` Completada  
**Prioridad:** Media  
**Dependencias:** TAREA 5 (Contenido JSON)

**Descripción:**
Ejercicio de seguimiento de audio con detección de Power Words mediante gestos táctiles.

**Especificaciones:**

1. **Schema en `content.ts`:**

```typescript
export const EchoStreamSchema = z.object({
  id: z.string(),
  audioUrl: z.string(),
  audioDuration: z.number(),
  powerWords: z.array(
    z.object({
      word: z.string(),
      timestamp: z.number(), // Segundos desde inicio
      tolerance: z.number().default(0.5), // Tolerancia en segundos
    })
  ),
  phrase: z.string(),
  translation: z.string(),
});
```

2. **Componente `EchoStreamExercise.tsx`:**

   - Visualización de onda de audio (Canvas)
   - Touch events para seguimiento con dedo
   - Detección de Power Words mediante timestamps
   - Feedback visual cuando se detecta Power Word
   - Puntuación basada en precisión y velocidad

3. **Lógica de scoring:**

   - Power Word detectada: 10 XP cada una
   - Completar stream completo: 30 XP bonus
   - Precisión >90%: 10 gems adicionales

4. **Tecnologías:**
   - Canvas API para visualización de onda
   - Touch events (touchstart, touchmove, touchend)
   - Análisis de audio para timestamps

**Archivos a crear/modificar:**

- `src/schemas/content.ts` (modificar)
- `src/components/exercises/EchoStreamExercise.tsx` (nuevo)
- `src/lib/audioVisualization.ts` (nuevo)
- `src/types/index.ts` (modificar)

**Tests:**

- `__tests__/unit/echoStream.test.ts` (nuevo)

---

## TAREA 35 — Glyph Weaving Exercise

**Estado:** `[x]` Completada  
**Prioridad:** Baja-Media  
**Dependencias:** TAREA 5 (Contenido JSON)

**Descripción:**
Ejercicio rítmico de conexión de glifos en matriz 4x4 sincronizado con beat musical.

**Especificaciones:**

1. **Schema en `content.ts`:**

```typescript
export const GlyphWeavingSchema = z.object({
  id: z.string(),
  audioUrl: z.string(),
  bpm: z.number(), // Beats per minute
  pattern: z.array(
    z.object({
      fromGlyph: z.string(), // ID del glifo origen
      toGlyph: z.string(), // ID del glifo destino
      beat: z.number(), // Beat número (1, 2, 3, 4...)
    })
  ),
  glyphs: z.array(
    z.object({
      id: z.string(),
      symbol: z.string(), // Carácter Unicode o emoji
      position: z.object({ x: z.number(), y: z.number() }),
    })
  ),
});
```

2. **Componente `GlyphWeavingExercise.tsx`:**

   - Matriz 4x4 de glifos (Canvas)
   - Reproducir audio con beat
   - Detección de beat mediante análisis de audio
   - Conexión de glifos mediante touch/drag
   - Efectos de "resonancia" visual cuando se sincroniza
   - Feedback de precisión temporal

3. **Lógica de scoring:**

   - Conexión en beat: 15 XP (doble)
   - Conexión fuera de beat: 7 XP
   - Completar patrón completo: 50 XP
   - Sincronización perfecta (>95%): 20 gems

4. **Tecnologías:**
   - Web Audio API para análisis de BPM
   - Canvas API para matriz y conexiones
   - Sistema de sincronización temporal preciso

**Archivos a crear/modificar:**

- `src/schemas/content.ts` (modificar)
- `src/components/exercises/GlyphWeavingExercise.tsx` (nuevo)
- `src/lib/bpmDetection.ts` (nuevo)
- `src/types/index.ts` (modificar)

**Tests:**

- `__tests__/unit/glyphWeaving.test.ts` (nuevo)
- `__tests__/unit/bpmDetection.test.ts` (nuevo)

---

## TAREA 36 — Forge Mandate Exercise (Daily Heist)

**Estado:** `[x]` Completada  
**Prioridad:** Media  
**Dependencias:** TAREAS 31-35 (Todos los ejercicios core)

**Descripción:**
Orquestador de ejercicios diarios con narrativa de misión que encadena 3 ejercicios aleatorios.

**Especificaciones:**

1. **Schema en `content.ts`:**

```typescript
export const ForgeMandateSchema = z.object({
  id: z.string(),
  title: z.string(),
  narrative: z.string(),
  missionType: z.enum(["espionage", "survival", "rescue", "exploration"]),
  exercises: z
    .array(
      z.object({
        exerciseType: z.enum([
          "shardDetection",
          "echoStream",
          "glyphWeaving",
          "pragmaStrike",
          "resonancePath",
          "cloze",
          "shadowing",
          "variations",
        ]),
        exerciseId: z.string(),
        narrativeSegment: z.string(), // Parte de la historia revelada
      })
    )
    .length(3),
  rewards: z.object({
    xp: z.number(),
    coins: z.number(),
    gems: z.number(),
  }),
  timeLimit: z.number().optional(), // Minutos opcionales
});
```

2. **Componente `ForgeMandateExercise.tsx`:**

   - Pantalla de introducción con narrativa
   - Secuencia de 3 ejercicios aleatorios
   - Revelación de narrativa después de cada ejercicio
   - Timer opcional para completar misión
   - Pantalla de finalización con recompensas
   - Sistema de selección inteligente de ejercicios

3. **Lógica de selección de ejercicios:**

   - Basada en nivel del usuario
   - Evitar repetición de ejercicios recientes
   - Variedad de tipos de ejercicios
   - Dificultad progresiva

4. **Lógica de scoring:**

   - Completar misión diaria: 100 XP + 50 coins + 20 gems
   - Bonus por completar en <15 minutos: 50 XP adicional
   - Streak de misiones diarias: Bonus exponencial

5. **Integración con Daily Directives:**
   - Forge Mandate cuenta como misión diaria completa
   - Completar restaura HP
   - No completar reduce HP

**Archivos a crear/modificar:**

- `src/schemas/content.ts` (modificar)
- `src/components/exercises/ForgeMandateExercise.tsx` (nuevo)
- `src/services/exerciseSelector.ts` (nuevo - lógica de selección)
- `src/app/mandate/page.tsx` (nuevo - ruta de misiones diarias)
- `src/types/index.ts` (modificar)

**Tests:**

- `__tests__/unit/forgeMandate.test.ts` (nuevo)
- `__tests__/unit/exerciseSelector.test.ts` (nuevo)

---

# FASE 16 — DAILY DIRECTIVES

## TAREA 37 — Sistema de Misiones Diarias

**Estado:** `[x]` Completada  
**Prioridad:** Media  
**Dependencias:** TAREA 30 (HP System), TAREA 36 (Forge Mandate)

**Descripción:**
Implementar sistema de misiones diarias estructuradas que mantienen el compromiso del usuario.

**Especificaciones:**

1. **Tipos de misiones:**

```typescript
export type MissionType =
  | { type: "input"; targetMinutes: number; currentMinutes: number }
  | { type: "janus"; targetCombinations: number; currentCombinations: number }
  | { type: "exercises"; targetCount: number; currentCount: number }
  | { type: "streak"; targetDays: number; currentDays: number }
  | { type: "forgeMandate"; completed: boolean };
```

2. **Store `useMissionStore.ts`:**

```typescript
interface MissionStore {
  dailyMissions: Mission[];
  completedMissions: string[]; // IDs de misiones completadas hoy
  missionHistory: MissionCompletion[];

  generateDailyMissions: () => void;
  completeMission: (missionId: string) => void;
  getMissionProgress: (missionId: string) => number;
  areAllMissionsComplete: () => boolean;
}
```

3. **Lógica de generación:**

   - Generar 3-4 misiones diarias al inicio del día
   - Basadas en nivel y progreso del usuario
   - Variedad de tipos de misiones
   - Dificultad adaptativa

4. **Sistema de penalizaciones:**

   - Al finalizar día sin completar todas las misiones: reducir HP
   - HP reducido por misión no completada
   - Notificación antes de perder HP

5. **UI:**
   - Componente `DailyMissions.tsx` en Dashboard
   - Barras de progreso por misión
   - Animaciones al completar misión
   - Notificaciones de misiones pendientes

**Archivos a crear/modificar:**

- `src/store/useMissionStore.ts` (nuevo)
- `src/components/dashboard/DailyMissions.tsx` (nuevo)
- `src/app/dashboard/page.tsx` (modificar)
- `src/lib/constants.ts` (modificar - agregar config de misiones)

**Tests:**

- `__tests__/unit/missionSystem.test.ts` (nuevo)

---

## TAREA 38 — Integración de Daily Directives con HP

**Estado:** `[x]` Completada  
**Prioridad:** Media  
**Dependencias:** TAREA 30, TAREA 37

**Descripción:**
Conectar sistema de misiones diarias con sistema de HP para penalizaciones y recompensas.

**Especificaciones:**

1. **Lógica de penalización:**

   - Al finalizar día (4:00 AM): verificar misiones completadas
   - Por cada misión no completada: reducir HP en `dailyMissionHP`
   - Notificar al usuario de pérdida de HP

2. **Lógica de recuperación:**

   - Al completar misión: recuperar HP en `recoveryPerMission`
   - Completar todas las misiones: bonus de HP completo

3. **Sistema de bloqueo:**

   - Si HP < `minHPForPremium`: bloquear contenido premium
   - Mostrar mensaje de recuperación de HP
   - Sugerir completar misiones para recuperar HP

4. **UI:**
   - Indicador de HP en Header
   - Advertencia cuando HP está bajo
   - Animación al perder/recuperar HP

**Archivos a crear/modificar:**

- `src/store/useGamificationStore.ts` (modificar)
- `src/store/useMissionStore.ts` (modificar)
- `src/components/layout/Header.tsx` (modificar)
- `src/components/ui/HPIndicator.tsx` (nuevo)

**Tests:**

- `__tests__/integration/hpMissionIntegration.test.ts` (nuevo)

---

# FASE 17 — CONTENIDO PARA NUEVOS EJERCICIOS

## TAREA 39 — Contenido Shard Detection

**Estado:** `[x]` Completada  
**Prioridad:** Media  
**Dependencias:** TAREA 31

**Descripción:**
Crear contenido JSON para ejercicios Shard Detection en mundo Airbnb A1.

**Especificaciones:**

1. **Estructura de contenido:**

   - 10-15 ejercicios Shard Detection por matriz
   - Audios de 3-8 segundos
   - 3 imágenes por ejercicio (LinguaShards)
   - Frases relacionadas con contexto Airbnb

2. **Ubicación:**

   - Agregar a `content/fr/A1/airbnb.json`
   - Sección `shardDetection` en cada matriz

3. **Contenido a crear:**
   - Audios de frases cortas
   - Imágenes de situaciones Airbnb
   - Variaciones de frases similares

**Archivos a crear/modificar:**

- `content/fr/A1/airbnb.json` (modificar)
- `public/audio/fr/a1/airbnb/` (agregar audios)
- `public/images/shards/` (agregar imágenes)

---

## TAREA 40 — Contenido Pragma Strike

**Estado:** `[x]` Completada  
**Prioridad:** Media  
**Dependencias:** TAREA 33

**Descripción:**
Crear contenido de situaciones sociales para ejercicios Pragma Strike.

**Especificaciones:**

1. **Situaciones a cubrir:**

   - Check-in en Airbnb
   - Pedir ayuda al anfitrión
   - Reportar problemas
   - Check-out y despedida
   - Interacciones casuales

2. **Variaciones de cortesía:**

   - Formal vs. informal
   - Directo vs. indirecto
   - Con vs. sin "s'il vous plaît"
   - Con vs. sin "merci"

3. **Imágenes:**
   - Fotos de situaciones sociales reales
   - Contexto claro y visual

**Archivos a crear/modificar:**

- `content/fr/A1/airbnb.json` (modificar)
- `public/images/pragma/` (agregar imágenes)

---

## TAREA 41 — Contenido Echo Stream y Glyph Weaving

**Estado:** `[x]` Completada  
**Prioridad:** Baja  
**Dependencias:** TAREA 34, TAREA 35

**Descripción:**
Crear contenido para ejercicios Echo Stream y Glyph Weaving.

**Especificaciones:**

1. **Echo Stream:**

   - Audios de 10-30 segundos
   - Power Words identificadas con timestamps
   - Frases relacionadas con contexto Airbnb

2. **Glyph Weaving:**
   - Audios con BPM identificado (60-120 BPM)
   - Patrones de conexión de glifos
   - Glifos relacionados con vocabulario Airbnb

**Archivos a crear/modificar:**

- `content/fr/A1/airbnb.json` (modificar)
- `public/audio/fr/a1/airbnb/` (agregar audios)

---

# RESUMEN DE TAREAS v2.0

| Tarea | Nombre                      | Prioridad  | Estado |
| ----- | --------------------------- | ---------- | ------ |
| 28    | Sistema de Rangos (E-S)     | Alta       | `[x]`  |
| 29    | UI de Rangos en Header      | Media      | `[x]`  |
| 30    | Sistema de HP               | Media      | `[x]`  |
| 31    | Shard Detection Exercise    | Alta       | `[x]`  |
| 32    | Resonance Path Exercise     | Alta       | `[x]`  |
| 33    | Pragma Strike Exercise      | Media-Alta | `[x]`  |
| 34    | Echo Stream Exercise        | Media      | `[x]`  |
| 35    | Glyph Weaving Exercise      | Baja-Media | `[x]`  |
| 36    | Forge Mandate Exercise      | Media      | `[x]`  |
| 37    | Sistema de Misiones Diarias | Media      | `[x]`  |
| 38    | Integración HP-Misiones     | Media      | `[x]`  |
| 39    | Contenido Shard Detection   | Media      | `[x]`  |
| 40    | Contenido Pragma Strike     | Media      | `[x]`  |
| 41    | Contenido Echo/Glyph        | Baja       | `[x]`  |

**Total:** 14 nuevas tareas v2.0  
**Tareas v2.0 completadas:** 14/14 (100%) ✅  
**Tareas v4.0 completadas:** 22/27 (81%)  
**Tareas totales:** 41 (27 v4.0 + 14 v2.0)  
**Progreso general:** 36/41 (88%)

---

## Orden Recomendado de Implementación

### Sprint 1: Sistema de Rangos

1. TAREA 28 → Sistema de Rangos
2. TAREA 29 → UI de Rangos

### Sprint 2: Ejercicios Core (Parte 1)

3. TAREA 31 → Shard Detection
4. TAREA 33 → Pragma Strike
5. TAREA 39 → Contenido Shard Detection
6. TAREA 40 → Contenido Pragma Strike

### Sprint 3: Ejercicios Core (Parte 2)

7. TAREA 32 → Resonance Path
8. TAREA 34 → Echo Stream
9. TAREA 35 → Glyph Weaving
10. TAREA 41 → Contenido Echo/Glyph

### Sprint 4: Daily Directives

11. TAREA 30 → Sistema de HP
12. TAREA 37 → Sistema de Misiones
13. TAREA 38 → Integración HP-Misiones
14. TAREA 36 → Forge Mandate (orquestador final)

---

**Fin del documento**
