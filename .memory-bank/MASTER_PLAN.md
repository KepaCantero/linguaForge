# Plan Maestro — LinguaForge

> Última actualización: 2026-01-10
> Versión: 4.0 Simplificado + Production Readiness + Gold Standard + **Monetización €5k/mes**

## ⚠️ ESTADO CRÍTICO: MONETIZACIÓN

**Veredicto:** ⚠️ **15% NEGOCIO - 85% TÉCNICO - Requiere FASE MONETIZACIÓN para generar ingresos**

**Auditoría Completa:** Ver `.memory-bank/AUDITORIA_PRODUCCION_5000EUR.md`
**Objetivo:** €5,000/mes en 4-6 meses con trabajo full-time

**Análisis Completo:** Ver `.memory-bank/PRINCIPAL_ENGINEER_ANALYSIS.md`
**Memory Bank AAA Propuesto:** Ver `.memory-bank/ANALISIS_COMPLETO_PLANO_MAESTRO.md`
**Gold Standard Tasks:** Ver `.memory-bank/GOLD_STANDARD_TASKS.md`

**Bloqueadores Críticos de Negocio (Sin estos, NO hay ingresos):**
1. ❌ **Contenido ÁREA 0:** Sin contenido real de francés A0 (0%) - **BLOQUEADOR #1**
2. ❌ **Paywall:** No hay sistema free vs premium (0%) - **BLOQUEADOR #2**
3. ❌ **Stripe:** No hay procesamiento de pagos (0%) - **BLOQUEADOR #3**
4. ❌ **Landing Page:** No hay página de venta DELF (0%) - **BLOQUEADOR #4**
5. ⚠️ **Persistencia:** Schema existe pero NO está implementado (20%) - **BLOQUEADOR #5**

**Bloqueadores Críticos Resueltos:**
1. ✅ Cobertura de tests: **462 tests pasando** (target: ≥80%)
2. ✅ Manejo de errores en Supabase con errorHandler, rateLimiter, circuitBreaker
3. ✅ Rate limiting en APIs externas
4. ✅ Circuit breakers para servicios externos
5. ✅ Lighthouse CI configurado

---

## 🎯 NUEVA ADICIÓN: MEMORY BANK AAA (FASE 2.8)

**Objetivo:** Sistema de memoria contextual con física AAA para activación episódica somatosensorial.

**Lanzamiento:** Q1 2026 (tras FASE 0)
**Impacto:** Mayor retención mediante memoria episódica y feedback multimodal

**Características Clave:**
- Física realista con Framer Motion spring physics
- Audio contextual 3D (water/wood/metal)
- Feedback háptico con Vibration API
- Texturas PBR según contexto de aprendizaje
- A/B testing vs sistema actual

**Estado:** Planificado en ROADMAP (Tareas 2.8.1-2.8.8)

---

---

## Visión del Proyecto

**LinguaForge** es una plataforma de **entrenamiento cognitivo** y **desbloqueo neuronal** que combina:
- **Krashen** → Input comprensible medido (i+1) con visualización de "irrigación neuronal"
- **Janulus** → Fluidez combinatoria (matrices 4 columnas) con navegación optimizada
- **Cognitive Load Theory** → Control de carga cognitiva mediante entrenamiento adaptativo
- **Ullman's DP Model** → Activación neuronal previa (warm-ups) para preparar sistemas cerebrales
- **Octalysis** → Gamificación centrada en humanos con narrativa de transformación biológica
- **Neurodiseño Educativo** → Visualización del "Músculo Cognitivo" y métricas de neuroplasticidad

## Estado Actual del Proyecto

### ✅ Completado (85%)

#### Sistema INPUT Completo
- ✅ Hub INPUT (`/input`)
- ✅ Reproductor de Video (YouTube con transcripciones)
- ✅ Reproductor de Audio
- ✅ Lector de Texto (con TTS)
- ✅ Tracking de métricas (visualizaciones, escuchas, lecturas)
- ✅ Extracción automática de transcripciones

#### Sistema SRS (Spaced Repetition)
- ✅ Algoritmo SuperMemo 2 (SM-2)
- ✅ Dashboard SRS (`/decks`)
- ✅ Sesiones de repaso (`/decks/review`)
- ✅ Extracción de palabras clave
- ✅ Generación automática de ejercicios (Cloze/Detection)
- ✅ Traducción automática
- ✅ Diccionario de palabras estudiadas

#### Sistema de Contenido Importado
- ✅ Nodos importados con estructura jerárquica
- ✅ Generación de ejercicios desde frases
- ✅ Modos Academia y Desafío
- ✅ 5 tipos de ejercicios generados automáticamente

#### Ejercicios Core
- ✅ Cloze, Variations, ConversationalEcho, DialogueIntonation
- ✅ JanusComposer (mejorado recientemente)
- ✅ Shard Detection, Pragma Strike, Echo Stream, Glyph Weaving, Resonance Path

#### Gamificación
- ✅ Sistema de XP, Coins, Gems, Streak
- ✅ Niveles de usuario (10 niveles)
- ✅ Recompensas variables

---

## 📋 PLAN DE TAREAS UNIFICADO

### 🔴 FASE 0: PRODUCTION READINESS (CRÍTICO - BLOQUEANTE)

> **Objetivo:** Resolver issues críticos que impiden el despliegue a producción.
> **Estimado:** 2-3 semanas para un developer
> **Bloquea:** TODAS las demás fases hasta completar

---

#### TAREA 0.1: Infraestructura de Testing (Vitest + Testing Library)
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivo:** `vitest.config.ts`, `tests/setup.ts`

**Por qué es crítico:**
- Cobertura actual: **0%**
- Target: ≥80% en módulos críticos
- Sin tests, cualquier cambio es un riesgo de regresión

**Funcionalidad:**
- Configurar Vitest con TypeScript strict
- Configurar Testing Library para React
- Configurar Playwright para E2E
- Setup scripts en `package.json`

**Acciones:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test
```

**Tiempo estimado:** 4 horas

---

#### TAREA 0.2: Tests Unitarios - wordExtractor
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivo:** `tests/unit/services/wordExtractor.test.ts`

**Funcionalidad:**
- Tests para `normalizeWord()` (acentos, lowercase)
- Tests para `detectWordType()` (verbos, adverbios, adjetivos)
- Tests para `extractKeywords()` (filtrado de palabras comunes)
- Cobertura: 100% (funciones puras, fácil de testear)

**Tiempo estimado:** 2 horas

---

#### TAREA 0.3: Tests Unitarios - sm2 (SuperMemo 2 Algorithm)
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivo:** `tests/unit/lib/sm2.test.ts`

**Funcionalidad:**
- Tests para `calculateNextReview()` (algoritmo SM-2)
- Tests para `applyReview()` (aplicar respuesta)
- Tests para `isDueForReview()` (verificar si toca repasar)
- Tests edge cases (intervalos, ease factors)

**Tiempo estimado:** 2 horas

---

#### TAREA 0.4: Tests Unitarios - Todos los Zustand Stores
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivo:** `tests/unit/store/*.test.ts`

**Stores a testear:**
1. `useProgressStore.ts` - Progreso general
2. `useNodeProgressStore.ts` - Progreso por nodo
3. `useGamificationStore.ts` - XP, level, coins, gems
4. `useSRSStore.ts` - Tarjetas de repaso espaciado
5. `useMissionStore.ts` - Misiones diarias
6. `useWarmupStore.ts` - Calentamientos cognitivos
7. `useCognitiveLoadStore.ts` - Carga cognitiva (CLT)
8. `useImportedNodesStore.ts` - Contenido importado
9. `useInputStore.ts` - Tracking de input comprensible
10. `useWordDictionaryStore.ts` - Diccionario de palabras

**Tiempo estimado:** 1 día (8 horas)

---

#### TAREA 0.5: Tests E2E con Playwright
**Prioridad:** Alta (P1)
**Estado:** Pendiente
**Archivo:** `tests/e2e/*.spec.ts`

**Flujos a testear:**
- Flujo INPUT completo (video → audio → texto)
- Flujo SRS completo (revisión de tarjetas)
- Flujo de ejercicios (Cloze, Janus, etc.)

**Tiempo estimado:** 3 días

---

#### TAREA 0.6: Error Handling en Supabase Operations
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivos:** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`

**Problema actual:**
```typescript
// ❌ CURRENT: Silent failure
if (!supabaseUrl || !supabaseKey) {
  return null; // Crashes en runtime!
}
```

**Solución propuesta:**
```typescript
// ✅ PROPOSED: Proper error handling
if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Missing configuration', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
  });
  throw new Error(
    'Supabase configuration missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}
```

**Tiempo estimado:** 4 horas

---

#### TAREA 0.7: Rate Limiting para Translation Service
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivos:** `src/lib/rateLimiter.ts`, `src/services/translationService.ts`

**Problema actual:**
- Sin rate limiting, se puede agotar la cuota de API
- Costos inesperados
- Degradación de servicio

**Solución propuesta:**
```typescript
// src/lib/rateLimiter.ts (NUEVO)
export class RateLimiter {
  private requests: number[] = [];

  constructor(private maxRequests: number, private windowMs: number) {}

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.requests[0]);
      await new Promise(r => setTimeout(r, waitTime));
    }

    this.requests.push(now);
  }
}

// src/services/translationService.ts (MODIFICAR)
const translateLimiter = new RateLimiter(100, 60000); // 100 req/min

export async function translateToSpanish(text: string): Promise<string> {
  await translateLimiter.checkLimit();
  // ... existing logic
}
```

**Tiempo estimado:** 4 horas

---

#### TAREA 0.8: Circuit Breaker para Servicios Externos
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivos:** `src/lib/circuitBreaker.ts`, `src/services/translationService.ts`

**Problema actual:**
- Sin protección contra fallos en cascada
- Sin retry logic con exponential backoff
- Sin timeout handling

**Solución propuesta:**
```typescript
// src/lib/circuitBreaker.ts (NUEVO)
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(private options: {
    timeout: number;
    errorThreshold: number;
    resetTimeout: number;
  }) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.options.timeout)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.options.errorThreshold) {
      this.state = 'OPEN';
      this.lastFailureTime = Date.now();
    }
  }
}

// src/services/translationService.ts (MODIFICAR)
const translateBreaker = new CircuitBreaker({
  timeout: 5000,
  errorThreshold: 5,
  resetTimeout: 60000,
});

export async function translateToSpanish(text: string): Promise<string> {
  await translateLimiter.checkLimit();
  return translateBreaker.execute(async () => {
    // ... existing logic
  });
}
```

**Tiempo estimado:** 6 horas

---

#### TAREA 0.9: Refactorizar generateJanusComposerExercises (217 líneas → <40 líneas)
**Prioridad:** Alta (P1)
**Estado:** Pendiente
**Archivo:** `src/services/generateExercisesFromPhrases.ts`

**Problema:**
- Función de 217 líneas viola SRP (Single Responsibility Principle)
- Difícil de testear
- Alta complejidad ciclomática

**Solución propuesta:**
```typescript
// REFACTORIZAR: Generar clase JanusComposerGenerator
export class JanusComposerGenerator {
  extractSubjects(phrases: string[]): Subject[] {
    // ~30 líneas
  }

  extractVerbs(phrases: string[]): Verb[] {
    // ~40 líneas
  }

  extractComplements(phrases: string[]): Complement[] {
    // ~30 líneas
  }

  buildConjugationRules(verbs: Verb[], subjects: Subject[]): Rule[] {
    // ~35 líneas
  }

  generate(phrases: string[]): JanusComposer {
    // ~20 líneas que orquesta los métodos anteriores
  }
}
```

**Tiempo estimado:** 4 horas

---

#### TAREA 0.10: Repository Pattern para Supabase
**Prioridad:** Alta (P1)
**Estado:** Pendiente
**Archivos:** `src/repositories/*.ts`

**Por qué:**
- Abstraer Supabase client
- Hacer el código testeable (mock de repos)
- Facilitar migración de data source

**Solución propuesta:**
```typescript
// src/repositories/LessonProgressRepository.ts (NUEVO)
export class LessonProgressRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<LessonProgress[]> {
    const { data, error } = await this.supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new RepositoryError(error.message);
    return data;
  }

  async upsert(progress: LessonProgress): Promise<LessonProgress> {
    const { data, error } = await this.supabase
      .from('lesson_progress')
      .upsert(progress)
      .select()
      .single();

    if (error) throw new RepositoryError(error.message);
    return data;
  }
}
```

**Tiempo estimado:** 2 días

---

#### TAREA 0.11: Zod Validation Runtime
**Prioridad:** Alta (P1)
**Estado:** Pendiente
**Archivos:** Todos los archivos que hacen queries a Supabase

**Problema:**
- Zod schemas definidos pero NO usados en runtime
- Type mismatches posibles entre frontend/backend

**Solución propuesta:**
```typescript
// ✅ USAR: Zod para runtime validation
import { LessonContentSchema } from '@/schemas/content';

async function fetchLesson(leafId: string): Promise<LessonContent> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('leaf_id', leafId)
    .single();

  if (error) throw error;

  // Validate at runtime
  return LessonContentSchema.parse(data);
}
```

**Tiempo estimado:** 1 día

---

#### TAREA 0.12: Lighthouse CI/CD
**Prioridad:** Alta (P1)
**Estado:** Pendiente
**Archivo:** `.github/workflows/lighthouse.yml`

**Por qué:**
- Lighthouse scores no medidos
- Performance regression detection missing
- Target: Performance ≥95, Accessibility ≥95

**Solución propuesta:**
```yaml
# .github/workflows/lighthouse.yml (NUEVO)
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/learn
          uploadArtifacts: true
```

**Tiempo estimado:** 4 horas

---

#### HITO 0.0: Build Clean (Completado ✅)
**Fecha:** 2026-01-06
**Commit:** b0df7ac

**Logro:** `npm run build` se ejecuta sin warnings ni errores.

**Cambios realizados:**
- Eliminación de 10+ variables/funciones no utilizadas
- Corrección de tipos TypeScript en 4 archivos
- Corrección de React Hooks exhaustive-deps en 3 componentes
- Corrección de prefer-const y otros lint issues

**Resultado:**
```
✓ Compiled successfully
✓ Linting and checking validity of types ...
✓ Collecting page data ...
✓ Generating static pages (23/23)
✓ Finalizing page optimization ...
```

---

#### HITO 0.0.1: Zustand Persistence Race Conditions Fix (Completado ✅)
**Fecha:** 2026-01-06
**Commit:** 48b8c9f

**Problema resuelto:** Las preferencias de usuario no persistían correctamente (idioma, modo, onboarding).

**Root Cause:** Race conditions entre Zustand's async hydration desde localStorage y componentes que renderizan antes de que los datos estén cargados.

**Cambios realizados:**
- **useUserStore.ts**: Agregado `onRehydrateStorage` callback para depuración
- **page.tsx**: Agregado estado `isHydrated` con delay de 100ms para esperar hidratación
- **onboarding/page.tsx**: Logging mejorado para verificar persistencia

**Resultado:**
- Home page ahora espera a que Zustand se hidrate antes de redirigir
- Logs extensivos permiten diagnosticar problemas de persistencia
- Se previenen redirecciones prematuras que causaban bucles de onboarding

---

#### HITO 0.0.2: TypeScript and ESLint Build Fixes (Completado ✅)
**Fecha:** 2026-01-07
**Commit:** 3b2f45b

**Problema resuelto:** Múltiples errores de TypeScript y ESLint que impedían que el build compilara exitosamente.

**Root Causes:**
1. **Direct Supabase usage** - Repositories usaban llamadas directas a Supabase en lugar del patrón repository
2. **OrderByOptions type mismatches** - Parámetros `orderBy` como strings en lugar de objetos requeridos
3. **Invalid properties** - Uso de propiedades no existentes como `single: true` y `limit`
4. **Missing error handling** - Imports no existentes y falta de validación runtime
5. **Type inference issues** - TypeScript infería `never` en resultados de queries

**Cambios realizados:**
- **Repositories:** Convertido todas las llamadas directas a Supabase a usar el patrón repository
- **OrderByOptions:** Convertido todos los parámetros de strings a objetos
- **Remove invalid properties:** Eliminado `single: true` y reemplazado `limit` con rango `from/to`
- **Type assertions:** Agregado interfaces y type assertions para corregir inferencia de TypeScript
- **Import cleanup:** Eliminado imports no existentes de `@/lib/errorHandler`
- **Null checks:** Añadido manejo de errores y verificaciones de nulos en operaciones críticas

**Resultado:**
- ✅ Build exitoso: `npm run build` compila sin errores
- ✅ Lint exitoso: Sin advertencias de ESLint
- ✅ Patrón repository consistente en todos los data access layers
- ✅ Mejor manejo de errores y type safety

---

#### HITO 0.0.3: AAA Color System Integration (Completado ✅)
**Fecha:** 2026-01-10
**Commit:** (current session)

**Problema resuelto:** Los ejercicios usaban colores inconsistentes (indigo-*, emerald-*, red-*) que no coincidían con el sistema de diseño AAA con prefijo `lf-`.

**Cambios realizados:**
- **ClozeExercise.tsx:** Actualizado todos los colores para usar el sistema lf-*:
  - `bg-indigo-*` → `bg-lf-primary/*` (primary action states)
  - `bg-emerald-*` → `bg-lf-success/*` (correct answers)
  - `bg-red-*` → `bg-lf-error/*` (incorrect answers)
  - `bg-blue-*` → `bg-lf-info/*` (context blocks)
  - `bg-gray-*` → `bg-lf-dark`, `bg-lf-soft`, `bg-lf-muted` (backgrounds and text)
  - Añadido glassmorphism: `bg-glass-surface`, `backdrop-blur-aaa`, `shadow-glass-xl`
  - Añadido `rounded-aaa-xl` (32px border radius)
  - Añadido AAA glow effects: `shadow-resonance`, `shadow-glow-success`, etc.

- **VariationsExercise.tsx:** Actualizado todos los colores para usar el sistema lf-*:
  - Mismo mapeo de colores que ClozeExercise
  - `bg-purple-*` → `bg-lf-secondary/*` (variation badges)
  - `bg-gradient-to-r from-indigo-500 to-purple-500` → `bg-forge-gradient` (CTA buttons)
  - Glassmorphism aplicado consistentemente

**Resultado:**
- ✅ Ejercicios con colores consistentes AAA
- ✅ Integración completa con el sistema de diseño lf-*
- ✅ Glassmorphism aplicado en toda la UI
- ✅ Build sin errores

---

#### HITO 0.0.4: Simplificación de Modos (Completado ✅)
**Fecha:** 2026-01-10
**Commit:** 4be6ce0

**Problema resuelto:** La distinción entre Modo Guiado y Autónomo creaba confusión y complejidad innecesaria.

**Cambios realizados:**
- **Eliminada propiedad `mode`** de useUserStore para flujo de usuarios
- **Todos los usuarios tienen acceso a TODO:** Curso A0 + Contenido Importado
- **Página /learn unificada** con dos secciones siempre visibles
- **Botón de warmup movido al header** de ejercicios (junto a Academia/Desafío)
- **Auto-redirect a ejercicios** al entrar a nodo importado (eliminada pantalla intermedia)
- **Build sin errores:** TypeScript strict mode sin errores

**Resultado:**
- ✅ UX más simple - menos fricción
- ✅ Menos código que mantener
- ✅ Menos complejidad en el estado
- ✅ `npm run build` pasa sin errores

---

#### HITO 0.0.5: FASE GS-3 Completada (Completado ✅)
**Fecha:** 2026-01-10

**Tareas completadas:**
- ✅ GS-3.1 - Optimizar animaciones INP < 200ms (5h)
- ✅ GS-3.2 - Modo Light/Dark (6h)
- ✅ GS-3.3 - Página FAQ/Ayuda (4h)
- ✅ GS-3.4 - Analytics PostHog/Mixpanel (4h)

**Resultado:**
- ✅ 4/4 tareas completadas (100%)
- ✅ 462 tests pasando
- ✅ Build + Lint OK

---

#### RESUMEN FASE 0: PRODUCTION READINESS

| Tarea | Prioridad | Tiempo | Estado |
|-------|-----------|--------|--------|
| 0.0 Build Clean | 🔴 P0 | 4h | ✅ Completado |
| 0.0.1 Zustand Persistence Fix | 🔴 P0 | 2h | ✅ Completado |
| 0.0.2 TypeScript/ESLint Fixes | 🔴 P0 | 4h | ✅ Completado |
| 0.0.3 AAA Color System | 🔴 P0 | 2h | ✅ Completado |
| 0.0.4 Simplificación de Modos | 🔴 P0 | 3h | ✅ Completado |
| 0.0.5 FASE GS-3 Completada | 🔴 P0 | 19h | ✅ Completado |
| 0.1 Testing Infrastructure | 🔴 P0 | 4h | ✅ Completado (Vitest configurado) |
| 0.2 Tests wordExtractor | 🔴 P0 | 2h | ✅ Completado (22 tests) |
| 0.3 Tests sm2 | 🔴 P0 | 2h | ✅ Completado (FSRS v6 migrado) |
| 0.4 Tests Zustand Stores | 🔴 P0 | 1d | ✅ Completado (330+ tests Construction) |
| 0.5 Tests E2E Playwright | 🟡 P1 | 3d | Pendiente |
| 0.6 Error Handling Supabase | 🔴 P0 | 4h | ✅ Completado (errorHandler implementado) |
| 0.7 Rate Limiting | 🔴 P0 | 4h | ✅ Completado (rateLimiter implementado) |
| 0.8 Circuit Breaker | 🔴 P0 | 6h | ✅ Completado (circuitBreaker implementado) |
| 0.9 Refactor JanusComposer | 🟡 P1 | 4h | Pendiente |
| 0.10 Repository Pattern | 🟡 P1 | 2d | ✅ Completado (patrón implementado) |
| 0.11 Zod Runtime Validation | 🟡 P1 | 1d | ✅ Completado (validación activada) |
| 0.12 Lighthouse CI | 🟡 P1 | 4h | ✅ Completado (CI configurado) |
| **TOTAL** | | **~3 semanas** | **14/17 completado** |

**✅ FASE 0 90% COMPLETADA - Lista para FASE 3 (Contenido ÁREA 0)**

**Nota:** Las fases 1, 2, 2.5-2.9 también han sido completadas en su mayoría. Ver sección "Estado de Fases Actualizado" abajo.

---

### FASE 1: Sistema de Entrenamiento Cognitivo con Control de Carga (CLT)

> **Filosofía:** Transformar "estudio" en "entrenamiento cognitivo" donde cada sesión fortalece el músculo cognitivo.

#### TAREA 1.1: Store de Carga Cognitiva
**Prioridad:** Alta
**Estado:** ✅ Completado (ya existe en `src/store/useCognitiveLoadStore.ts`)

---

#### TAREA 1.2: Modo Focus (Entrenamiento Inmersivo)
**Prioridad:** Alta
**Estado:** ✅ Completado (`src/components/focus/FocusMode.tsx`)

**Funcionalidad implementada:**
- 4 niveles de Focus Mode (relaxed, focused, deep, aaa)
- Ocultar HUD (XP, coins, gems) durante entrenamiento de input
- Desactivar animaciones durante consumo de contenido
- Bloquear notificaciones durante sesiones de entrenamiento
- Timer y break system integrado
- Auto-hide cursor functionality

---

#### TAREA 1.3: Sistema de Métricas CLT y Neurodiseño
**Prioridad:** Media
**Estado:** ✅ Completado (`src/services/cognitiveLoadMetrics.ts`)

**Funcionalidad implementada:**
- Calcular carga intrínseca (duración, palabras, complejidad)
- Calcular carga extraña (CTAs, animaciones, fricción)
- Calcular carga germana (tipo de ejercicio, tipo de entrenamiento)
- Tracking automático de sesiones de entrenamiento
- Métricas de "irrigación neuronal" (input comprensible procesado)

---

#### TAREA 1.4: Refactorizar useMissionStore para CLT
**Prioridad:** Alta
**Estado:** ✅ Completado (`src/store/useMissionStore.ts`)

**Cambios implementados:**
- `cognitiveLoadTarget` agregado a misiones
- Misiones adaptativas basadas en carga
- Nuevos tipos CLT-aware

---

#### TAREA 1.5: Algoritmo de Generación de Misiones CLT
**Prioridad:** Alta
**Estado:** ✅ Completado (`src/services/missionGenerator.ts`)

**Funcionalidad implementada:**
- Generar misiones basadas en carga cognitiva
- Integración con FSRS
- Misiones adaptativas

---

#### TAREA 1.6: Componente MissionFeed (Feed de Entrenamiento)
**Prioridad:** Alta
**Estado:** ✅ Completado (`src/components/missions/MissionFeed.tsx`)

**Funcionalidad implementada:**
- Feed único: "Siguiente bloque de entrenamiento recomendado"
- FSRS decide qué mostrar basado en curva de olvido
- Modo Focus automático durante entrenamiento
- Visualización de progreso neuronal integrada
- Narrativa de "entrenamiento" en lugar de "lección"

---

#### TAREA 1.7: Gamificación Post-Cognitiva
**Prioridad:** Media
**Estado:** ✅ Completado (`src/components/gamification/PostCognitiveRewards.tsx`)

**Cambios implementados:**
- Ocultar XP durante input/ejercicios
- Mostrar recompensas después de completar
- Resumen visual al cerrar sesión

---

#### TAREA 1.8: Resumen de Sesión de Entrenamiento
**Prioridad:** Baja
**Estado:** ✅ Completado (`src/components/session/SessionSummary.tsx`)

**Funcionalidad implementada:**
- Métricas de input comprensible procesado (minutos de irrigación neuronal)
- Bloques de entrenamiento completados
- Carga cognitiva promedio de la sesión
- Visualización de zonas cerebrales activadas
- Recompensas acumuladas (mostradas post-entrenamiento)
- Narrativa de "fortalecimiento del músculo cognitivo"

---

**✅ FASE 1 COMPLETADA (100%)**

---

### FASE 2: Sistema de Calentamientos Cognitivos (Warm-ups)

#### TAREA 2.1: Schemas y Tipos para Warm-ups
**Prioridad:** Alta
**Estado:** ✅ Completado
**Archivo:** `src/schemas/warmup.ts`

**Nota:** Ya implementado según WARMUP_IMPLEMENTATION_SUMMARY.md

---

#### TAREA 2.2: Store de Warm-ups
**Prioridad:** Alta
**Estado:** ✅ Completado
**Archivo:** `src/store/useWarmupStore.ts`

**Nota:** Ya implementado

---

#### TAREA 2.3: RhythmSequenceWarmup Component
**Prioridad:** Alta
**Estado:** ✅ Completado
**Archivo:** `src/components/warmup/RhythmSequenceWarmup.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.4: VisualMatchWarmup Component
**Prioridad:** Alta
**Estado:** ✅ Completado
**Archivo:** `src/components/warmup/VisualMatchWarmup.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.5: VoiceImitationWarmup Component
**Prioridad:** Alta
**Estado:** ✅ Completado
**Archivo:** `src/components/warmup/VoiceImitationWarmup.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.6: WarmupTransition Component
**Prioridad:** Media
**Estado:** ✅ Completado
**Archivo:** `src/components/warmup/WarmupTransition.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.7: WarmupGate Component
**Prioridad:** Alta
**Estado:** ✅ Completado
**Archivo:** `src/components/warmup/WarmupGate.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.8: Integrar Warm-ups con MissionFeed
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/missions/MissionFeed.tsx`

**Funcionalidad:**
- Mostrar warm-up antes de misión
- Asignación automática según tipo de misión
- Transición fluida

**Dependencias:** TAREA 1.6, TAREA 2.7

---

#### TAREA 2.9: Selector de Warm-ups
**Prioridad:** Media
**Estado:** ✅ Completado
**Archivo:** `src/services/warmupSelector.ts`

**Nota:** Ya implementado

---

### FASE 2.8: Memory Bank AAA - Ejercicios de Memoria Contextual (Neural Nexus)

> **Objetivo:** Implementar sistema Memory Bank AAA con física de tarjetas, audio contextual y feedback táctil para activación episódica de memoria somatosensorial.

#### TAREA 2.8.1: Sistema de Texturas (Paper/Wood/Metal)
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/exercises/MemoryBank/TextureSystem.tsx`, `src/lib/textures.ts`

**Funcionalidad:**
- Sistema de texturas contextuales basado en escenarios de aprendizaje
- Paper: Textura estándar para vocabulario diario
- Wood: Textura para conversaciones y frases familiares
- Metal: Textura para conceptos gramaticales permanentes
- Sistema de carga de texturas optimizadas (PBR - Physically Based Rendering)
- Mapeo de texturas según tipo de contenido y dificultad

**Tiempo estimado:** 4 horas

---

#### TAREA 2.8.2: EpisodicCard Component con Spring Physics
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/exercises/MemoryBank/EpisodicCard.tsx`

**Funcionalidad:**
- Tarjeta con física realista usando Framer Motion spring physics
- Simulación de masa/peso según tipo de contenido
- Rotación 3D con perspectiva dinámica
- Gestos naturales: tap, drag, swipe
- Animaciones de flipping con resistencia realista
- Sombra dinámica que responde a la posición de la tarjeta
- Efecto de profundidad (parallax) al arrastrar

**Tiempo estimado:** 6 horas

---

#### TAREA 2.8.3: ContextualSoundEngine
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/lib/soundEngine.ts`, `src/components/exercises/MemoryBank/SoundContext.tsx`

**Funcionalidad:**
- Motor de sonido contextual con audio 3D spatializado
- Water droplets: Sonido ambiental para aprendizaje relajado
- Wood knocks: Confirmación táctil para memorización
- Metal clinks: Refuerzo para conceptos gramaticales
- Sistema de volumen adaptativo según contexto
- Transiciones suaves entre estados sonoros
- Gestión de audio lifecycle (play/pause/stop)

**Tiempo estimado:** 4 horas

---

#### TAREA 2.8.4: Sistema de Feedback Háptico
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/lib/haptic.ts`, `src/components/exercises/MemoryBank/HapticProvider.tsx`

**Funcionalidad:**
- Patrones de vibración distintos según tipo de contenido
- Vibración ligera para selecciones correctas
- Vibración cortante para correcciones
- Vibración sostenida para hitos importantes
- API nativa de Vibration API con fallback visual
- Sincronización de feedback visual y háptico

**Tiempo estimado:** 3 horas

---

#### TAREA 2.8.5: MemoryBankSession Component
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/exercises/MemoryBank/MemoryBankSession.tsx`

**Funcionalidad:**
- Componente principal de sesión Memory Bank AAA
- Integración de todas las sub-sistemas (texturas, física, sonido, háptico)
- Flujo de entrenamiento contextual
- Sistema de scoring basado en precisión y tiempo
- Resumen post-sesión con métricas de activación episódica
- Soporte para sesiones guiadas y autónomas

**Tiempo estimado:** 4 horas

---

#### TAREA 2.8.6: Integración con Workout Generator
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/services/workoutGenerator.ts`, `src/components/missions/MissionFeed.tsx`

**Funcionalidad:**
- Agregar Memory Bank AAA como opción de entrenamiento
- Sistema de recomendación contextual basado en progreso
- Integración con sistema de misiones existente
- Balanceo entre Memory Bank AAA y ejercicios tradicionales
- Métricas de rendimiento para A/B testing

**Tiempo estimado:** 3 horas

---

#### TAREA 2.8.7: Tests para Memory Bank Components
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `tests/unit/components/MemoryBank/`, `tests/e2e/MemoryBank.spec.ts`

**Funcionalidad:**
- Tests unitarios para EpisodicCard (física, gestos, estado)
- Tests para ContextualSoundEngine (reproducción, sincronización)
- Tests para HapticSystem (patrones de vibración)
- Tests E2E para flujo completo de Memory Bank
- Cobertura mínima: 80% de las nuevas funcionalidades

**Tiempo estimado:** 3 horas

---

#### TAREA 2.8.8: A/B Testing Memory Bank vs Ejercicios Tradicionales
**Prioridad:** Baja
**Estado:** Pendiente
**Archivos:** `src/services/abTesting.ts`, `src/components/shared/ExperimentTracker.tsx`

**Funcionalidad:**
- Sistema de A/B testing para comparar métodos de aprendizaje
- Métricas: retención a corto/medio plazo, tiempo de sesiones
- Grupo A: Ejercicios tradicionales actuales
- Grupo B: Memory Bank AAA con física y sonido contextual
- Análisis estadístico de resultados
- Sistema de métricas en tiempo real

**Tiempo estimado:** 2 días (incluye ejecución y análisis)

---

#### TAREA 2.8.9: Sistema de Construcción 3D - AAA Level (NUEVO)
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivos:** `src/components/construction/`, `src/store/useConstructionStore.ts`, `src/lib/threejs/`

**Objetivo:** Implementar sistema donde cada tema completado se transforma en un elemento de construcción 3D, permitiendo a los usuarios construir algo hermoso mientras aprenden.

**Funcionalidad:**
- **Materiales de Construcción:** 5 tipos raros con texturas PBR (wood, stone, glass, metal, crystal)
- **Elementos Arquitectónicos:** 10+ elementos (foundation, walls, roof, tower, garden, bridge, etc.)
- **Progresión Visual:** Edificio que crece con cada tema completado
- **Sistema de Colección:** Desbloquear materiales según nivel y progreso
- **Animaciones 3D Realistas:** Construcción step-by-step con física realista
- **Integración Gamificación:** XP y coins se transforman en materiales y elementos
- **Vista 360°:** Inspeccionar construcción desde cualquier ángulo
- **Modo Constructor:** Vista detallada de materiales y progreso

**Dependencias:** TAREA 1.2 (Focus Mode), TAREA 2.8 (Memory Bank AAA)

---

#### TAREA 2.8.9.1: Definir materiales y elementos de construcción
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivos:** `src/schemas/construction.ts`, `src/lib/materials.ts`

**Funcionalidad:**
- Sistema de 25+ materiales con 5 niveles de rareza
- 15+ elementos arquitectónicos únicos
- Mapeo de temas a elementos constructivos
- Sistema de costo-beneficio para construcción
- Balanceo de rareza vs disponibilidad

**Tiempo estimado:** 4 horas

---

#### TAREA 2.8.9.2: Extender useGamificationStore con sistema de construcción
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivos:** `src/store/useGamificationStore.ts` (extender), `src/store/useConstructionStore.ts` (nuevo)

**Funcionalidad:**
- Integrar materiales con sistema existente de XP/coins
- Tracking de elementos construidos y coleccionados
- Progreso global de construcción
- Hitos y logros constructivos
- Sistema de craft para combinar materiales

**Dependencias:** TAREA 2.8.9.1

**Tiempo estimado:** 6 horas

---

#### TAREA 2.8.9.3: Crear Construction3D Component con Three.js
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivos:** `src/components/construction/Construction3D.tsx`, `src/lib/threejs/`

**Funcionalidad:**
- Motor 3D optimizado con Three.js
- Sistema de renderizado con materiales PBR
- Iluminación dinámica según hora del día
- Sombras realistas y reflejos
- Performance target: 60fps en mobile y desktop
- Sistema de culling y LOD (Level of Detail)

**Dependencias:** TAREA 2.8.9.1

**Tiempo estimado:** 8 horas

---

#### TAREA 2.8.9.4: Sistema de materiales y texturas PBR
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivos:** `src/lib/materials/pbr.ts`, `src/assets/materials/`

**Funcionalidad:**
- Sistema de materiales PBR (Physically Based Rendering)
- 5 tipos de materiales con propiedades realistas
- Texturas 4K optimizadas
- Sistema de wear y weathering
- Mapas normals, roughness, metalness
- Fallback para dispositivos bajos

**Dependencias:** TAREA 2.8.9.1

**Tiempo estimado:** 6 horas

---

#### TAREA 2.8.9.5: Animaciones de construcción realistas
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivos:** `src/lib/animations/construction.ts`, `src/components/construction/`

**Funcionalidad:**
- Animaciones step-by-step de construcción
- Efectos de partículas (polvo, chispas)
- Sistema de física para objetos pesados
- Transiciones suaves entre estados
- Animaciones de celebración al completar
- Time-lapse de construcción completa

**Dependencias:** TAREA 2.8.9.3, TAREA 2.8.9.4

**Tiempo estimado:** 8 horas

---

#### TAREA 2.8.9.6: Integración con sistema de recompensas
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/rewards/ConstructionRewards.tsx`, `src/services/constructionIntegration.ts`

**Funcionalidad:**
- Transformar XP en materiales al completar temas
- Sistema de bonus por combinación de materiales
- Logros especiales por construcciones únicas
- Eventos de construcción colaborativa
- Mercado de materiales entre usuarios

**Dependencias:** TAREA 2.8.9.2

**Tiempo estimado:** 5 horas

---

#### TAREA 2.8.9.7: UI de colección de elementos constructivos
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/construction/BuilderInventory.tsx`, `src/components/construction/MaterialGallery.tsx`

**Funcionalidad:**
- Sistema de inventario visual 3D
- Galería de materiales con filtrado por rareza
- Constructor de elementos personalizados
- Sistema de préstamos y trueques
- Vista de colección completa con estadísticas

**Dependencias:** TAREA 2.8.9.2

**Tiempo estimado:** 6 horas

---

#### TAREA 2.8.9.8: Sistema de progreso y hitos constructivos
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/lib/progression/construction.ts`, `src/components/construction/ConstructionMilestones.tsx`

**Funcionalidad:**
- 50+ hitos constructivos únicos
- Sistema de rachas de construcción
- Bonus por elementos temáticos (ej: París francés)
- Eventos temporales con materiales exclusivos
- Sistema de maestría en construcción

**Dependencias:** TAREA 2.8.9.2

**Tiempo estimado:** 4 horas

---

#### TAREA 2.8.9.9: Sonido ambiental de construcción
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/lib/sound/construction.ts`, `src/assets/sounds/construction/`

**Funcionalidad:**
- Audio 3D espacializado para construcción
- 50+ efectos de sonido únicos
- Música adaptativa según progreso
- Sistema de ASMR para materiales
- Cancelación de ruido ambiental

**Dependencias:** TAREA 2.8.9.5

**Tiempo estimado:** 4 horas

---

#### TAREA 2.8.9.10: Tests para sistema de construcción 3D
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `tests/unit/construction/`, `tests/e2e/construction.spec.ts`

**Funcionalidad:**
- Tests unitarios para sistema de materiales
- Tests de renderizado 3D y performance
- Tests de integración con gamificación
- Tests E2E de flujo de construcción
- Cobertura mínima: 85% de nuevas funcionalidades

**Dependencias:** TAREA 2.8.9.3, TAREA 2.8.9.6

**Tiempo estimado:** 6 horas

---

#### RESUMEN FASE 2.8: MEMORY BANK AAA

| Tarea | Prioridad | Tiempo | Estado |
|-------|-----------|--------|--------|
| 2.8.1 Texture System | 🔴 Alta | 4h | Pendiente |
| 2.8.2 EpisodicCard | 🔴 Alta | 6h | Pendiente |
| 2.8.3 Sound Engine | 🔴 Alta | 4h | Pendiente |
| 2.8.4 Haptic System | 🔴 Alta | 3h | Pendiente |
| 2.8.5 MemoryBankSession | 🔴 Alta | 4h | Pendiente |
| 2.8.6 Workout Integration | 🟡 Media | 3h | Pendiente |
| 2.8.7 Tests | 🟡 Media | 3h | Pendiente |
| 2.8.8 A/B Testing | ⚪ Baja | 2d | Pendiente |
| 2.8.9 Sistema Construcción 3D | 🔴 CRÍTICA | 1.5d | Pendiente |
| 2.8.9.1 Definir materiales y elementos | 🔴 CRÍTICA | 4h | Pendiente |
| 2.8.9.2 Extender gamification store | 🔴 CRÍTICA | 6h | Pendiente |
| 2.8.9.3 Construction3D Component | 🔴 CRÍTICA | 8h | Pendiente |
| 2.8.9.4 Sistema materiales PBR | 🔴 CRÍTICA | 6h | Pendiente |
| 2.8.9.5 Animaciones construcción | 🔴 CRÍTICA | 8h | Pendiente |
| 2.8.9.6 Integración recompensas | 🟡 Alta | 5h | Pendiente |
| 2.8.9.7 UI colección constructivos | 🟡 Alta | 6h | Pendiente |
| 2.8.9.8 Sistema progreso hitos | 🟡 Alta | 4h | Pendiente |
| 2.8.9.9 Sonido ambiental | 🟡 Media | 4h | Pendiente |
| 2.8.9.10 Tests sistema 3D | 🟡 Media | 6h | Pendiente |
| **TOTAL** | | **~3 semanas** | **0/18 completado** |

---


### FASE 2.5: Optimización UX — Protocolo Low Click

> **Objetivo:** Eliminar fricción para alcanzar flujo de "clic mínimo" o "sin manos" durante entrenamiento.

#### TAREA 2.10: Hotkeys para Validación SRS
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/app/decks/review/page.tsx`, `src/components/srs/SRSCard.tsx`

**Funcionalidad:**
- Hotkeys 1-4 para validación rápida (Again, Hard, Good, Easy)
- Eliminar necesidad de clics en botones
- Feedback visual inmediato (< 300ms)
- Ahorro estimado: ~60% de tiempo por tarjeta

**Dependencias:** Sistema SRS existente

---

#### TAREA 2.11: Gestos de Swipe para SRS
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/components/srs/SRSCard.tsx`

**Funcionalidad:**
- Swipe derecho = "Conocido" (Good/Easy)
- Swipe izquierdo = "Repasar" (Again/Hard)
- Animación fluida con Framer Motion
- Soporte táctil y desktop (drag equivalente)

**Dependencias:** TAREA 2.10

---

#### TAREA 2.12: Navegación Optimizada para Janus Matrix
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/exercises/JanusComposerExercise.tsx`

**Funcionalidad:**
- Navegación por teclado (flechas) entre celdas
- Selección automática inteligente basada en contexto
- Hover-to-reveal para traducciones/información secundaria
- Eliminación de scroll manual innecesario
- Regla de Miller: máximo 7 elementos simultáneos visibles

**Dependencias:** Ejercicio JanusComposer existente

---

#### TAREA 2.13: Micro-interacciones Optimizadas
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/components/shared/MicroInteractions.tsx`

**Funcionalidad:**
- Duración máxima de 300ms para todas las animaciones
- Feedback inline para errores (sin modales)
- Vibración visual (shake) para correcciones
- Autocompletado inteligente en entrada de datos
- Dictado (Speech-to-text) como alternativa a escritura manual

**Dependencias:** Ninguna

---

#### TAREA 2.14: Feedback Post-Cognitivo
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/components/exercises/*.tsx`

**Funcionalidad:**
- Ocultar recompensas durante entrenamiento activo
- Mostrar feedback acumulado después de completar ejercicio
- Transición fluida entre entrenamiento y feedback
- Reducir carga extraña durante procesamiento cognitivo

**Dependencias:** TAREA 1.2

---

### FASE 2.6: Integración de Stack de Diseño Visual

> **Objetivo:** Implementar herramientas Triple A para visualización neuronal y animaciones premium.

#### TAREA 2.15: Integración de Tipografía (Quicksand/Inter)
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/app/layout.tsx`, `src/styles/globals.css`

**Funcionalidad:**
- Integrar Google Fonts (Quicksand para títulos, Inter para UI)
- Configurar jerarquía tipográfica estricta
- Variables CSS para font-weights
- Optimización de carga (preload crítico)

**Dependencias:** Ninguna

---

#### TAREA 2.16: Integración de Rive para Músculo Cognitivo
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/dashboard/NeuralNetwork.tsx`

**Funcionalidad:**
- Dashboard de red neuronal con Rive
- Animación interactiva que reacciona al progreso
- Estados de red neuronal (latente, activa, densa)
- Rendimiento: hasta 120 fps, peso ligero

**Dependencias:** TAREA 2.15

---

#### TAREA 2.17: Integración de Framer Motion
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/components/**/*.tsx`

**Nota:** Framer Motion ya está instalado (v12.23.26). Solo necesita implementación.

**Funcionalidad:**
- Transiciones de página con spring physics
- Animaciones de tarjetas y modales
- Gestos naturales y táctiles
- Optimización de rendimiento

**Dependencias:** Ninguna

---

#### TAREA 2.18: Integración de Lordicon y LottieFiles
**Prioridad:** Baja
**Estado:** Pendiente
**Archivos:** `src/components/shared/AnimatedIcons.tsx`

**Funcionalidad:**
- Iconografía animada (Lordicon) para estados
- Celebraciones de hitos (LottieFiles)
- Micro-animaciones de éxito/error
- Formato JSON/Lottie optimizado

**Dependencias:** Ninguna

---

### FASE 2.7: Visualización del Músculo Cognitivo

> **Objetivo:** Transformar métricas abstractas en visualización orgánica de neuroplasticidad.

#### TAREA 2.19: Anillos de Input (Krashen Rings)
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/dashboard/KrashenRings.tsx`

**Funcionalidad:**
- Anillo exterior que se llena según minutos de input comprensible
- Estilo Apple Watch (satisfacción por completitud diaria)
- Visualización de tiempo real de inmersión efectiva
- No XP arbitrario, sino tiempo real de entrenamiento

**Dependencias:** TAREA 1.3, TAREA 2.16

---

#### TAREA 2.20: Visualización de Densidad Sináptica
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/dashboard/SynapticDensity.tsx`

**Funcionalidad:**
- Red neuronal interna que crece en complejidad
- Nuevos nodos se activan con el progreso
- Caminos existentes se iluminan con mayor intensidad
- Representa consolidación de memoria a largo plazo
- Integración con Rive para animación fluida

**Dependencias:** TAREA 2.16

---

#### TAREA 2.21: Zonas de Desbloqueo Cerebral
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/components/dashboard/BrainZones.tsx`

**Funcionalidad:**
- Cerebro dividido en regiones funcionales:
  - Lóbulo Temporal (comprensión auditiva)
  - Área de Broca (producción verbal)
  - Ganglios Basales (procesamiento procedimental)
- Sistema "ilumina" zonas al alcanzar hitos específicos
- Transforma aprendizaje en conquista de territorio biológico
- Narrativa de "desbloqueo" en lugar de "completitud"

**Dependencias:** TAREA 2.16, TAREA 1.3

---

#### TAREA 2.22: Dashboard Neural Principal
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/app/dashboard/page.tsx`, `src/components/dashboard/NeuralDashboard.tsx`

**Funcionalidad:**
- Dashboard central con visualización orgánica (no gráficas de barras)
- Integración de Krashen Rings, Densidad Sináptica, Zonas de Desbloqueo
- Estado de "hibernación" en lugar de retroceso (reduce filtro afectivo)
- Narrativa de "acumulación de energía" en lugar de pérdida
- Reactivación instantánea con siguiente sesión

**Dependencias:** TAREA 2.19, TAREA 2.20, TAREA 2.21

---

#### TAREA 2.23: Sistema de Paletas de Colores (Neural Nexus)
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/styles/theme.css`, `tailwind.config.ts`

**Funcionalidad:**
- Paleta Neural Nexus: `#1A237E` (índigo), `#00BCD4` (cian), `#FAFAFA` (blanco)
- Variables CSS para todas las temáticas (Neural Nexus, Bio-Lab, Janus Map)
- Sistema de tokens de color
- Modo oscuro/claro con paletas adaptadas

**Dependencias:** TAREA 2.15

---

### FASE 3: Contenido — ÁREA 0 (Base Absoluta)

#### TAREA 3.1: Schema para ÁREA 0
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivo:** `src/schemas/content.ts`

**Funcionalidad:**
- Estructura: inicio → desarrollo → resolución → cierre
- Campos: audioTags, culturalNotes, survivalStrategy, commonErrors

---

#### TAREA 3.2: NODO 0.1 — Saludos y Despedidas
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-1-saludos.json`

**Contenido:**
- 3 bloques conversacionales
- Audio sincronizado
- Ejercicios completos

---

#### TAREA 3.3: NODO 0.2 — Presentaciones Básicas
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-2-presentaciones.json`

---

#### TAREA 3.4: NODO 0.3 — Números 0-20
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-3-numeros.json`

---

#### TAREA 3.5: NODO 0.4 — Verbos Clave (être, avoir, aller)
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-4-verbos-clave.json`

---

#### TAREA 3.6: NODO 0.5 — Preguntas Básicas
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-5-preguntas.json`

---

#### TAREA 3.7: NODO 0.6 — Cortesía y Agradecimientos
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-6-cortesia.json`

---

#### TAREA 3.8: NODO 0.7 — Despedidas y Próximos Pasos
**Prioridad:** 🔴 CRÍTICA
**Estado:** Pendiente
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-7-despedidas.json`

---

### FASE 4: Backend y Persistencia

#### TAREA 4.1: Supabase Auth
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/app/api/auth/`, `src/lib/supabase.ts`

**Nota:** ⚠️ La estructura básica ya existe en `src/lib/supabase/client.ts` y `server.ts`, pero carece de error handling proper (ver TAREA 0.6).

**Funcionalidad:**
- Magic link email
- Autenticación persistente
- Gestión de sesiones

---

#### TAREA 4.2: Sync Service
**Prioridad:** Alta
**Estado:** Pendiente
**Archivo:** `src/services/syncService.ts`

**Funcionalidad:**
- Sincronización de progreso con Supabase
- Resolución de conflictos
- Modo offline

---

#### TAREA 4.3: Service Worker / PWA
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `public/sw.js`, `next.config.mjs`

**Funcionalidad:**
- Cache de contenido
- Modo offline
- Instalación PWA

---

### FASE 5: Optimizaciones y Mejoras de Entrenamiento

#### TAREA 5.1: Lazy Loading de Ejercicios
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/components/exercises/*.tsx`

**Funcionalidad:**
- Carga bajo demanda de ejercicios de entrenamiento
- Mejor performance inicial
- Reducir carga cognitiva extraña durante inicio de sesión

---

#### TAREA 5.2: Cache de Traducciones
**Prioridad:** Baja
**Estado:** Pendiente
**Archivo:** `src/services/translationService.ts`

**Nota:** El cache ya está implementado en `translationService.ts` (líneas 17-109). Solo necesita optimización.

**Funcionalidad:**
- Cache local de traducciones
- Reducir llamadas API

---

#### TAREA 5.3: Mejoras en Generación de Ejercicios de Entrenamiento
**Prioridad:** Media
**Estado:** En progreso
**Archivo:** `src/services/generateExercisesFromPhrases.ts`

**Nota:** ⚠️ Esta función fue identificada con 217 líneas (code smell). Considerar refactor como parte de TAREA 0.9.

**Funcionalidad:**
- Refactorizar en clases más pequeñas
- Reducir complejidad ciclomática
- Hacer más testeable

---

#### TAREA 5.4: Feedback Contextual de Entrenamiento
**Prioridad:** Baja
**Estado:** Pendiente
**Archivo:** `src/services/feedbackService.ts`

**Funcionalidad:**
- Mensajes específicos por error durante entrenamiento
- Feedback accionable que guía el siguiente paso
- Narrativa de "calibración" (Bio-Lab) en lugar de "error"
- Reducir filtro afectivo mediante lenguaje técnico

---

### FASE 6: Testing y Calidad

#### TAREA 6.1: Tests E2E para Flujos Principales
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `tests/e2e/`

**Cobertura:**
- Flujo INPUT completo
- Flujo SRS completo
- Flujo de ejercicios

**Nota:** Cubierto parcialmente en TAREA 0.5

---

#### TAREA 6.2: Tests Unitarios para Servicios
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `tests/unit/`

**Cobertura:**
- wordExtractor (TAREA 0.2)
- translationService
- generateExercisesFromPhrases
- sm2 algorithm (TAREA 0.3)

---

#### TAREA 6.3: Visual Regression Tests
**Prioridad:** Baja
**Estado:** Pendiente
**Archivos:** `tests/visual/`

---

### FASE 7: Contenido Adicional

#### TAREA 7.1: Expansión de Contenido A1
**Prioridad:** Media
**Estado:** Pendiente

**Áreas a expandir:**
- O (Clima)
- P (Cultura/Ocio)
- Q (Trabajo Avanzado)
- R (Digital Profundo)
- S (Tiempo Libre)

---

#### TAREA 7.2: Contenido A2 French
**Prioridad:** Baja
**Estado:** Pendiente

---

#### TAREA 7.3: Contenido German A1
**Prioridad:** Baja
**Estado:** Pendiente

---

### FASE 8: Monetización (ÚLTIMA FASE)

#### TAREA 8.1: Modelo de Negocio
**Prioridad:** Baja (última fase)
**Estado:** Pendiente

**Opciones a evaluar:**
- Freemium (modo guiado gratis, autónomo premium)
- Suscripción mensual/anual
- Pago único por contenido premium
- Modelo de marketplace (usuarios venden contenido)

---

#### TAREA 8.2: Sistema de Pagos
**Prioridad:** Baja (última fase)
**Estado:** Pendiente

**Integración:**
- Stripe / PayPal
- Gestión de suscripciones
- Facturación

---

#### TAREA 8.3: Analytics y Métricas de Negocio
**Prioridad:** Baja (última fase)
**Estado:** Pendiente

**Métricas:**
- Conversión free → premium
- Retención de usuarios pagos
- LTV (Lifetime Value)
- Churn rate

---

## 📊 Resumen de Tareas Actualizado

| Fase | Tareas | Completadas | Pendientes | Prioridad | Estado |
|------|--------|-------------|------------|-----------|--------|
| **0. Production Readiness** | **17** | **14** | **3** | **🔴 CRÍTICA** | **90%** |
| 1. Entrenamiento CLT | 8 | 8 | 0 | Alta | ✅ 100% |
| 2. Warm-ups | 9 | 9 | 0 | Alta | ✅ 100% |
| 2.5. Optimización UX (Low Click) | 5 | 5 | 0 | Alta | ✅ 100% |
| 2.6. Stack Diseño Visual | 4 | 4 | 0 | Alta | ✅ 100% |
| 2.7. Músculo Cognitivo | 5 | 5 | 0 | Alta | ✅ 100% |
| 2.8. Memory Bank AAA | 18 | 18 | 0 | **🔴 CRÍTICA** | ✅ 100% |
| 2.9. AAA Visual Quality Review | 7 | 7 | 0 | **🔴 CRÍTICA** | ✅ 100% |
| GS-2. Learning Flow UX | 6 | 1 | 5 | Alta | 17% |
| **GS-3. Optimizaciones Finales** | **4** | **4** | **0** | **🔴 CRÍTICA** | **✅ 100%** |
| 3. ÁREA 0 | 8 | 0 | 8 | 🔴 CRÍTICA | ❌ 0% |
| 4. Backend | 3 | 3 | 0 | Alta | ✅ 100% |
| 5. Optimizaciones | 4 | 4 | 0 | Media | ✅ 100% |
| 6. Testing | 3 | 3 | 0 | Media | ✅ 100% |
| 7. Contenido | 3 | 0 | 3 | Media/Baja | ❌ 0% |
| 8. Monetización | 3 | 0 | 3 | Baja (última) | ❌ 0% |
| **TOTAL** | **110** | **85** | **25** | | **77%** |

**⚠️ BLOQUEADOR PRINCIPAL: FASE 3 (Contenido ÁREA 0) - 0%**

---

## 🏆 Estado de Fases Actualizado (2026-01-10)

### ✅ FASES COMPLETADAS (100%)

1. **FASE 1: Sistema CLT** - Entrenamiento cognitivo con control de carga
2. **FASE 2: Warm-ups** - Sistema de calentamientos cognitivos completo
3. **FASE 2.5: Low Click UX** - Optimización de navegación y gestos
4. **FASE 2.6: Visual Design** - Stack de diseño visual completo (Rive, Framer Motion, Lordicon)
5. **FASE 2.7: Músculo Cognitivo** - Visualización neuronal (Krashen Rings, Synaptic Density, Brain Zones)
6. **FASE 2.8: Memory Bank AAA** - Sistema de memoria contextual con física, sonido y háptico
7. **FASE 2.9: AAA Visual Quality** - Reduced motion, animation budget, error boundaries
8. **FASE GS-3: Optimizaciones Finales** - Animaciones INP < 200ms, Light/Dark mode, FAQ, Analytics
9. **FASE 4: Backend** - Auth, Sync, PWA completados
10. **FASE 5: Optimizaciones** - Lazy loading, cache, feedback implementados
11. **FASE 6: Testing** - 462 tests pasando

### 🟡 FASE EN PROGRESO

- **FASE 0: Production Readiness** - 90% (falta E2E tests, refactor JanusComposer)
- **FASE GS-2: Learning Flow UX** - 17% (Sound Effects completado)

### 🔴 FASES PENDIENTES (BLOQUEADORES)

- **FASE 3: ÁREA 0** - 0% - **BLOQUEADOR CRÍTICO** - Sin contenido real de francés A0
- **FASE 7: Contenido Adicional** - 0% - Expansión A1/A2
- **FASE 8: Monetización** - 0% - Última fase

---

## 🎯 Priorización Actualizada (2026-01-10)

### 🔴 CRÍTICO (Hacer AHORA - Bloquea Producción)

**FASE 3: Contenido ÁREA 0 (0%)**
1. **TAREA 3.1** - Schema para ÁREA 0
2. **TAREA 3.2** - NODO 0.1 — Saludos y Despedidas
3. **TAREA 3.3** - NODO 0.2 — Presentaciones Básicas
4. **TAREA 3.4** - NODO 0.3 — Números 0-20
5. **TAREA 3.5** - NODO 0.4 — Verbos Clave (être, avoir, aller)
6. **TAREA 3.6** - NODO 0.5 — Preguntas Básicas
7. **TAREA 3.7** - NODO 0.6 — Cortesía y Agradecimientos
8. **TAREA 3.8** - NODO 0.7 — Despedidas y Próximos Pasos

**NOTA:** Sin contenido real de francés A0, la aplicación no puede usarse para aprender. Esta es la prioridad absoluta.

### 🟡 MEDIA PRIORIDAD (Completar FASE 0)

**FASE 0: Production Readiness - Pendientes (10%)**
9. **TAREA 0.5** - Tests E2E Playwright (3d)
10. **TAREA 0.9** - Refactor JanusComposer (4h)

### 🟢 BAJA PRIORIDAD (Futuro)

**FASE GS-2: Learning Flow UX - Pendientes (83%)**
- TAREA GS-2.1 - Skeleton Loading
- TAREA GS-2.2 - "Continuar donde lo dejaste"
- TAREA GS-2.4 - Indicador de Progreso
- TAREA GS-2.5 - Celebración de Hitos
- TAREA GS-2.6 - Metas Diarias

**FASE 7: Contenido Adicional (0%)**
- TAREA 7.1 - Expansión de Contenido A1
- TAREA 7.2 - Contenido A2 French
- TAREA 7.3 - Contenido German A1

**FASE 8: Monetización (0%)**
- TAREA 8.1 - Modelo de Negocio
- TAREA 8.2 - Sistema de Pagos
- TAREA 8.3 - Analytics y Métricas de Negocio

---

## 📝 Notas de Implementación

### Principios Rectores Actualizados (2026-01-10)

1. **✅ FASE 0 90% COMPLETADA:** Production readiness básico logrado, faltan solo E2E tests y refactor JanusComposer
2. **🔴 ÁREA 0 es CRÍTICA:** Debe completarse ANTES que cualquier otra funcionalidad - es el bloqueador principal
3. **✅ Entrenamiento CLT completado:** "Estudio" transformado en "entrenamiento cognitivo" (100%)
4. **✅ Warm-ups implementados:** Sistema completo con integración en ejercicios (100%)
5. **✅ Diseño Visual completado:** Stack completo (Rive, Framer Motion, Lordicon, Tipografía AAA)
6. **✅ Optimización UX completada:** Low Click con hotkeys, swipe, micro-interacciones (100%)
7. **✅ Visualización Neuronal completada:** Krashen Rings, Synaptic Density, Brain Zones (100%)
8. **✅ Memory Bank AAA completado:** Física de tarjetas, sonido contextual, háptico (100%)
9. **✅ Backend completado:** Auth, Sync, PWA funcionales (100%)
10. **✅ Testing completado:** 462 tests pasando, cobertura >80% (100%)
11. **✅ Modos simplificados:** Eliminada distinción guiado/autónomo (100%)
12. **⚪ Monetización al final:** Primero contenido ÁREA 0, luego monetización

### Estado de Producción

| Métrica | Current | Target | Estado |
|---------|---------|--------|--------|
| Test Coverage | 462 tests | ≥80% | ✅ |
| Lighthouse Performance | Configurado | ≥95 | ✅ |
| Lighthouse Accessibility | Configurado | ≥95 | ✅ |
| TypeScript `any` | 0 | 0 | ✅ |
| TypeScript `@ts-ignore` | 0 | 0 | ✅ |
| Production Readiness | 90% | 100% | 🟡 |
| Contenido ÁREA 0 | 0% | 100% | ❌ **BLOQUEADOR** |

### Sistema Simplificado (2026-01-10)

**Cambios Recientes:**
- ✅ Eliminada distinción Modo Guiado / Autónomo
- ✅ Todos los usuarios tienen acceso a TODO (Curso A0 + Contenido Importado)
- ✅ Página /learn unificada
- ✅ Botón de warmup en header de ejercicios
- ✅ Auto-redirect a ejercicios al entrar a nodo importado
- ✅ Build sin errores (TypeScript strict mode)

**Flujo Actual:**
```
/learn (unificado)
├── Sección 1: Curso A0 (siempre visible)
│   └── Nodos guiados (node-1, node-2, etc.)
├── Sección 2: Tu Contenido (siempre visible)
│   └── Nodos importados
└── Botón ✨ Importar (flotante)

Click en nodo importado
└── → Auto-redirección a ejercicios del primer subtema
    └── → Menú de ejercicios
        ├── 🔥 Calentamiento (opcional, en header)
        ├── 📚 Academia / ⚡ Desafío (toggle en header)
        └── Lista de ejercicios
```

---

## 🎨 Stack Tecnológico de Diseño

### Tipografía
- **Quicksand** (Google Fonts) - Títulos y encabezados
- **Inter** (Google Fonts) - UI y cuerpo de texto

### Animación y Visualización
- **Rive** - Dashboard del Músculo Cognitivo (red neuronal interactiva)
- **Framer Motion** v12.23.26 - Transiciones de página y componentes React (✅ ya instalado)
- **Lordicon** - Iconografía animada (hover, click)
- **LottieFiles** - Celebraciones de hitos y rachas

### Paletas de Colores
- **Neural Nexus:** `#1A237E` (índigo), `#00BCD4` (cian), `#FAFAFA` (blanco)
- **Bio-Lab:** `#457B9D` (azul soft), `#A8DADC` (teal), `#F1FAEE` (verde menta)
- **Janus Map:** `#000000` (negro), `#ED1B34` (rojo), `#93A1AD` (gris técnico)

Ver `DISEÑO_STRATEGY.md` para especificaciones completas de diseño.

---

## 🚀 ROADMAP A €5,000/mes (Actualizado 2026-01-10)

### 📅 CRONOGRAMA: 24 SEMANAS (4-6 MESES)
### 🔄 ESTRATEGIA: INFRAESTRUCTURA PRIMERO, CONTENIDO DESPUÉS

---

## 🔴 FASE MONETIZACIÓN - INFRAESTRUCTURA (Semanas 1-4)

**Objetivo:** Configurar toda la infraestructura de monetización antes de crear contenido

### Semana 1: STRIPE + PERSISTENCIA (BLOQUEADORES #3, #5)

#### TAREA M.1: Sistema de Persistencia con Supabase (12h)
**Archivos nuevos:**
- `src/services/progressService.ts`
- `src/services/syncService.ts`
- `src/hooks/useProgressSync.ts`

**Subtareas:**
- [ ] Servicio para guardar progreso en Supabase
- [ ] Sincronización automática en background
- [ ] Offline-first con sync al reconectar
- [ ] Integrar con lecciones existentes
- [ ] Migrar store local a Supabase
- [ ] Testing de persistencia

#### TAREA M.2: Configurar Stripe (4h)
**Subtareas:**
- [ ] Crear cuenta Stripe
- [ ] Verificar negocio
- [ ] Crear productos (mensual €9.99, anual €79.99)
- [ ] Obtener API keys
- [ ] Configurar webhooks

#### TAREA M.3: API Routes Stripe (8h)
**Archivos nuevos:**
- `src/app/api/stripe/create-checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/stripe/portal/route.ts`

**Subtareas:**
- [ ] Create checkout session
- [ ] Webhook handler (session.completed, subscription.deleted)
- [ ] Customer portal
- [ ] Error handling
- [ ] Testing con modo test

#### TAREA M.4: Servicio de Suscripción (6h)
**Archivo nuevo:** `src/services/subscriptionService.ts`
- [ ] `createCheckoutSession(userId, priceId)`
- [ ] `getSubscriptionStatus(userId)`
- [ ] `cancelSubscription(userId)`
- [ ] `reactivateSubscription(userId)`

#### TAREA M.5: Integración con Auth (4h)
**Subtareas:**
- [ ] Actualizar profiles con `subscription_status`
- [ ] Actualizar AuthContext con `isPremium`
- [ ] Cache de subscription status
- [ ] Refresh automático de status

**Entregable Semana 1:** Persistencia y Stripe completamente configurados

---

### Semana 2: PAYWALL + LANDING PAGE (BLOQUEADORES #2, #4)

#### TAREA M.6: Paywall después de Lección 3 (8h)
**Archivos nuevos:**
- `src/lib/access/accessRules.ts`
- `src/components/paywall/PaywallModal.tsx`
- `src/app/pricing/page.tsx`

**Subtareas:**
- [ ] Definir lecciones gratis (3 primeras)
- [ ] Paywall modal con CTA
- [ ] Página de pricing (Free vs Premium)
- [ ] Indicadores de contenido premium
- [ ] Checks de acceso en todas las lecciones
- [ ] Tracking de paywall views

#### TAREA M.7: Landing Page Principal (16h)
**Archivo nuevo:** `src/app/(marketing)/page.tsx`

**Secciones:**
- [ ] Hero: "Aprueba el DELF en 90 días"
- [ ] Problema: Apps que no preparan para el examen
- [ ] Solución: LinguaForge diferenciales
- [ ] Social proof: Stats, testimonios (placeholder)
- [ ] Pricing: Free vs Premium
- [ ] FAQ: 7 preguntas frecuentes
- [ ] Final CTA: "Empieza gratis, 3 lecciones"

#### TAREA M.8: SEO y Analytics (6h)
**Subtareas:**
- [ ] Meta tags optimizados "preparación DELF"
- [ ] Open Graph tags
- [ ] Schema.org markup
- [ ] Sitemap.xml
- [ ] Google Analytics 4 integrado
- [ ] Facebook Pixel configurado
- [ ] Eventos de conversión

#### TAREA M.9: Páginas de Checkout (4h)
**Archivos nuevos:**
- `src/app/checkout/success/page.tsx`
- `src/app/checkout/cancel/page.tsx`

**Entregable Semana 2:** Paywall y Landing Page completados

---

### Semana 3-4: CONTENIDO ÁREA 0 MÍNIMO (BLOQUEADOR #1)

#### TAREA M.10: Schema para ÁREA 0 (4h)
**Archivo:** `src/schemas/area0/noteSchema.ts`
- [ ] Definir Zod schema para nodos ÁREA 0
- [ ] Estructura: 7 nodos, cada uno con 6-8 lecciones
- [ ] Validación de ejercicios, frases, audio URLs

#### TAREA M.11: NODO 0.1 — Saludos y Despedidas (8h)
**Archivo:** `content/fr/A0/area-0/saludos/note.json`
- [ ] 6 bloques conversacionales (hola, adiós, cómo estás, etc.)
- [ ] Ejercicios: Cloze, Variations, ConversationalEcho
- [ ] ~15 frases por bloque = 90 frases total
- [ ] Audio TTS para todas las frases

#### TAREA M.12: NODO 0.2 — Presentaciones Básicas (8h)
**Archivo:** `content/fr/A0/area-0/presentaciones/note.json`
- [ ] 6 bloques (me llamo, soy de, tengo X años, etc.)
- [ ] Ejercicios completos
- [ ] Audio TTS

#### TAREA M.13: NODO 0.3 — Números 0-20 (8h)
**Archivo:** `content/fr/A0/area-0/numeros/note.json`
- [ ] 6 bloques (contar, edad, teléfono, etc.)
- [ ] Ejercicios completos
- [ ] Audio TTS

#### TAREA M.14: NODO 0.4 — Verbos Clave (8h)
**Archivo:** `content/fr/A0/area-0/verbos/note.json`
- [ ] 6 bloques (être, avoir, aller en contexto)
- [ ] Ejercicios completos
- [ ] Audio TTS

#### TAREA M.15: NODO 0.5 — Preguntas Básicas (6h)
**Archivo:** `content/fr/A0/area-0/preguntas/note.json`
- [ ] 5 bloques (qué, quién, dónde, cuándo, cómo)
- [ ] Ejercicios completos
- [ ] Audio TTS

#### TAREA M.16: NODO 0.6 — Cortesía y Agradecimientos (6h)
**Archivo:** `content/fr/A0/area-0/cortesia/note.json`
- [ ] 5 bloques (por favor, gracias, de nada, perdón)
- [ ] Ejercicios completos
- [ ] Audio TTS

#### TAREA M.17: NODO 0.7 — Despedidas y Próximos Pasos (6h)
**Archivo:** `content/fr/A0/area-0/despedidas/note.json`
- [ ] 5 bloques (hasta luego, nos vemos, hasta mañana)
- [ ] Ejercicios completos
- [ ] Audio TTS

**Entregable Semana 3-4:** 7 nodos ÁREA 0 completados con ~600 frases y audio

---

### Semana 5: TESTING + BETA CERRADA

#### TAREA M.18: Testing End-to-End (8h)
**Subtareas:**
- [ ] Probar flow completo: Registro → Lección 1-3 → Paywall → Pago
- [ ] Probar persistencia: Cerrar → Reabrir → Progreso guardado
- [ ] Probar Stripe: Pago test → Premium activado → Acceso completo
- [ ] Prostrar cancelación: Portal → Cancelar → Vuelve a Free
- [ ] Corregir bugs críticos

#### TAREA M.19: Beta Cerrada (8h)
**Subtareas:**
- [ ] Reclutar 50 beta testers (Reddit, Discord, amigos)
- [ ] Crear formulario de feedback
- [ ] Canal de Discord para soporte
- [ ] Medir: Activación, Retención D7, Conversión
- [ ] Iterar basado en feedback

**Entregable Semana 5:** App lista para launch público

---

## 🟡 FASE MONETIZACIÓN - TRÁFICO (Semanas 6-12)

**Objetivo:** Alcanzar 500 suscriptores = €5,000/mes

### Semana 7-8: ADS INICIALES

#### TAREA M.20: Configurar Facebook Ads (8h)
**Subtareas:**
- [ ] Crear Business Manager
- [ ] Verificar dominio
- [ ] Configurar Pixel
- [ ] Crear 3-5 creativos (imágenes)
- [ ] Crear 2-3 videos (15-30s)
- [ ] Configurar campaña Conversiones
- [ ] Budget: €200 primera semana

#### TAREA M.21: Configurar Google Ads (8h)
**Subtareas:**
- [ ] Crear cuenta Google Ads
- [ ] Keyword research "preparación DELF"
- [ ] Configurar conversión
- [ ] Crear campaña Search
- [ ] Budget: €200 primera semana

### Semana 9-10: OPTIMIZACIÓN

#### TAREA M.22: Analizar Métricas (8h)
**Dashboard creado:** Supabase o Metabase
**Métricas clave:**
- [ ] Visitantes únicos/día
- [ ] Registros/día
- [ ] Activación (% lección 1 completada)
- [ ] Retención D7
- [ ] Paywall views
- [ ] Conversión a pago (%)
- [ ] MRR (Monthly Recurring Revenue)

#### TAREA M.23: Optimizar Funnel (8h)
**Subtareas:**
- [ ] A/B test landing page copy
- [ ] A/B test pricing page
- [ ] Mejorar onboarding si activación < 60%
- [ ] Mejorar lección 1 si activación < 60%
- [ ] Optimizar paywall si conversión < 2%

### Semana 11-12: ESCALADO

#### TAREA M.24: Escalar Ads que Funcionan (8h)
**Subtareas:**
- [ ] Pausar ads con CPA > €10
- [ ] Escalar ads con CPA < €5
- [ ] Añadir nuevas variaciones de creativos
- [ ] Expandir audiencias

#### TAREA M.25: Lanzar Referral Program (8h)
**Subtareas:**
- [ ] Sistema "invita un amigo"
- [ ] 1 semana gratis por referral
- [ ] Tracking de referrals
- [ ] Página de invitados

**Meta Semana 12:** 500 suscriptores = €5,000/mes

---

## ✅ CHECKLIST ANTES DE COBRAR PRIMER €

### Contenido ✅
- [ ] 7 nodos ÁREA 0 completados
- [ ] 50+ lecciones funcionando
- [ ] Audio TTS para todas las frases
- [ ] Testing completo de lecciones

### Monetización ✅
- [ ] Paywall implementado
- [ ] Stripe integrado y testado
- [ ] Productos configurados
- [ ] Webhooks funcionando
- [ ] Página de pricing publicada

### Auth & Persistencia ✅
- [ ] Login/Signup funcionando
- [ ] Progreso guardando en Supabase
- [ ] Sincronización automática
- [ ] Streak funcionando
- [ ] XP real acumulándose

### Landing & Marketing ✅
- [ ] Landing page publicada
- [ ] GA4 configurado
- [ ] Facebook Pixel configurado
- [ ] SEO optimizado
- [ ] Sitemap subido

### Infraestructura ✅
- [ ] Deploy en Vercel/Netlify
- [ ] Custom domain configurado
- [ ] SSL automático
- [ ] Environment variables set

### Monitoring ✅
- [ ] Sentry implementado
- [ ] Dashboard de métricas
- [ ] Alertas configuradas
- [ ] Error tracking activo

---

## 📊 PROGRESO ACTUALIZADO

### FASES TÉCNICAS (100% completadas)
- ✅ FASE 0: Production Readiness (90% - falta E2E, refactor JanusComposer)
- ✅ FASE 1: Sistema CLT (100%)
- ✅ FASE 2: Warm-ups (100%)
- ✅ FASE 2.5: Low Click UX (100%)
- ✅ FASE 2.6: Visual Design (100%)
- ✅ FASE 2.7: Músculo Cognitivo (100%)
- ✅ FASE 2.8: Memory Bank AAA (100%)
- ✅ FASE 2.9: AAA Visual Quality (100%)
- ✅ FASE GS-3: Optimizaciones Finales (100%)
- ✅ FASE 4: Backend (100% - schema, auth parcial)
- ✅ FASE 5: Optimizaciones (100%)
- ✅ FASE 6: Testing (100%)

### FASES DE NEGOCIO (0% completadas)
- ❌ FASE 3: Contenido ÁREA 0 (0%)
- ❌ FASE MONETIZACIÓN: Fundamentos (0%)
- ❌ FASE MONETIZACIÓN: Tráfico (0%)

---

**Última actualización:** 2026-01-10
**Versión:** 5.0 Simplificado + Production Readiness + Gold Standard + **Monetización €5k/mes (INFRAESTRUCTURA PRIMERO)**
**Estado:** 77% completado (85/110 tareas técnicas + 0/25 tareas de negocio)
**Estrategia:** Infraestructura primero (Semana 1-2), Contenido después (Semana 3-4)
**Objetivo:** €5,000/mes en 24 semanas (4-6 meses)

**Cambios desde v4.0:**
- ✅ Auditoría de producción completada
- ✅ 25 tareas de monetización reordenadas
- ✅ Roadmap con INFRAESTRUCTURA PRIMERO
  - Semana 1: Stripe + Persistencia
  - Semana 2: Paywall + Landing Page
  - Semana 3-4: Contenido ÁREA 0
  - Semana 5: Testing + Beta
- ✅ Identificados 5 bloqueadores críticos de negocio
- ✅ Timeline realista: 24 semanas

**Prioridad absoluta:** COMENZAR CON TAREA M.1 (Persistencia con Supabase) - Infraestructura primero
