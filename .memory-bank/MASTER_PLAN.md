# Plan Maestro — LinguaForge

> Última actualización: 2026-01-06
> Versión: 2.0 Unificado + Production Readiness

## ⚠️ ESTADO CRÍTICO: PRODUCTION READINESS

**Veredicto:** ⚠️ **NECESITA MEJORAS CRÍTICAS ANTES DE PRODUCCIÓN**

**Análisis Completo:** Ver `.memory-bank/PRINCIPAL_ENGINEER_ANALYSIS.md`

**Bloqueadores Críticos:**
1. ❌ Cobertura de tests: **0%** (target: ≥80%)
2. ❌ Sin manejo de errores en Supabase
3. ❌ Sin rate limiting en APIs externas
4. ❌ Sin circuit breakers para servicios externos
5. ❌ Lighthouse scores no medidos

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

#### RESUMEN FASE 0: PRODUCTION READINESS

| Tarea | Prioridad | Tiempo | Estado |
|-------|-----------|--------|--------|
| 0.1 Testing Infrastructure | 🔴 P0 | 4h | Pendiente |
| 0.2 Tests wordExtractor | 🔴 P0 | 2h | Pendiente |
| 0.3 Tests sm2 | 🔴 P0 | 2h | Pendiente |
| 0.4 Tests Zustand Stores | 🔴 P0 | 1d | Pendiente |
| 0.5 Tests E2E Playwright | 🟡 P1 | 3d | Pendiente |
| 0.6 Error Handling Supabase | 🔴 P0 | 4h | Pendiente |
| 0.7 Rate Limiting | 🔴 P0 | 4h | Pendiente |
| 0.8 Circuit Breaker | 🔴 P0 | 6h | Pendiente |
| 0.9 Refactor JanusComposer | 🟡 P1 | 4h | Pendiente |
| 0.10 Repository Pattern | 🟡 P1 | 2d | Pendiente |
| 0.11 Zod Runtime Validation | 🟡 P1 | 1d | Pendiente |
| 0.12 Lighthouse CI | 🟡 P1 | 4h | Pendiente |
| **TOTAL** | | **~3 semanas** | **0/12 completado** |

**⚠️ NO PROSEGUIR CON OTRAS FASES HASTA COMPLETAR FASE 0**

---

### FASE 1: Sistema de Entrenamiento Cognitivo con Control de Carga (CLT)

> **Filosofía:** Transformar "estudio" en "entrenamiento cognitivo" donde cada sesión fortalece el músculo cognitivo.

#### TAREA 1.1: Store de Carga Cognitiva
**Prioridad:** Alta
**Estado:** ✅ Completado (ya existe en `src/store/useCognitiveLoadStore.ts`)
**Nota:** El store ya está implementado según análisis

---

#### TAREA 1.2: Modo Focus (Entrenamiento Inmersivo)
**Prioridad:** Alta
**Estado:** Pendiente
**Archivos:** `src/components/shared/FocusMode.tsx`

**Funcionalidad:**
- Ocultar HUD (XP, coins, gems) durante entrenamiento de input
- Desactivar animaciones durante consumo de contenido
- Bloquear notificaciones durante sesiones de entrenamiento
- Modo Focus automático basado en tipo de actividad
- Transición fluida post-entrenamiento con feedback acumulado

**Dependencias:** TAREA 1.1 (ya completada)

---

#### TAREA 1.3: Sistema de Métricas CLT y Neurodiseño
**Prioridad:** Media
**Estado:** Pendiente
**Archivo:** `src/services/cognitiveLoadMetrics.ts`

**Funcionalidad:**
- Calcular carga intrínseca (duración, palabras, complejidad)
- Calcular carga extraña (CTAs, animaciones, fricción)
- Calcular carga germana (tipo de ejercicio, tipo de entrenamiento)
- Tracking automático de sesiones de entrenamiento
- Métricas de "irrigación neuronal" (input comprensible procesado)
- Integración con visualización de densidad sináptica

**Dependencias:** TAREA 1.1

---

#### TAREA 1.4: Refactorizar useMissionStore para CLT
**Prioridad:** Alta
**Estado:** Pendiente
**Archivo:** `src/store/useMissionStore.ts`

**Nota:** ⚠️ Esta función tiene ~103 líneas y fue identificada como code smell. Considerar refactor como parte de FASE 0.

**Cambios:**
- Agregar `cognitiveLoadTarget` a misiones
- Misiones adaptativas basadas en carga
- Nuevos tipos CLT-aware

**Dependencias:** TAREA 1.1, TAREA 1.3

---

#### TAREA 1.5: Algoritmo de Generación de Misiones CLT
**Prioridad:** Alta
**Estado:** Pendiente
**Archivo:** `src/services/missionGenerator.ts`

**Funcionalidad:**
- Generar misiones basadas en carga cognitiva
- Integración con FSRS
- Misiones adaptativas

**Dependencias:** TAREA 1.4

---

#### TAREA 1.6: Componente MissionFeed (Feed de Entrenamiento)
**Prioridad:** Alta
**Estado:** Pendiente
**Archivo:** `src/components/missions/MissionFeed.tsx`

**Funcionalidad:**
- Feed único: "Siguiente bloque de entrenamiento recomendado"
- FSRS decide qué mostrar basado en curva de olvido
- Modo Focus automático durante entrenamiento
- Visualización de progreso neuronal integrada
- Narrativa de "entrenamiento" en lugar de "lección"

**Dependencias:** TAREA 1.4, TAREA 1.5

---

#### TAREA 1.7: Gamificación Post-Cognitiva
**Prioridad:** Media
**Estado:** Pendiente
**Archivos:** `src/components/exercises/*.tsx`, `src/store/useGamificationStore.ts`

**Cambios:**
- Ocultar XP durante input/ejercicios
- Mostrar recompensas después de completar
- Resumen visual al cerrar sesión

**Dependencias:** TAREA 1.2

---

#### TAREA 1.8: Resumen de Sesión de Entrenamiento
**Prioridad:** Baja
**Estado:** Pendiente
**Archivo:** `src/components/session/SessionSummary.tsx`

**Funcionalidad:**
- Métricas de input comprensible procesado (minutos de irrigación neuronal)
- Bloques de entrenamiento completados
- Carga cognitiva promedio de la sesión
- Visualización de zonas cerebrales activadas
- Recompensas acumuladas (mostradas post-entrenamiento)
- Narrativa de "fortalecimiento del músculo cognitivo"

**Dependencias:** TAREA 1.3, TAREA 1.7

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

| Fase | Tareas | Completadas | Pendientes | Prioridad |
|------|--------|-------------|------------|-----------|
| **0. Production Readiness** | **12** | **0** | **12** | **🔴 CRÍTICA** |
| 1. Entrenamiento CLT | 8 | 1 | 7 | Alta |
| 2. Warm-ups | 9 | 7 | 2 | Alta |
| 2.5. Optimización UX (Low Click) | 5 | 0 | 5 | Alta |
| 2.6. Stack Diseño Visual | 4 | 0 | 4 | Alta |
| 2.7. Músculo Cognitivo | 5 | 0 | 5 | Alta |
| 3. ÁREA 0 | 8 | 0 | 8 | 🔴 CRÍTICA |
| 4. Backend | 3 | 0 | 3 | Alta |
| 5. Optimizaciones | 4 | 0 | 4 | Media |
| 6. Testing | 3 | 0 | 3 | Media |
| 7. Contenido | 3 | 0 | 3 | Media/Baja |
| 8. Monetización | 3 | 0 | 3 | Baja (última) |
| **TOTAL** | **67** | **8** | **59** | |

---

## 🎯 Priorización Actualizada

### 🔴 CRÍTICO (Hacer AHORA - Bloquea Producción)
**FASE 0: Production Readiness**
1. TAREA 0.1 - Testing Infrastructure (Vitest + Testing Library)
2. TAREA 0.2 - Tests wordExtractor
3. TAREA 0.3 - Tests sm2
4. TAREA 0.4 - Tests Zustand Stores
5. TAREA 0.6 - Error Handling Supabase
6. TAREA 0.7 - Rate Limiting
7. TAREA 0.8 - Circuit Breaker

### 🟡 ALTA PRIORIDAD (Próximas 2-3 semanas)
**FASE 0 (continuación) + Críticos Funcionales**
8. TAREA 0.5 - Tests E2E Playwright
9. TAREA 0.9 - Refactor JanusComposer
10. TAREA 0.10 - Repository Pattern
11. TAREA 0.11 - Zod Runtime Validation
12. TAREA 0.12 - Lighthouse CI
13. TAREA 3.1 - Schema ÁREA 0
14. TAREA 3.2-3.8 - Nodos ÁREA 0 (Base Absoluta)
15. TAREA 2.8 - Integrar Warm-ups con MissionFeed

### 🟢 MEDIA PRIORIDAD (Próximo mes)
- TAREA 1.2-1.6 - Sistema de Entrenamiento CLT
- TAREA 2.10-2.12 - Optimización UX (Hotkeys, Swipe, Janus Navigation)
- TAREA 2.15-2.16 - Tipografía + Rive
- TAREA 2.19-2.22 - Visualización Neuronal
- TAREA 4.1-4.2 - Backend (Auth + Sync)

### ⚪ BAJA PRIORIDAD (Futuro)
- TAREA 2.11, 2.13, 2.14 - Micro-interacciones
- TAREA 2.17-2.18 - Framer Motion, Lordicon
- TAREA 2.21, 2.23 - Zonas de Desbloqueo, Paletas
- TAREA 5.1-5.4 - Optimizaciones
- TAREA 6.1-6.3 - Testing (complementario)
- TAREA 7.1-7.3 - Contenido adicional
- TAREA 8.1-8.3 - Monetización

---

## 📝 Notas de Implementación

### Principios Rectores

1. **⚠️ FASE 0 es BLOQUEANTE:** NO proseguir con otras fases hasta completar Production Readiness
2. **ÁREA 0 es crítica:** Debe completarse antes de cualquier otro contenido
3. **Entrenamiento CLT es fundamental:** Transforma "estudio" en "entrenamiento cognitivo"
4. **Warm-ups ya implementados:** Solo falta integración con MissionFeed
5. **Diseño Visual es prioritario:** Neural Nexus debe implementarse en paralelo con funcionalidad
6. **Optimización UX (Low Click):** Crítica para retención y flujo de entrenamiento
7. **Visualización Neuronal:** Reemplaza métricas abstractas con representación orgánica del progreso
8. **Backend puede esperar:** El sistema funciona con persistencia local
9. **Monetización al final:** Primero producto funcional con diseño Triple A, luego monetización

### Hallazgos del Principal Engineer Analysis

1. **Code Quality: 6.5/10** - TypeScript strong, but missing production elements
2. **Zero test coverage** - Most critical blocker
3. **No error handling** - Runtime crashes waiting to happen
4. **No rate limiting** - API quota exhaustion risk
5. **No circuit breakers** - Cascading failure risk
6. **Functions >50 lines** - `generateJanusComposerExercises` (217 lines), `generateDailyMissions` (103 lines)
7. **Zod schemas unused** - No runtime validation despite comprehensive schemas
8. **Repository pattern missing** - Direct Supabase coupling
9. **Lighthouse unmeasured** - No performance regression detection

### Métricas Target

| Métrica | Current | Target | Estado |
|---------|---------|--------|--------|
| Test Coverage | 0% | ≥80% | ❌ |
| Lighthouse Performance | Unknown | ≥95 | ❌ |
| Lighthouse Accessibility | Unknown | ≥95 | ❌ |
| TypeScript `any` | 0 | 0 | ✅ |
| TypeScript `@ts-ignore` | 0 | 0 | ✅ |

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

## 🚀 Próximos Pasos Inmediatos

### FASE 0: Production Readness (PRIMERA SEMANA)
1. Configurar Vitest + Testing Library (TAREA 0.1)
2. Escribir tests para wordExtractor (TAREA 0.2)
3. Escribir tests para sm2 (TAREA 0.3)
4. Implementar error handling en Supabase (TAREA 0.6)
5. Implementar rate limiting (TAREA 0.7)
6. Implementar circuit breaker (TAREA 0.8)

### FASE 0: Production Readness (SEGUNDA SEMANA)
7. Escribir tests para Zustand stores (TAREA 0.4)
8. Refactorizar generateJanusComposerExercises (TAREA 0.9)
9. Escribir tests E2E con Playwright (TAREA 0.5)
10. Implementar Repository Pattern (TAREA 0.10)
11. Implementar Zod validation runtime (TAREA 0.11)
12. Configurar Lighthouse CI (TAREA 0.12)

### Funcionalidad Core (TERCERA SEMANA - Desbloqueado tras FASE 0)
13. Crear schema para ÁREA 0 (TAREA 3.1)
14. Implementar primeros 3 nodos de ÁREA 0 (TAREA 3.2-3.4)
15. Implementar Modo Focus básico (TAREA 1.2)
16. Integrar Warm-ups con MissionFeed (TAREA 2.8)

### Diseño Visual (PARALELO - Cuarta SEMANA)
17. Integrar tipografía Quicksand/Inter (TAREA 2.15)
18. Crear componente Krashen Rings (TAREA 2.19)
19. Integrar Rive para visualización neuronal básica (TAREA 2.16)
20. Implementar hotkeys para SRS (TAREA 2.10)
21. Optimizar navegación Janus Matrix (TAREA 2.12)

---

**Última actualización:** 2026-01-06
**Versión:** 2.0 Unificado + Production Readiness
**Analista:** Claude (Principal Software Engineer - ex-Vercel/Supabase)
