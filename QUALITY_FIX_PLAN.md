# 🔧 PLAN DE CORRECCIÓN DE CALIDAD - LINGUAFORGE

## 📊 Resumen de Problemas Detectados

| Categoría | Críticos | Advertencias | Total |
|-----------|----------|--------------|-------|
| Arquitectura | 1 | 4 | 5 |
| Componentes React | 0 | 35+ | 35+ |
| Complejidad | 9 | 4 | 13 |
| Archivos Grandes | 0 | 5 | 5 |
| **TOTAL** | **10** | **44+** | **54+** |

---

## 🎯 ESTRATEGIA DE CORRECCIÓN

### Prioridades:
1. 🔴 **CRÍTICA** - Rompe arquitectura (Supabase en route handler)
2. 🟡 **ALTA** - Complejidad extrema, archivos >1000 líneas
3. 🟢 **MEDIA** - Complejidad alta, archivos >800 líneas
4. 🔵 **BAJA** - Mejoras de refactorización

---

## 📋 FASE 1: ARQUITECTURA CRÍTICA (🔴 CRÍTICA)

### 1.1 Supabase en Auth Callback (CRÍTICO)
**Archivo:** `src/app/auth/callback/route.ts`

**Problema:**
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

**Solución:** Mover a service layer

**Acciones:**
- [ ] Crear `src/services/authService.ts`
- [ ] Mover lógica de Supabase a `src/services/repository/authRepository.ts`
- [ ] Actualizar route handler para usar servicio

**Archivos a crear:**
```
src/services/
├── authService.ts           # Lógica de autenticación
└── repository/
    └── authRepository.ts    # Acceso a Supabase
```

---

## 📋 FASE 2: ARCHIVOS GIGANTES (>1000 líneas) (🟡 ALTA)

### 2.1 `src/lib/progression/construction.ts` (1245 líneas)

**Problema:** Archivo de 1245 líneas - imposible de mantener

**Solución:** Dividir en módulos por dominio

**Estructura propuesta:**
```
src/lib/progression/
├── construction/
│   ├── index.ts              # Exportaciones públicas
│   ├── types.ts              # Tipos del dominio
│   ├── builders.ts           # Lógica de constructores
│   ├── materials.ts          # Sistema de materiales
│   ├── requirements.ts       # Reglas de requisitos
│   └── progression.ts        # Cálculo de progresión
```

**Acciones:**
- [ ] Crear estructura de directorios
- [ ] Extraer tipos a `types.ts`
- [ ] Extraer lógica de builders a `builders.ts`
- [ ] Extraer materiales a `materials.ts`
- [ ] Actualizar imports en código cliente

---

### 2.2 `src/components/exercises/JanusComposerExercise.tsx` (881 líneas)

**Problema:** Componente con 881 líneas y 33 hooks

**Solución:** Dividir en subcomponentes y custom hooks

**Estructura propuesta:**
```
src/components/exercises/JanusComposerExercise/
├── index.tsx                  # Componente principal (orquestador)
├── components/
│   ├── ColumnSelector.tsx     # Selector de columna
│   ├── WordCard.tsx           # Tarjeta de palabra
│   ├── ConfirmButton.tsx      # Botón de confirmar
│   └── FeedbackDisplay.tsx    # Visualización de feedback
└── hooks/
    ├── useJanusGameState.ts  # Estado del juego
    ├── useJanusValidation.ts # Validación de respuestas
    └── useJanusAudio.ts      # Audio y pronunciación
```

**Acciones:**
- [ ] Crear directorio `JanusComposerExercise/`
- [ ] Extraer hooks a `hooks/`
- [ ] Extraer subcomponentes a `components/`
- [ ] Reducir componente principal a <200 líneas

---

## 📋 FASE 3: COMPLEJIDAD EXTREMA (>20) (🟡 ALTA)

### 3.1 Funciones con complejidad >15

| Archivo | Función | Complejidad | Acción |
|---------|---------|-------------|--------|
| `cognitiveLoadMetrics.ts:634` | `calculateNeuroDesignMetrics` | - | Dividir en funciones más pequeñas |
| `import/page.tsx:26` | `ImportPageContent` | 19 | Extraer componentes |
| `input/text/page.tsx:88` | `TextInputPage` | 18 | Extraer componentes |
| `exercises/page.tsx:26` | `ExercisesPageContent` | 16 | Extraer hooks |
| `imported/[nodeId]/page.tsx:10` | `ImportedNodePage` | 16 | Extraer componentes |
| `practice/page.tsx:12` | `PracticeModeSelection` | 20 | Extraer componentes |

**Patrón de solución:**
1. Identificar bloques lógicos independientes
2. Extraer a funciones/helper functions
3. Extraer a custom hooks
4. Extraer a subcomponentes

**Acciones generales:**
- [ ] Crear helper functions para lógica reutilizable
- [ ] Crear custom hooks para estado complejo
- [ ] Extraer subcomponentes para renderizado

---

## 📋 FASE 4: ARCHIVOS LARGOS (600-800 líneas) (🟢 MEDIA)

### 4.1 Pages con >200 líneas

| Archivo | Líneas | Estrategia |
|---------|--------|------------|
| `construction/page.tsx` | 266 | Extraer a `components/construction/` |
| `dashboard/page.tsx` | 285 | Extraer a `components/dashboard/` |
| `decks/page.tsx` | 387 | Extraer a `components/decks/` |

### 4.2 Componentes con >200 líneas

| Archivo | Líneas | Estrategia |
|---------|--------|------------|
| `learn/page.tsx` | 858 | **CRÍTICO** - Dividir en páginas separadas |
| `schemas/content.ts` | 852 | Dividir por dominio (vocabulario, grammar, etc.) |

**Acciones para `learn/page.tsx`:**
```
src/app/learn/
├── page.tsx                  # Página principal (150 líneas)
├── components/
│   ├── LearnHeader.tsx       # Header y filtros
│   ├── TopicGrid.tsx         # Grid de temas
│   ├── TopicCard.tsx         # Tarjeta de tema
│   ├── FilterBar.tsx         # Barra de filtros
│   └── ProgressSummary.tsx   # Resumen de progreso
└── hooks/
    ├── useTopicFilters.ts    # Lógica de filtros
    └── useTopicProgress.ts   # Cálculo de progreso
```

**Acciones para `schemas/content.ts`:**
```
src/schemas/content/
├── index.ts                  # Exportaciones
├── common.ts                 # Tipos comunes
├── vocabulary.ts             # Esquemas de vocabulario
├── grammar.ts                # Esquemas de gramática
├── conversation.ts           # Esquemas de conversación
└── exercises.ts              # Esquemas de ejercicios
```

---

## 📋 FASE 5: COMPONENTES CON DEMASIADOS HOOKS (>20) (🔵 BAJA)

### Análisis de componentes críticos (>20 hooks):

| Componente | Hooks | Tipo | Solución |
|-----------|-------|------|----------|
| `JanusComposerExercise.tsx` | 33 | Exercise | Ver Fase 2.2 |
| `InteractiveSpeechExercise.tsx` | 26 | Exercise | Extraer hooks |
| `EchoStreamExercise.tsx` | 26 | Exercise | Extraer hooks |
| `MemoryBank/EpisodicCard.tsx` | 28 | Feature | Extraer hooks |
| `ConversationalEchoExercise.tsx` | 21 | Exercise | Extraer hooks |
| `DialogueIntonationExercise.tsx` | 19 | Exercise | Extraer hooks |
| `PragmaStrikeExercise.tsx` | 12 | Exercise | Aceptar |
| `ShadowingExercise.tsx` | 12 | Exercise | Aceptar |

**Patrón de refactorización:**
```typescript
// ANTES (demasiados hooks en componente)
function Component() {
  const hook1 = useHook1();
  const hook2 = useHook2();
  // ... 20+ hooks
  return <div>...</div>;
}

// DESPUÉS (custom hook agrupa lógica relacionada)
function Component() {
  const exerciseState = useExerciseState();  // Agrupa 5+ hooks
  const audioState = useAudioState();        // Agrupa 3+ hooks
  const validation = useValidation();        // Agrupa 2+ hooks
  return <div>...</div>;
}
```

---

## 📋 FASE 6: LÓGICA DE NEGOCIO EN COMPONENTES (🔵 BAJA)

### 6.1 YouTubePlayer.tsx
**Problema:** Componente maneja API de YouTube directamente

**Solución:** Extraer a custom hook

```typescript
// src/hooks/useYouTubeIframe.ts
export function useYouTubeIframe(videoId: string) {
  // Lógica de carga de API de YouTube
  // Control de player
  // Eventos y callbacks
}

// Componente simplificado
function YouTubePlayer({ videoId }) {
  const player = useYouTubeIframe(videoId);
  return <div ref={player.containerRef} />;
}
```

---

## 📋 FASE 7: PARAMETROS EXCESIVOS (🔵 BAJA)

### 7.1 `calculateNeuroDesignMetrics` (11 parámetros)

**Problema:** Función con 11 parámetros (máximo permitido: 6)

**Solución:** Agrupar en objeto de parámetros

```typescript
// ANTES
function calculateNeuroDesignMetrics(param1, param2, ..., param11) { }

// DESPUÉS
interface NeuroDesignInput {
  cognitiveLoad: number;
  accuracy: number;
  speed: number;
  // ... resto de params
}

function calculateNeuroDesignMetrics(input: NeuroDesignInput) { }
```

---

## 📋 FASE 8: KEYS FALTANTES EN LISTS (🔵 BAJA)

### 8.1 ColorPaletteSystem.tsx

**Problema:** Lists sin key prop

**Solución:** Añadir keys apropiadas

```typescript
// ANTES
{Object.keys(COLOR_PALETTES).map((palette) => (
  <PaletteButton key={palette} palette={palette} />
))}

// DESPUÉS (usar índice como último recurso)
{(Object.keys(COLOR_PALETTES) as ColorPalette[]).map((palette, index) => (
  <PaletteButton key={`${palette}-${index}`} palette={palette} />
))}
```

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

### Sprint 1 (Semana 1) - Arquitectura Crítica
1. ✅ Crear `authService.ts` y `authRepository.ts`
2. ✅ Migrar `auth/callback/route.ts`

### Sprint 2 (Semanas 2-3) - Archivos Gigantes
1. ✅ Dividir `lib/progression/construction.ts`
2. ✅ Refactorizar `JanusComposerExercise.tsx`
3. ✅ Dividir `schemas/content.ts`

### Sprint 3 (Semana 4) - Pages Grandes
1. ✅ Dividir `app/learn/page.tsx`
2. ✅ Extraer componentes de `dashboard/page.tsx`
3. ✅ Extraer componentes de `decks/page.tsx`

### Sprint 4 (Semana 5) - Complejidad
1. ✅ Reducir complejidad de `practice/page.tsx`
2. ✅ Reducir complejidad de `import/page.tsx`
3. ✅ Refactorizar `cognitiveLoadMetrics.ts`

### Sprint 5 (Semana 6) - Hooks y Components
1. ✅ Extraer hooks de componentes con 20+ hooks
2. ✅ Añadir keys a listas
3. ✅ Crear custom hooks para lógica de negocio

---

## 📊 MÉTRICAS DE ÉXITO

### Antes (Estado Actual)
- Archivos >1000 líneas: 1
- Archivos >800 líneas: 4
- Componentes con >20 hooks: 3
- Complejidad >20: 1
- Complejidad >15: 5
- @ts-ignore: 3
- TODO sin issue: 3

### Objetivo (Después)
- Archivos >1000 líneas: 0
- Archivos >800 líneas: 2 máximo
- Componentes con >20 hooks: 0
- Complejidad >20: 0
- Complejidad >15: 2 máximo
- @ts-ignore: 0
- TODO sin issue: 0

---

## 🔧 HERRAMIENTAS DE AYUDA

### Para detectar complejidad:
```bash
npx eslint src/ --ext .ts,.tsx --rule "complexity: ['error', 15]"
```

### Para encontrar archivos grandes:
```bash
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20
```

### Para analizar hooks:
```bash
grep -r "use[A-Z]" src/components --include="*.tsx" -h | awk '{print $1}' | sort | uniq -c | sort -rn
```

---

## 📝 NOTAS

1. **NO refactorizar todo de golpe** - Hacer en sprints controlados
2. **Tests obligatorios** - Cada refactor debe incluir tests
3. **Git commits atómicos** - Un cambio semántico por commit
4. **Revisión por pares** - Cada fase debe ser revisada
5. **Documentación** - Actualizar docs de arquitectura después de cada fase

---

## 🎯 CHECKLIST FINAL

- [ ] Todos los archivos tienen <1000 líneas
- [ ] Todas las funciones tienen <80 líneas
- [ ] Todas las funciones tienen complejidad <15
- [ ] Todos los componentes tienen <15 hooks
- [ ] Supabase solo en services/repositories
- [ ] Todas las lists tienen key prop
- [ ] Ningún @ts-ignore sin explicación
- [ ] Ningún TODO sin issue tracker
- [ ] Quality gate pasa sin errores

---

**Fecha de creación:** 2026-01-10
**Estado:** Pendiente de aprobación
**Prioridad:** 🔴 ALTA - Ejecutar antes de nuevo features
