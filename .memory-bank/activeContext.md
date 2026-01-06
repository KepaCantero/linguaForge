# Active Context — Contexto Activo

> Última actualización: 2026-01-03

## Estado Actual

**Versión del Plan:** v4.0 (Base) + v2.0 (Expansión LinguaForge) + Sistema INPUT + SRS + CLT + Misiones
**Fase:** FASE 5 y 6 completadas parcialmente + Integración Misiones
**Tarea activa:** ÁREA 0 - Contenido base (próxima tarea crítica)
**Última completada:** Integración de Misiones en navegación + Fix infinite loops

## Resumen de Trabajo Reciente

### Integración de Misiones (Completada)

1. **Página de Misiones (`/missions`):**
   - Nueva página con MissionFeed component
   - Header con título y descripción
   - Misiones diarias con indicadores de carga cognitiva
   - Opción de warmup antes de misiones

2. **Navegación Actualizada:**
   - BottomNav ahora incluye: Mapa | Misiones | Input | Decks | Perfil
   - Icono "⚔️" para Misiones
   - Acceso desde cualquier pantalla

3. **Sistema de Warmup:**
   - **Opcional:** Botón "Saltar por ahora" disponible
   - **Integrado:** MissionFeed ofrece "🧠 Con Calentamiento" o "▶️ Comenzar Directo"
   - Componentes: RhythmSequenceWarmup, VisualMatchWarmup, WarmupGate

### Correcciones de Bugs Críticos

1. **Infinite Loop en useCognitiveLoad():**
   - **Problema:** Llamar `state.getLoadStatus()` dentro del selector de Zustand causaba re-renders infinitos
   - **Solución:** Calcular status fuera del selector usando valores primitivos

2. **Infinite Loop en useSessionMetrics():**
   - **Problema:** Similar - `state.getRecommendedBreak()` causaba loops
   - **Solución:** Calcular recommendedBreak localmente

3. **Infinite Loop en MissionsPage:**
   - **Problema:** useEffect con funciones de Zustand como dependencias
   - **Solución:** useRef para ejecutar solo una vez

4. **MissionFeed areAllMissionsComplete:**
   - **Problema:** Función del store causaba re-renders
   - **Solución:** useMemo local para calcular el valor

### Fixes de Lint y Build

- Renombrado `lazy.ts` → `lazy.tsx` para soporte JSX
- Fix tipos en `InputEvent` (añadir id, wordsCounted, understood)
- Fix `generateVariationsExercises` para incluir campos requeridos de Phrase
- Fix iteración de Set con `Array.from()`
- Suspense wrapper en `/decks/review`
- Múltiples fixes de imports no usados

---

### FASE 5: Optimizaciones (Completada)

1. **Lazy Loading de Ejercicios (`src/components/exercises/lazy.tsx`):**
   - 18 ejercicios con carga diferida usando `next/dynamic`
   - Loading placeholder con spinner
   - SSR deshabilitado para mejor rendimiento

2. **Cache de Traducciones (`src/services/translationService.ts`):**
   - Cache en localStorage con límite de 5000 entradas
   - Limpieza automática de entradas antiguas

3. **Performance Hooks (`src/hooks/usePerformance.ts`):**
   - useDebounce, useDebouncedCallback, useThrottledCallback
   - useIntersectionObserver, usePrevious, useStableCallback
   - useMediaQuery, usePrefersReducedMotion, useIdleCallback

### FASE 6: Testing (Parcialmente Completada)

1. **Tests Unitarios (155 tests pasando):**
   - `__tests__/unit/missionGenerator.test.ts` (21 tests)
   - `__tests__/unit/postCognitiveRewards.test.ts` (30 tests)
   - `__tests__/unit/warmupSelector.test.ts` (21 tests)
   - `__tests__/unit/usePerformance.test.ts` (18 tests)

2. **Pendiente:**
   - Tests E2E con Playwright
   - Visual regression tests

---

### Sistema CLT (Cognitive Load Theory)

1. **Store (`useCognitiveLoadStore`):**
   - Métricas: intrinsic, extraneous, germane, total
   - Modo Focus con niveles (relaxed, normal, focused, deep)
   - Métricas de sesión

2. **Hooks Utilitarios (IMPORTANTE - patrones seguros):**
   ```typescript
   // ✅ CORRECTO - No llamar funciones dentro de selectores
   export function useCognitiveLoad() {
     const load = useCognitiveLoadStore((state) => state.currentLoad);
     // Calcular status FUERA del selector
     const status = calculateStatus(load);
     return { load, status };
   }

   // ❌ INCORRECTO - Causa infinite loops
   export function useCognitiveLoad() {
     return useCognitiveLoadStore((state) => ({
       status: state.getLoadStatus(), // ← NO hacer esto
     }));
   }
   ```

3. **Servicios:**
   - `cognitiveLoadMetrics.ts` - Cálculo de métricas CLT
   - `missionGenerator.ts` - Generación de misiones con CLT
   - `postCognitiveRewards.ts` - Recompensas post-sesión
   - `warmupSelector.ts` - Selección de warmups

### Sistema de Misiones

1. **Store (`useMissionStore`):**
   - Misiones diarias generadas automáticamente
   - Tipos: input, exercises, janus, forgeMandate, streak
   - Campos CLT: cognitiveLoadTarget, estimatedMinutes, requiresFocus
   - Integración con warmups

2. **Componentes:**
   - `MissionFeed.tsx` - Lista de misiones con estadísticas
   - `WarmupGate.tsx` - Portal de calentamiento antes de misiones

---

## Archivos Creados/Modificados Esta Sesión

### Nuevos
- `src/app/missions/page.tsx` - Página de misiones
- `src/components/exercises/lazy.tsx` - Lazy loading (renombrado)
- `src/components/missions/MissionFeed.tsx`
- `src/components/warmups/RhythmSequenceWarmup.tsx`
- `src/components/warmups/VisualMatchWarmup.tsx`
- `src/components/warmups/WarmupGate.tsx`
- `src/store/useCognitiveLoadStore.ts`
- `src/services/missionGenerator.ts`
- `src/services/warmupSelector.ts`
- `src/hooks/usePerformance.ts`
- `public/manifest.json`, `public/sw.js` - PWA

### Modificados
- `src/components/layout/BottomNav.tsx` - Añadido Misiones
- `src/store/useCognitiveLoadStore.ts` - Fix infinite loops
- `src/components/missions/MissionFeed.tsx` - Fix infinite loops
- Múltiples archivos - Lint fixes

## Próximos Pasos

### Inmediato (Crítico) - ÁREA 0
1. **TAREA 3.1** - Crear schema para ÁREA 0
2. **TAREA 3.2-3.8** - Nodos 0.1-0.7 de contenido base
3. **TAREA 3.9** - Integración ÁREA 0 en Sistema

### Supabase (Pendiente)
- Ejecutar `supabase/schema.sql` en SQL Editor
- Credenciales configuradas en `.env.local`

### Medio Plazo
- Expansión contenido A1
- Tests E2E con Playwright

## Decisiones Técnicas Importantes

1. **Zustand Selectors:** NUNCA llamar métodos/funciones dentro de selectores - calcular valores derivados fuera
2. **useEffect con Zustand:** Usar useRef para controlar ejecución única si las funciones del store son dependencias
3. **useMemo para valores derivados:** Calcular estados complejos con useMemo en vez de usar funciones del store

## Métricas Actuales

### Navegación
- ✅ 5 secciones: Mapa | Misiones | Input | Decks | Perfil

### Sistema de Misiones
- ✅ Página accesible desde navegación
- ✅ Warmup opcional e integrado
- ✅ 4 tipos de misiones (input, exercises, janus, forgeMandate)

### Build
- ✅ Compila sin errores
- ⚠️ Warnings de eslint (react-hooks/exhaustive-deps) - no bloquean

## Bloqueadores Actuales

Ninguno. El sistema está funcional.

## Estructura de Stores Actualizada
```
src/store/
├── useSRSStore.ts           # Sistema SRS
├── useInputStore.ts         # Métricas INPUT
├── useImportedNodesStore.ts # Contenido importado
├── useWordDictionaryStore.ts # Diccionario de palabras
├── useUserStore.ts          # Configuración usuario
├── useMissionStore.ts       # Misiones diarias
├── useCognitiveLoadStore.ts # CLT y Focus Mode
└── useGamificationStore.ts  # XP, coins, gems, streak
```
