# Active Context — Contexto Activo

> Última actualización: 2026-01-03

## Estado Actual

**Versión del Plan:** v4.0 (Base) + v2.0 (Expansión LinguaForge) + Sistema INPUT + SRS + CLT
**Fase:** FASE 5 y 6 completadas parcialmente
**Tarea activa:** ÁREA 0 - Contenido base (próxima tarea crítica)
**Última completada:** FASE 5 Optimizaciones + Tests unitarios (155 tests)

## Resumen de Trabajo Reciente

### FASE 5: Optimizaciones (Completada)

1. **Lazy Loading de Ejercicios (`src/components/exercises/lazy.ts`):**
   - 18 ejercicios con carga diferida usando `next/dynamic`
   - Loading placeholder con spinner
   - SSR deshabilitado para mejor rendimiento

2. **Cache de Traducciones (`src/services/translationService.ts`):**
   - Cache en localStorage con límite de 5000 entradas
   - Limpieza automática de entradas antiguas
   - Funciones: `getCacheStats()`, `clearTranslationCache()`, `preloadCommonTranslations()`

3. **Performance Hooks (`src/hooks/usePerformance.ts`):**
   - `useDebounce` - Debounce de valores
   - `useDebouncedCallback` - Debounce de callbacks
   - `useThrottledCallback` - Throttle de callbacks
   - `useIntersectionObserver` - Detección de visibilidad
   - `usePrevious` - Valor anterior
   - `useMemoizedSelector` - Selectores memoizados
   - `useStableCallback` - Callbacks estables
   - `useMediaQuery` - Detección de media queries
   - `usePrefersReducedMotion` - Preferencia de animaciones
   - `useIdleCallback` - Tareas en tiempo idle

### FASE 6: Testing (Parcialmente Completada)

1. **Tests Unitarios (155 tests pasando):**
   - `__tests__/unit/missionGenerator.test.ts` (21 tests)
   - `__tests__/unit/postCognitiveRewards.test.ts` (30 tests)
   - `__tests__/unit/warmupSelector.test.ts` (21 tests)
   - `__tests__/unit/usePerformance.test.ts` (18 tests)
   - Tests existentes: schemas, constants, rankSystem, hpSystem

2. **Pendiente:**
   - Tests E2E con Playwright
   - Visual regression tests

---

### Sistema INPUT Completo (Video/Audio/Texto)

1. **Página Hub INPUT (`/input`):**
   - Vista centralizada para todos los tipos de input
   - Métricas agregadas (visualizaciones, escuchas, lecturas)
   - Navegación a video/audio/texto
   - Contadores únicos por contenido

2. **Reproductor de Video (`/input/video`):**
   - Integración con YouTube IFrame API
   - Tracking de tiempo de visualización
   - Extracción automática de transcripciones (youtube-transcript.io API)
   - Contador de visualizaciones únicas
   - Selección de palabras clave del transcript
   - Botón Quick Review para repaso rápido

3. **Reproductor de Audio (`/input/audio`):**
   - Player de audio con controles
   - Tracking de tiempo de escucha
   - Transcripción manual o automática
   - Contador de escuchas únicas
   - Selección de palabras clave
   - Botón Quick Review

4. **Lector de Texto (`/input/text`):**
   - Textarea para contenido de texto
   - Generación de audio con TTS (Web Speech API)
   - Contador de palabras leídas
   - Selección de palabras clave
   - Botón Quick Review

### Sistema SRS (Spaced Repetition System)

1. **Store SRS (`useSRSStore`):**
   - Algoritmo SuperMemo 2 (SM-2) implementado
   - Cards con metadata completa (fuente, contexto)
   - Estadísticas de repaso
   - Filtros por fuente (video/audio/texto)
   - Método `addCards` para agregar múltiples cards eficientemente

2. **Extracción de Palabras Clave:**
   - Servicio `wordExtractor.ts` que identifica verbos, sustantivos, adverbios, adjetivos
   - Filtrado de palabras comunes
   - Normalización (minúsculas, sin acentos)
   - Contexto preservado (frase original)
   - Mejoras en detección de adjetivos

3. **Diccionario de Palabras (`useWordDictionaryStore`):**
   - Tracking de palabras ya estudiadas
   - Evita duplicados en extracción
   - Vinculación con cards SRS
   - Método `getNewWords` para filtrar palabras nuevas

4. **Generación Automática de Ejercicios:**
   - `wordExerciseGenerator.ts` genera Cloze y Detection desde palabras
   - Traducción automática con `translationService.ts`
   - Cards creadas automáticamente
   - Integración con diccionario de palabras

5. **Dashboard SRS (`/decks`):**
   - Vista de todos los decks organizados por fuente
   - Estadísticas (total, new, due, mastered)
   - Filtros por estado y fuente
   - Búsqueda de frases/traducciones
   - Vista previa de palabras en cada deck

6. **Sesiones de Repaso (`/decks/review`):**
   - Ejercicios generados dinámicamente
   - Respuestas SM-2 (again/hard/good/easy)
   - Actualización automática de intervalos
   - Estadísticas de sesión
   - Filtrado por fuente (opcional)

### Sistema de Contenido Importado

1. **Nodos Importados (`useImportedNodesStore`):**
   - Estructura: Nodo → Subtopic → Phrases
   - Persistencia local con Zustand
   - Tracking de progreso por subtopic
   - Métodos: createNode, addSubtopic, completeSubtopic

2. **Generación de Ejercicios desde Frases:**
   - `generateExercisesFromPhrases.ts` genera todos los tipos:
     - Cloze exercises
     - Variations exercises
     - ConversationalEcho exercises
     - DialogueIntonation exercises
     - **JanusComposer exercises** (mejorado recientemente)

3. **Página de Ejercicios (`/learn/imported/[nodeId]/exercises`):**
   - Menú de ejercicios con todos los tipos disponibles
   - Modos Academia y Desafío
   - Navegación entre ejercicios
   - Progreso por tipo de ejercicio
   - Logs de depuración para troubleshooting

4. **Mejoras en Janus Composer:**
   - Extracción mejorada de verbos y complementos
   - Detección de verbos por patrones y terminaciones
   - Valores por defecto cuando no hay suficientes elementos
   - Reglas de conjugación generadas automáticamente
   - Siempre genera al menos un ejercicio
   - Validaciones mejoradas (mínimo 2 opciones por columna)

### Componentes Nuevos

1. **WordSelector (`src/components/transcript/WordSelector.tsx`):**
   - Selección directa de palabras en transcript
   - Lista compacta de palabras seleccionadas
   - Traducción automática
   - Creación de cards SRS
   - Integración con diccionario de palabras

2. **QuickReviewButton (`src/components/transcript/QuickReviewButton.tsx`):**
   - Botón flotante para iniciar repaso rápido
   - Muestra contador de cards pendientes
   - Filtrado por fuente actual
   - Disponible en todas las páginas INPUT

3. **TranscriptSelector (`src/components/transcript/TranscriptSelector.tsx`):**
   - Visualización de transcript
   - Selección de texto y palabras
   - Integración con WordSelector
   - Modos de selección (text/phrase)

### Integraciones Externas

1. **YouTube Transcript API:**
   - Integración con youtube-transcript.io
   - API route `/api/youtube/transcript`
   - Fallback a scraping manual
   - Manejo de errores robusto
   - Logging extensivo para debugging

2. **Servicio de Traducción:**
   - Google Translate API (si está configurado)
   - Fallback a MyMemory Translation API
   - API route `/api/translate`
   - Traducción automática de palabras extraídas

### Mejoras UX

1. **Navegación:**
   - BottomNav actualizado con "Input" y "Decks"
   - Flujo intuitivo entre consumo y repaso
   - Navegación clara entre páginas relacionadas

2. **Perfil de Usuario:**
   - Selector de modo (Guiado/Autónomo)
   - Persistencia de preferencias en `useUserStore`
   - Descripción de cada modo

3. **Feedback Visual:**
   - Contadores de progreso visibles
   - Indicadores de estado (new, due, mastered)
   - Botones Quick Review con contadores

### Correcciones Técnicas Recientes

1. **Generación de Ejercicios Janus:**
   - Mejoras en extracción de componentes
   - Validaciones mejoradas
   - Logs de depuración añadidos
   - Manejo de casos edge (pocas frases)

2. **Hooks de React:**
   - Consolidación de múltiples `useInputStore` calls
   - Uso de `useMemo` para cálculos costosos
   - Prevención de "Maximum update depth exceeded"

3. **Validaciones:**
   - Validación de frases antes de generar ejercicios
   - Filtrado de frases vacías
   - Manejo de arrays vacíos

## Archivos Creados/Modificados Recientemente

### Nuevos Componentes
- `src/components/transcript/WordSelector.tsx`
- `src/components/transcript/QuickReviewButton.tsx`
- `src/components/transcript/TranscriptSelector.tsx` (mejorado)

### Nuevos Servicios
- `src/services/wordExtractor.ts`
- `src/services/wordExerciseGenerator.ts`
- `src/services/translationService.ts`
- `src/services/generateExercisesFromPhrases.ts` (mejorado)

### Nuevos Stores
- `src/store/useWordDictionaryStore.ts`
- `src/store/useSRSStore.ts` (mejorado)
- `src/store/useInputStore.ts` (mejorado)
- `src/store/useUserStore.ts` (mejorado con modo de aprendizaje)

### Nuevas Páginas
- `src/app/input/page.tsx` (hub INPUT)
- `src/app/input/video/page.tsx`
- `src/app/input/audio/page.tsx`
- `src/app/input/text/page.tsx`
- `src/app/decks/page.tsx` (dashboard SRS)
- `src/app/decks/review/page.tsx` (sesiones de repaso)
- `src/app/learn/imported/[nodeId]/exercises/page.tsx` (mejorado)

### Nuevas API Routes
- `src/app/api/youtube/transcript/route.ts`
- `src/app/api/translate/route.ts`

### Nuevos Types
- `src/types/srs.ts`
- `src/types/wordDictionary.ts`

## Próximos Pasos

### Inmediato (Crítico) - ÁREA 0
1. **TAREA 3.1** - Crear schema para ÁREA 0
2. **TAREA 3.2** - NODO 0.1 — Saludos y Despedidas
3. **TAREA 3.3** - NODO 0.2 — Presentaciones Básicas
4. **TAREA 3.4** - NODO 0.3 — Números 0-20
5. **TAREA 3.5** - NODO 0.4 — Verbos Clave (être, avoir, aller)
6. **TAREA 3.6** - NODO 0.5 — Preguntas Básicas
7. **TAREA 3.7** - NODO 0.6 — Cortesía y Agradecimientos
8. **TAREA 3.8** - NODO 0.7 — Despedidas y Próximos Pasos
9. **TAREA 3.9** - Integración ÁREA 0 en Sistema

### Completado Recientemente
1. **FASE 5 Optimizaciones:** ✅
   - ✅ Lazy loading de ejercicios
   - ✅ Cache de traducciones
   - ✅ Performance hooks

2. **FASE 6 Testing (Parcial):** ✅
   - ✅ 155 tests unitarios pasando
   - ⏳ Tests E2E pendientes
   - ⏳ Visual regression pendientes

3. **Backend:** ✅
   - ✅ Supabase Auth
   - ✅ Sync Service
   - ✅ PWA

### Medio Plazo
- Expansión contenido A1
- Tests E2E con Playwright

### Largo Plazo
- Contenido A2 y otros idiomas
- Monetización (Stripe)

## Decisiones Técnicas Recientes

1. **Generación de Ejercicios:** Siempre generar al menos un ejercicio, incluso con pocas frases
2. **Extracción de Palabras:** Usar heurísticas mejoradas para identificar tipos de palabras
3. **Traducción:** Automática para todas las palabras extraídas
4. **SRS:** Algoritmo SM-2 con metadata completa de fuente
5. **Validaciones:** Validar datos antes de procesar para evitar errores

## Métricas Actuales

### Sistema INPUT
- ✅ 3 tipos de input (video/audio/texto)
- ✅ Tracking completo de métricas
- ✅ Extracción automática de transcripciones
- ✅ Selección de palabras clave

### Sistema SRS
- ✅ Algoritmo SM-2 implementado
- ✅ Dashboard completo
- ✅ Sesiones de repaso funcionales
- ✅ Integración con INPUT

### Ejercicios Importados
- ✅ 5 tipos de ejercicios generados automáticamente
- ✅ Modos Academia y Desafío
- ✅ Progreso tracking
- ✅ Mejoras en Janus Composer

## Bloqueadores Actuales

Ninguno. El sistema está funcional y listo para expandir funcionalidades.

## Notas de Desarrollo

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Linting
npm run lint
```

### Estructura de Stores
```
src/store/
├── useSRSStore.ts          # Sistema SRS
├── useInputStore.ts        # Métricas INPUT
├── useImportedNodesStore.ts # Contenido importado
├── useWordDictionaryStore.ts # Diccionario de palabras
└── useUserStore.ts         # Configuración usuario
```

### Estructura de Servicios
```
src/services/
├── generateExercisesFromPhrases.ts  # Generación ejercicios
├── wordExtractor.ts                  # Extracción palabras
├── wordExerciseGenerator.ts          # Generación ejercicios desde palabras
├── translationService.ts             # Traducción automática
└── conjugationService.ts             # Conjugación francesa
```
