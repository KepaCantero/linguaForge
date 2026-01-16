# Active Context — Contexto Activo

> Última actualización: 2026-01-14 (Code Quality Improvements - ESLint Cleanup)

## Estado Actual

**Versión del Plan:** v5.0 (Base) + v2.0 (Expansión LinguaForge) + Simplificación de Modos + Sistema INPUT + SRS + CLT + Misiones + Memory Bank AAA + Construction 3D + AAA Visual Quality + Gold Standard Tasks + **FASE MONETIZACIÓN €5k/mes**

**Progreso Técnico:** ~85% - Excelente base técnica
**Progreso de Negocio:** ~15% - Falta lo esencial para monetizar
**Tarea activa:** FASE MONETIZACIÓN - TAREA M.1 (Schema ÁREA 0)
**Objetivo:** €5,000/mes en 24 semanas (4-6 meses)

**Últimas completadas:** GS-3.1 (Animaciones optimizadas), GS-3.2 (Light/Dark mode), GS-3.3 (FAQ page), GS-3.4 (Analytics), Simplificación de Modos (2026-01-10), **AUDITORÍA DE PRODUCCIÓN** (2026-01-10)

## 🎯 Cambio Reciente: Simplificación de Modos (2026-01-10)

**Commit:** `4be6ce0` - refactor: Simplify learning modes and improve UX flow

### ¿Qué Cambió?

**ANTES (Modos Separados):**
- Usuario debía elegir entre Modo Guiado y Modo Autónomo en onboarding
- Modo Guiado: Solo curso A0 (lecciones estructuradas)
- Modo Autónomo: Solo contenido importado
- Pantalla de onboarding obligatoria

**AHORA (Simplificado):**
- ✅ **Todos los usuarios tienen acceso a TODO**
- ✅ **Sin elección de modo al inicio**
- ✅ **Página /learn unificada con dos secciones:**
  1. 📚 Curso A0 - Francés Básico (siempre visible)
  2. 🎯 Tu Contenido - Material importado (siempre visible)
- ✅ **Botón flotante ✨ Importar** siempre disponible
- ✅ **UX más simple - menos fricción**

### Archivos Modificados

1. **`src/app/learn/page.tsx`** - Página unificada
   - Eliminada lógica de modo guiado/autónomo
   - Se muestran AMBAS secciones siempre
   - Buscador y filtros solo para contenido importado

2. **`src/app/learn/imported/[nodeId]/page.tsx`** - Auto-redirect
   - Al entrar a un nodo, redirige automáticamente al primer subtema
   - Eliminada pantalla intermedia de subtemas

3. **`src/app/learn/imported/[nodeId]/exercises/page.tsx`** - Ejercicios mejorados
   - Estado `currentMode` para cambiar entre Academia/Desafío dinámicamente
   - Fase inicial: `exercise-menu` (sin warmup obligatorio)

4. **`src/app/learn/imported/[nodeId]/exercises/components/ExerciseHeader.tsx`** - Botón warmup
   - 🔥 Botón de Calentamiento en header (junto a Academia/Desafío)
   - Orden: 🔥 → 📚/⚡ → 🎯 → 📊

5. **`src/app/learn/imported/[nodeId]/exercises/components/ExerciseMenu.tsx`** - Modos en menú
   - Botones Academia/Desafío en header
   - Tarjeta de cambio de modo al final de la lista
   - Eliminada tarjeta grande de warmup

### Beneficios

**Para el Usuario:**
- ✅ Menos confusión - no hay elección inicial
- ✅ Más libertad - puede hacer curso Y importar contenido
- ✅ Flujo más directo - menos clics
- ✅ Calentamiento opcional disponible siempre

**Para el Desarrollo:**
- ✅ Menos código que mantener
- ✅ Menos complejidad en el estado
- ✅ `npm run build` pasa sin errores
- ✅ TypeScript strict mode sin errores

### Flujo Actual Simplificado

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

## 🔧 Code Quality Improvements (2026-01-14)

**Commit:** `5c0049d` - refactor: Comprehensive code quality improvements and ESLint cleanup

### What Changed

**ESLint & TypeScript Fixes:**
- ✅ Replace all `any` types with `unknown` and safe type assertions in baseRepository.ts
- ✅ Fix XSS vulnerability by moving inline theme script to external file (`/public/scripts/theme-init.js`)
- ✅ Add centralized TODO documentation with unique IDs in `/docs/TODO.md`
- ✅ Remove all unused imports, variables, and parameters across the codebase
- ✅ Fix React hooks dependency warnings

**Custom Hooks Extraction (82-95% hook count reduction):**
- ✅ `useJanusComposer` - Janus composer logic (27 hooks → 5 hooks)
- ✅ `usePhraseSelectionPanel` - Phrase selection logic (21 hooks → 2 hooks)
- ✅ `useMissionFeed` - Mission feed logic (22 hooks → 1 hook)

**Dead Code Removal (~2,000 lines removed):**
- ✅ Delete `ClozeExercise.tsx.backup` (357 lines)
- ✅ Delete unused `exerciseCategorizer.ts` service (459 lines)
- ✅ Remove deprecated `translateToSpanish()` function
- ✅ Remove duplicate `ThemeToggle` component

**Zustand Store Refactoring:**
- ✅ Refactor `useCognitiveLoadStore` with factory functions pattern
- ✅ Fix max-lines-per-function violations with better code organization

### Files Modified
- 74 files changed, 5007 insertions(+), 2039 deletions(-)
- New custom hooks: `useJanusComposer.ts`, `usePhraseSelectionPanel.ts`, `useMissionFeed.ts`
- New tests: `fsrs.test.ts`, `languageConfig.test.ts`, `srsAdapter.test.ts`, `ttsService.test.ts`

### Test Results
- ✅ Build: Passing
- ✅ Tests: 746/749 passing (3 pre-existing unrelated failures)
- ✅ ESLint: Reduced from 187+ warnings to ~161 warnings

### Technical Debt Addressed
- ✅ Fixed all TypeScript strict mode violations in repository layer
- ✅ Eliminated XSS risk from dangerouslySetInnerHTML
- ✅ Centralized TODO tracking with unique identifiers (format: TODO-YYYYMMDD-NNN)
- ✅ Reduced ESLint warnings (remaining are mostly architectural `max-lines-per-function` warnings)

---

## 🎯 GOLD STANDARD 2026 - PROGRESO

**Documento:** `.memory-bank/GOLD_STANDARD_TASKS.md`

### Estado de Tareas Gold Standard

#### FASE GS-0: Critical Infrastructure
- ⏳ GS-0.1 - Service Worker PWA (4h) - Pendiente
- ✅ **GS-0.2** - Migrar de SM-2 a FSRS v6 (8h) - **COMPLETADO 2026-01-10**
- ⏳ GS-0.3 - Configurar Lighthouse CI (3h) - Pendiente
- ⏳ GS-0.4 - Headers de Seguridad CSP (3h) - Pendiente

#### FASE GS-1: UX Gold Standard
- ⏳ GS-1.1 - Tutorial Interactivo (8h) - Pendiente
- ⏳ GS-1.2 - Tooltips Contextuales (4h) - Pendiente
- ⏳ GS-1.3 - Modal de Bienvenida (6h) - Pendiente
- ⏳ GS-1.4 - Atajos de Teclado (3h) - Pendiente
- ⏳ GS-1.5 - Botón de Ayuda (2h) - Pendiente

#### FASE GS-2: Learning Flow UX
- ⏳ GS-2.1 - Skeleton Loading (2h) - Pendiente
- ⏳ GS-2.2 - "Continuar donde lo dejaste" (4h) - Pendiente
- ✅ GS-2.3 - Sound Effects System (4h) - COMPLETADO 2026-01-10
- ⏳ GS-2.4 - Indicador de Progreso (2h) - Pendiente
- ⏳ GS-2.5 - Celebración de Hitos (3h) - Pendiente
- ⏳ GS-2.6 - Metas Diarias (4h) - Pendiente

#### FASE GS-3: Optimizaciones Finales
- ✅ **GS-3.1** - Optimizar animaciones INP < 200ms (5h) - **COMPLETADO 2026-01-10**
- ✅ **GS-3.2** - Modo Light/Dark (6h) - **COMPLETADO 2026-01-10**
- ✅ **GS-3.3** - Página FAQ/Ayuda (4h) - **COMPLETADO 2026-01-10**
- ✅ **GS-3.4** - Analytics PostHog/Mixpanel (4h) - **COMPLETADO 2026-01-10**

**Progreso GS-3: 4/4 tareas completadas (100%)**

### Resumen de Fases

| Fase | Estado | Progreso |
|------|--------|----------|
| FASE GS-0 - Critical Infrastructure | En progreso | 25% |
| FASE GS-1 - UX Gold Standard | Pendiente | 0% |
| FASE GS-2 - Learning Flow | En progreso | 17% |
| FASE GS-3 - Optimizaciones Finales | **COMPLETO** | **100%** |

---

## Resumen de Trabajo Reciente

### SIMPLIFICACIÓN DE MODOS (Completada - 2026-01-10)

**Objetivo:** Eliminar la distinción entre Modo Guiado y Autónomo para simplificar la UX y reducir complejidad.

**Commit:** `4be6ce0` - refactor: Simplify learning modes and improve UX flow

**Cambios Principales:**

1. **Eliminación de Modos:**
   - ❌ Eliminada propiedad `mode` de useUserStore para flujo de usuarios
   - ✅ Todos los usuarios tienen acceso a Curso A0 + Contenido Importado
   - ✅ Sin pantalla de selección de modo al inicio

2. **Página /learn Unificada:**
   - ✅ Sección 1: 📚 Curso A0 - Francés Básico
   - ✅ Sección 2: 🎯 Tu Contenido - Material Importado
   - ✅ Botón flotante ✨ Importar siempre visible

3. **Botón de Warmup en Header:**
   - ✅ Movido desde lista de ejercicios al header
   - ✅ Junto a botones Academia/Desafío
   - ✅ Orden: 🔥 → 📚/⚡ → 🎯 → 📊

4. **Auto-redirect a Ejercicios:**
   - ✅ Al entrar a nodo importado, va directo al primer subtema
   - ✅ Eliminada pantalla intermedia de lista de subtemas

5. **Build Sin Errores:**
   - ✅ `npm run build` pasa exitosamente
   - ✅ TypeScript strict mode sin errores
   - ✅ Sin errores de React Hooks

**Archivos Modificados (6):**
- `src/app/learn/page.tsx` - Vista unificada
- `src/app/learn/imported/[nodeId]/page.tsx` - Auto-redirect
- `src/app/learn/imported/[nodeId]/exercises/page.tsx` - Manejo de modo dinámico
- `src/app/learn/imported/[nodeId]/exercises/components/ExerciseHeader.tsx` - Botón warmup
- `src/app/learn/imported/[nodeId]/exercises/components/ExerciseMenu.tsx` - UI de modos
- `public/sw.js` - Service worker actualizado

---

### FASE 2.9: AAA Visual Quality Review Implementation (Completada - 2026-01-09)

**Objetivo:** Implementar todas las recomendaciones de accesibilidad WCAG AAA y optimizaciones de rendimiento para producción.

**Commit:** `13593e8` - feat: Implement AAA visual quality review recommendations

**Archivos Creados (7):**

1. **`src/hooks/useReducedMotion.ts`:**
   - Detección de `prefers-reduced-motion` a nivel de OS
   - Hook `useReducedMotion()` para componentes
   - Hook `useAnimationConfig()` para configuración condicional

2. **`src/hooks/useAnimationBudget.ts`:**
   - Monitoreo de FPS en tiempo real
   - Deshabilitación automática de animaciones si FPS < 30
   - Re-habilitación si FPS > 50
   - Hook `useAnimationControl()` combinado con reduced motion

3. **`src/components/ui/ErrorBoundary.tsx`:**
   - ErrorBoundary con UI fallback AAA
   - Animación de pulso en orb de error
   - Botón de recarga estilizado
   - Logging de errores en consola

4. **`src/components/learn/InfiniteCourseMap.tsx`:**
   - 600+ temas generados (10 categorías × 10 temas × 6 niveles)
   - Scroll infinito con lazy loading (50 nodos por batch)
   - Búsqueda de temas en tiempo real
   - Filtrado por categoría (10) y nivel (A1-C2)
   - Grid responsivo (2-4 columnas)
   - Orbs con progreso, XP, lock state
   - Estadísticas agregadas (total, completados, en progreso, bloqueados, XP)

5. **`src/components/ui/AAAAnimatedBackground.tsx`:**
   - 4 variantes: midnight, nebula, aurora, sunset
   - 3 intensidades: subtle, medium, intense
   - Gradientes radiales animados
   - Optimizado con will-change

6. **`src/components/ui/XPSurgeEffect.tsx`:**
   - Efecto visual de ganancia de XP
   - Partículas flotantes
   - Animaciones escalables

7. **`src/components/ui/GamificationFeedback.tsx`:**
   - Feedback visual de logros
   - Celebraciones animadas
   - Confeti y sparkles

**Archivos Modificados (4):**

1. **`src/app/layout.tsx`:**
   - Envuelto en `AAAErrorBoundary`
   - Integrado `AAAAnimatedBackground`
   - Integrado `XPSurgeEffect`
   - Integrado `GamificationFeedback`

2. **`src/components/layout/BottomNav.tsx`:**
   - Ocultada opción "Palacio" (líneas 27-32 comentadas)
   - 4 items activos: Dashboard, Mapa, Misiones, Deck

3. **`src/app/input/page.tsx`:**
   - Integrado `useReducedMotion`
   - Añadidos ARIA labels completos
   - Text shadows para contraste WCAG AAA
   - Touch targets de 44px mínimo
   - Focus rings visibles
   - will-change CSS properties
   - Animaciones condicionales

4. **`src/app/input/audio/page.tsx` & `src/app/input/text/page.tsx`:**
   - Fix de quotes escapados (&quot;)

---

## Tests Actuales

| Suite | Tests | Estado |
|-------|-------|--------|
| textures.test.ts | 22 | ✅ Pasando |
| haptic.test.ts | 32 | ✅ Pasando |
| memoryBankIntegration.test.ts | 32 | ✅ Pasando |
| **Total Memory Bank** | **86** | ✅ |
| pbr.test.ts | 66 | ✅ Pasando |
| constructionStore.test.ts | 55 | ✅ Pasando |
| constructionIntegration.test.ts | 53 | ✅ Pasando |
| progression.test.ts | 94 | ✅ Pasando |
| constructionSound.test.ts | 62 | ✅ Pasando |
| **Total Construction 3D** | **330** | ✅ |
| soundEffects.test.ts | 23 | ✅ Pasando |
| **Total Gold Standard GS-2.3** | **23** | ✅ |
| analytics.test.ts | 23 | ✅ Pasando |
| **Total Gold Standard GS-3** | **23** | ✅ |
| **TOTAL GENERAL** | **462** | ✅ |

> **Nota:** 597/612 tests pasando. Los 15 tests fallantes son en wordExtractor.test.ts (preexistentes, no relacionados con GS-3).

---

## Dependencias Añadidas

```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.88.0"
}
```

---

## Estructura de Stores Actualizada

```
src/store/
├── useSRSStore.ts           # Sistema SRS
├── useInputStore.ts         # Métricas INPUT
├── useImportedNodesStore.ts # Contenido importado
├── useWordDictionaryStore.ts # Diccionario de palabras
├── useUserStore.ts          # Configuración usuario (mode ya NO se usa para flujo)
├── useMissionStore.ts       # Misiones diarias
├── useCognitiveLoadStore.ts # CLT y Focus Mode
├── useGamificationStore.ts  # XP, coins, gems, streak
├── useConstructionStore.ts  # Sistema de construcción 3D
└── useThemeStore.ts         # Light/Dark mode
```

---

## Métricas Actuales

### Build
- ✅ Compila sin errores
- ✅ Sin warnings críticos de ESLint
- ✅ Sin errores de TypeScript
- ✅ 24 páginas estáticas generadas

### Tests
- ✅ 462 tests pasando
- ✅ Build + Lint OK
- ✅ npm run build exitoso

### Sistema de Construcción
- ✅ 15 materiales PBR definidos
- ✅ 14 elementos constructivos
- ✅ 57 hitos de construcción (7 categorías)
- ✅ Sistema de recompensas integrado
- ✅ UI de inventario y galería completa

---

## Próximos Pasos

### CRÍTICO: FASE 3 - Contenido ÁREA 0 (0%)
Sin contenido real, la aplicación no puede usarse para aprender francés.

1. **TAREA 3.1** - Schema para ÁREA 0
2. **TAREA 3.2** - NODO 0.1 — Saludos y Despedidas
3. **TAREA 3.3** - NODO 0.2 — Presentaciones Básicas
4. **TAREA 3.4** - NODO 0.3 — Números 0-20
5. **TAREA 3.5** - NODO 0.4 — Verbos Clave (être, avoir, aller)
6. **TAREA 3.6** - NODO 0.5 — Preguntas Básicas
7. **TAREA 3.7** - NODO 0.6 — Cortesía y Agradecimientos
8. **TAREA 3.8** - NODO 0.7 — Despedidas y Próximos Pasos

### MEDIA PRIORIDAD: Gaps Menores
- Integrar rate limiter en translationService y APIs externas
- Integrar circuit breaker en llamadas externas
- Tests E2E con Playwright
- Documentar navegación Janus Matrix

### BAJA PRIORIDAD: Futuro
- **FASE 7** - Contenido adicional A1/A2
- **FASE 8** - Monetización (Stripe, Analytics)

---

## Fases Completadas (Resumen)

### FASE 0: Production Readiness ✅ (90%)
- `src/services/errorHandler.ts` - Retry con exponential backoff
- `src/services/rateLimiter.ts` - Token bucket algorithm
- `src/services/circuitBreaker.ts` - State machine completa
- Vitest + Testing Library configurado

### FASE 1: Sistema CLT ✅ (100%)
- `src/store/useCognitiveLoadStore.ts` - Store con métricas CLT
- `src/components/shared/FocusMode.tsx` - Modo Focus (4 niveles)
- `src/services/cognitiveLoadMetrics.ts` - Cálculo de carga cognitiva
- `src/components/missions/MissionFeed.tsx` - Feed de misiones
- `src/components/gamification/PostCognitiveRewards.tsx` - Recompensas post-sesión
- `src/components/session/SessionSummary.tsx` - Resumen de sesión

### FASE 2.5: Low Click UX ✅ (95%)
- `src/hooks/useKeyboardShortcuts.ts` - Hotkeys 1-4 para SRS
- `src/components/srs/SwipeableSRSCard.tsx` - Swipe gestures
- `src/components/shared/MicroInteractions.tsx` - 8 tipos de animaciones

### FASE 2.6: Visual Design ✅ (100%)
- Tipografía: Rajdhani, Quicksand, Inter, Atkinson
- `src/components/animations/RiveAnimation.tsx` - Rive integration
- `src/components/animations/LottieAnimation.tsx` - Lottie integration
- Framer Motion en 50+ componentes

### FASE 2.7: Visualización Neural ✅ (100%)
- `src/components/visualization/KrashenRings.tsx` - Anillos de input
- `src/components/visualization/SynapticDensity.tsx` - Red neuronal
- `src/components/visualization/BrainZoneActivation.tsx` - 7 zonas cerebrales
- `src/components/visualization/NeuralDashboard.tsx` - Dashboard integrado
- `src/components/visualization/ColorPaletteSystem.tsx` - 5 paletas WCAG AA

### FASE 2.8: Memory Bank AAA + Construction 3D ✅ (100%)
- Sistema de texturas PBR
- Motor de sonido contextual
- Tarjetas episódicas con física
- Sistema de construcción 3D
- UI de colección completa

### FASE 2.9: AAA Visual Quality Review ✅ (100%)
- Reduced motion detection
- Animation budget con FPS monitoring
- ErrorBoundary AAA
- InfiniteCourseMap optimizado
- Sonidos sintetizados Web Audio API

### FASE GS-3: Optimizaciones Finales ✅ (100%)
- Animaciones optimizadas INP < 200ms
- Modo Light/Dark
- Página FAQ/Ayuda
- Analytics system

### SIMPLIFICACIÓN DE MODOS ✅ (2026-01-10)
- Eliminada distinción guiado/autónomo
- Todos los usuarios tienen acceso a todo
- Página /learn unificada
- Botón de warmup en header
- npm run build pasa sin errores

### AUDITORÍA DE PRODUCCIÓN ✅ (2026-01-10)
- Análisis completo de infraestructura
- Roadmap a €5,000/mes creado
- 25 tareas de monetización definidas
- Timeline realista: 24 semanas

---

## 🔴 BLOQUEADORES DE NEGOCIO (Sin estos, NO hay ingresos)

### BLOQUEADOR #1: Contenido ÁREA 0 (0%)
- Sin contenido real de francés A0
- Faltan 7 nodos, ~50 lecciones, ~500-800 ejercicios
- **Impacto:** 0 usuarios pueden aprender francés

### BLOQUEADOR #2: Paywall (0%)
- No hay sistema free vs premium
- No hay bloqueo de contenido después de lección 3
- **Impacto:** 0€ de ingresos posibles

### BLOQUEADOR #3: Stripe (0%)
- No hay procesamiento de pagos
- Faltan API routes, webhooks, productos
- **Impacto:** 0€ de ingresos posibles

### BLOQUEADOR #4: Landing Page (0%)
- No hay página de venta DELF
- No hay propuesta de valor clara
- **Impacto:** 0 tráfico = 0 usuarios = 0 ingresos

### BLOQUEADOR #5: Persistencia (20%)
- Schema SQL existe pero NO está implementado
- El progreso no se guarda en la nube
- **Impacto:** 0% retención, nadie vuelve

---

## 🚀 FASE MONETIZACIÓN - ROADMAP A €5,000/mes

**Archivo detallado:** `.memory-bank/AUDITORIA_PRODUCCION_5000EUR.md`
**Tareas en MASTER_PLAN:** TAREAS M.1 - M.25
**Estrategia:** INFRAESTRUCTURA PRIMERO, CONTENIDO DESPUÉS

### Semana 1: STRIPE + PERSISTENCIA (TAREAS M.1 - M.5)
- M.1: Sistema de Persistencia con Supabase (12h)
- M.2: Configurar Stripe (4h)
- M.3: API Routes Stripe (8h)
- M.4: Servicio de Suscripción (6h)
- M.5: Integración con Auth (4h)

### Semana 2: PAYWALL + LANDING PAGE (TAREAS M.6 - M.9)
- M.6: Paywall después de Lección 3 (8h)
- M.7: Landing Page Principal (16h)
- M.8: SEO y Analytics (6h)
- M.9: Páginas de Checkout (4h)

### Semana 3-4: CONTENIDO ÁREA 0 MÍNIMO (TAREAS M.10 - M.17)
- M.10: Schema para ÁREA 0 (4h)
- M.11: NODO 0.1 — Saludos y Despedidas (8h)
- M.12: NODO 0.2 — Presentaciones Básicas (8h)
- M.13: NODO 0.3 — Números 0-20 (8h)
- M.14: NODO 0.4 — Verbos Clave (8h)
- M.15: NODO 0.5 — Preguntas Básicas (6h)
- M.16: NODO 0.6 — Cortesía y Agradecimientos (6h)
- M.17: NODO 0.7 — Despedidas y Próximos Pasos (6h)

### Semana 5: TESTING + BETA (TAREAS M.18 - M.19)
- M.18: Testing End-to-End (8h)
- M.19: Beta Cerrada (8h)

### Semana 6-12: TRÁFICO + OPTIMIZACIÓN (TAREAS M.20 - M.25)
- M.20: Configurar Facebook Ads (8h)
- M.21: Configurar Google Ads (8h)
- M.22: Analizar Métricas (8h)
- M.23: Optimizar Funnel (8h)
- M.24: Escalar Ads que Funcionan (8h)
- M.25: Lanzar Referral Program (8h)

**Meta final:** 500 suscriptores @ €9.99/mes = €5,000/mes
