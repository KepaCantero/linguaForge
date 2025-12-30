# Task Progress — Plan v4.0 (27 Tareas)

> Última actualización: 2025-12-28
> Estado general: 22/27 completadas (81%)

## Leyenda
- `[ ]` Pendiente
- `[~]` En progreso
- `[x]` Completada
- `[!]` Bloqueada

---

# FASE 0 — DEFINICIONES INMUTABLES

## TAREA 0.1 — Crear constants.ts
**Estado:** `[x]` Completada
**Archivo:** `src/lib/constants.ts`

---

# FASE 1 — PROYECTO BASE

## TAREA 1 — Crear Next.js 14
**Estado:** `[x]` Completada
**Detalles:** Proyecto creado con App Router, TypeScript strict, Tailwind

---

# FASE 2 — LAYOUT

## TAREA 2 — Layout principal
**Estado:** `[x]` Completada
**Archivos:**
- `src/app/layout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/BottomNav.tsx`

---

# FASE 3 — TIPOS Y SCHEMAS

## TAREA 3 — Types index
**Estado:** `[x]` Completada
**Archivo:** `src/types/index.ts`

## TAREA 4 — Zod Schemas
**Estado:** `[x]` Completada
**Archivo:** `src/schemas/content.ts`

---

# FASE 4 — CONTENIDO

## TAREA 5 — JSON de contenido
**Estado:** `[x]` Completada
**Archivo:** `content/fr/A1/airbnb.json`

## TAREA 6 — ContentLoader service
**Estado:** `[x]` Completada
**Archivo:** `src/services/contentLoader.ts`

---

# FASE 5 — STORES

## TAREA 7 — Zustand Stores
**Estado:** `[x]` Completada
**Archivos:**
- `src/store/useProgressStore.ts`
- `src/store/useInputStore.ts`
- `src/store/useGamificationStore.ts`
- `src/store/useUIStore.ts`

## TAREA 8 — InputStats Tracker
**Estado:** `[x]` Completada
**Archivo:** `src/services/inputTracker.ts`

---

# FASE 6 — MAPA

## TAREA 9 — World Map View
**Estado:** `[x]` Completada
**Archivos:**
- `src/components/map/WorldMap.tsx`
- `src/components/map/MapNode.tsx`
- `src/app/world/[worldId]/page.tsx`

## TAREA 10 — Unlock Rules
**Estado:** `[x]` Completada (integrado en WorldMap)

---

# FASE 7 — JANUS

## TAREA 11 — Janus Matrix View
**Estado:** `[x]` Completada
**Archivos:**
- `src/components/janus/JanusMatrix.tsx`
- `src/components/janus/JanusCell.tsx`

## TAREA 12 — Permutation Counter
**Estado:** `[x]` Completada (integrado en JanusMatrix)

## TAREA 13 — Intoning Mode
**Estado:** `[x]` Completada
**Archivos:**
- `src/components/janus/IntoningMode.tsx`
- `src/app/world/[worldId]/janus/page.tsx`

---

# FASE 8 — EJERCICIOS

## TAREA 14 — Cloze Exercise
**Estado:** `[x]` Completada
**Archivo:** `src/components/exercises/ClozeExercise.tsx`

## TAREA 15 — Shadowing Exercise
**Estado:** `[x]` Completada
**Archivo:** `src/components/exercises/ShadowingExercise.tsx`

## TAREA 16 — Variations Exercise
**Estado:** `[x]` Completada
**Archivo:** `src/components/exercises/VariationsExercise.tsx`

## TAREA 17 — MiniTask Exercise
**Estado:** `[x]` Completada
**Archivos:**
- `src/components/exercises/MiniTaskExercise.tsx`
- `src/app/world/[worldId]/matrix/[matrixId]/page.tsx`

---

# FASE 9 — INPUT COMPRENSIBLE

## TAREA 18 — Input Selector
**Estado:** `[x]` Completada
**Archivo:** `src/components/input/InputSelector.tsx`

## TAREA 19 — Input Player
**Estado:** `[x]` Completada
**Archivo:** `src/components/input/InputPlayer.tsx`

## TAREA 20 — Comprehension Test
**Estado:** `[x]` Completada
**Archivos:**
- `src/components/input/ComprehensionTest.tsx`
- `src/app/input/page.tsx`

---

# FASE 10 — DASHBOARD

## TAREA 21 — Dashboard View
**Estado:** `[x]` Completada
**Archivo:** `src/app/dashboard/page.tsx`

## TAREA 22 — Gamification Engine
**Estado:** `[x]` Completada (integrado en stores)

---

# FASE 11 — SUPABASE

## TAREA 23 — Supabase Auth
**Estado:** `[ ]` Pendiente

## TAREA 24 — Sync Service
**Estado:** `[ ]` Pendiente

---

# FASE 12 — PWA

## TAREA 25 — Service Worker
**Estado:** `[ ]` Pendiente

---

# FASE 13 — CONTENIDO ADICIONAL

## TAREA 26 — A2 French Content
**Estado:** `[ ]` Pendiente

## TAREA 27 — German A1 Content
**Estado:** `[ ]` Pendiente

---

# Tests y Documentación

**Estado:** `[x]` Completada

**Archivos creados:**
- `__tests__/unit/constants.test.ts` (20 tests)
- `__tests__/unit/inputTracker.test.ts` (20 tests)
- `__tests__/unit/schemas.test.ts` (11 tests)
- `__tests__/setup.ts`
- `vitest.config.ts`
- `DEVELOPMENT.md`

**Comandos disponibles:**
```bash
npm run test          # Ejecutar todos los tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con cobertura
```

**Resultado:** 51 tests pasan correctamente
