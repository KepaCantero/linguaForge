# Active Context — Sesión Actual

> Última actualización: 2025-01-XX

## Estado Actual

**Versión del Plan:** v4.0 (Base) + v2.0 (Expansión LinguaForge)
**Fase:** v2.0 - Implementación de Lecciones y Ejercicios Core
**Tarea activa:** Integración completa de ejercicios y mejoras UX
**Próxima expansión:** Completar contenido y optimizaciones

## Resumen de Sesión Reciente

### Implementación de Sistema de Lecciones (Topic Tree)

1. **Estructura de Lecciones Completa:**
   - Sistema Topic Tree con `TopicBranch` y `TopicLeaf`
   - Página dinámica `/tree/leaf/[leafId]` para cada lección
   - Carga dinámica de contenido JSON con `lessonLoader.ts`
   - Schema `LessonContentSchema` con soporte para:
     - Frases clásicas (Cloze, Shadowing, Variations)
     - Input comprensible (audio, video, texto)
     - Mini-test y Mini-task
     - Ejercicios core v2.0 (6 tipos)
     - Configuración de modos (Academia/Desafío)

2. **Modos de Lección:**
   - **Academia (Training):** Sin límite de tiempo, con pistas, reintentos ilimitados, XP 1.0x
   - **Desafío (Challenge):** Límite de tiempo (15 min), sin pistas, sin reintentos, XP 1.5x, recompensa de gemas

3. **Ejercicios Core v2.0 Implementados:**
   - ✅ **Shard Detection** (4 ejercicios con imágenes)
   - ✅ **Pragma Strike** (3 ejercicios situacionales)
   - ✅ **Echo Stream** (2 ejercicios con audio y visualización de ondas)
   - ✅ **Glyph Weaving** (1 ejercicio con matriz dinámica)
   - ✅ **Resonance Path** (3 ejercicios de entonación)
   - ⏳ **Forge Mandate** (pendiente - orquestador de ejercicios)

4. **Ejercicios Clásicos Mejorados:**
   - Cloze, Shadowing, Variations con traducciones opcionales
   - Navegación mejorada en modo Academia
   - Progreso granular por tipo de ejercicio

### Mejoras UX/Behavioral Design

Basado en análisis UX (`ux-analysis.md`), se implementaron:

1. **Feedback Háptico:**
   - Vibración en móviles al seleccionar opciones
   - Implementado en Cloze, Pragma Strike, Shard Detection

2. **Traducciones Opcionales:**
   - Botón toggle para mostrar/ocultar traducciones
   - Permite aprendizaje sin traducciones
   - Implementado en: Cloze, Shadowing, Variations, Shard Detection, Echo Stream

3. **Menú de Ejercicios Mejorado:**
   - Diseño visual atractivo con gradientes y animaciones
   - Layout compacto que muestra todo "en un golpe de vista"
   - Progreso visible por ejercicio y tipo
   - Grid responsive (más columnas en desktop)

4. **Navegación Optimizada:**
   - Eliminada pantalla intermedia de selección de modo
   - Modo seleccionado directamente desde intro
   - En Academia: completar todas las frases de un tipo antes de volver al menú
   - Confirmación al salir de ejercicio después de 10 segundos

5. **Atajos de Teclado:**
   - `SPACE`: Reproducir audio
   - `1-4`: Seleccionar opción en ejercicios de opción múltiple
   - Implementado en Cloze Exercise

6. **Recompensas Variables:**
   - 10% de probabilidad de "critical surge" (doble XP)
   - Efectos de partículas para feedback visual
   - Implementado en `useGamificationStore`

### Integración de Nuevas Librerías

1. **react-countup:**
   - Componente `CountUpNumber` para animar números (XP, coins, stats)
   - Integrado en Header y Dashboard
   - Compatible con SSR (evita errores de hidratación)

2. **@tsparticles/react + @tsparticles/engine:**
   - Componente `ParticlesSurge` para efectos de partículas
   - `XPSurgeEffect` escucha eventos globales de XP surge
   - Integrado en `layout.tsx` para efectos globales

3. **reactflow:**
   - Componente `JanusMatrixFlow` para visualización avanzada de matrices
   - Nodos arrastrables, zoom, paneo
   - Ejemplo en `JanusMatrixFlowExample.tsx`

4. **recharts:**
   - Componente `KrashenCharts` para visualizar estadísticas de input
   - Gráficos de barras y área
   - Integrado en Dashboard

5. **use-undo:**
   - Hook `useUndo` para funcionalidad deshacer/rehacer
   - Integrado en `JanusMatrix` para deshacer selecciones de celdas

### Correcciones Técnicas

1. **Errores de Hidratación SSR:**
   - `CountUpNumber` ahora detecta montaje del cliente
   - Renderiza valor estático en servidor, anima en cliente
   - Evita discrepancias entre servidor y cliente

2. **Carga de Imágenes:**
   - Configurado `next.config.mjs` con `remotePatterns` para `picsum.photos`
   - Cambiadas URLs de Unsplash a Picsum para evitar 404s

3. **Carga de Audio:**
   - Audio cargado solo cuando el usuario inicia el ejercicio
   - Manejo de errores con `onloaderror` en Howler.js
   - Ejercicios funcionan sin audio si falla la carga

4. **Canvas Rendering:**
   - Glyph Weaving y Echo Stream ahora renderizan correctamente
   - Canvas dimensionado dinámicamente según contenido
   - Lógica de dibujo mejorada con `useEffect` dependencies

### Archivos Creados/Modificados Recientemente

**Nuevos Componentes:**
- `src/components/ui/CountUpNumber.tsx`
- `src/components/ui/ParticlesSurge.tsx`
- `src/components/ui/XPSurgeEffect.tsx`
- `src/components/janus/JanusMatrixFlow.tsx`
- `src/components/janus/JanusMatrixFlowExample.tsx`
- `src/components/dashboard/KrashenCharts.tsx`
- `src/hooks/useUndo.ts`

**Componentes Modificados:**
- `src/app/tree/leaf/[leafId]/page.tsx` (sistema completo de lecciones)
- `src/components/exercises/ClozeExercise.tsx` (traducciones opcionales, haptic, keyboard shortcuts)
- `src/components/exercises/ShadowingExercise.tsx` (traducciones opcionales)
- `src/components/exercises/VariationsExercise.tsx` (traducciones opcionales)
- `src/components/exercises/ShardDetectionExercise.tsx` (traducciones opcionales)
- `src/components/exercises/EchoStreamExercise.tsx` (traducciones opcionales, carga de audio mejorada)
- `src/components/exercises/GlyphWeavingExercise.tsx` (canvas rendering mejorado)
- `src/components/layout/Header.tsx` (integración CountUpNumber)
- `src/app/dashboard/page.tsx` (integración KrashenCharts y CountUpNumber)
- `src/app/layout.tsx` (integración XPSurgeEffect)
- `src/components/janus/JanusMatrix.tsx` (integración useUndo)

**Servicios:**
- `src/services/lessonLoader.ts` (carga dinámica de lecciones)

**Schemas:**
- `src/schemas/content.ts` (LessonContentSchema con modos y ejercicios core)

**Contenido:**
- `content/fr/A1/lessons/leaf-1-1-greetings.json` (lección completa con todos los ejercicios)

**Configuración:**
- `next.config.mjs` (remotePatterns para imágenes)
- `package.json` (nuevas dependencias)

**Documentación:**
- `src/lib/integrations-guide.md` (guía de uso de nuevas librerías)

## Próximos Pasos

### Contenido Pendiente
1. **Audio Files:** Crear archivos de audio para ejercicios Echo Stream, Glyph Weaving, Resonance Path
2. **Más Lecciones:** Expandir contenido para otras lecciones del Topic Tree
3. **Forge Mandate:** Implementar ejercicio orquestador que combina otros ejercicios

### Optimizaciones
1. **Performance:** Lazy loading de ejercicios core
2. **Caching:** Mejorar caché de contenido de lecciones
3. **Offline:** Preparar contenido para modo offline (PWA)

### Testing
1. **E2E Tests:** Tests de flujo completo de lección
2. **Unit Tests:** Tests para nuevos componentes
3. **Visual Regression:** Tests de UI para ejercicios

## Decisiones Técnicas Recientes

1. **SSR Compatibility:** Todos los componentes con animaciones deben ser compatibles con SSR
2. **Image Loading:** Usar Picsum en lugar de Unsplash para desarrollo (más confiable)
3. **Audio Loading:** Cargar audio solo cuando el usuario inicia el ejercicio (mejor performance)
4. **Translation Visibility:** Traducciones ocultas por defecto, toggle explícito del usuario
5. **Exercise Flow:** En Academia, completar todas las frases de un tipo antes de volver al menú

## Métricas Actuales

### Ejercicios Implementados
| Tipo | Estado | Cantidad en Lección |
|------|--------|---------------------|
| Cloze | ✅ | 8 frases |
| Shadowing | ✅ | 8 frases |
| Variations | ✅ | 8 frases |
| Pragma Strike | ✅ | 3 ejercicios |
| Shard Detection | ✅ | 4 ejercicios |
| Echo Stream | ✅ | 2 ejercicios |
| Glyph Weaving | ✅ | 1 ejercicio |
| Resonance Path | ✅ | 3 ejercicios |
| **Total** | | **37 ejercicios** |

### Librerías Integradas
- ✅ react-countup
- ✅ @tsparticles/react + @tsparticles/engine
- ✅ reactflow
- ✅ recharts
- ✅ use-undo

### Mejoras UX Implementadas
- ✅ Feedback háptico
- ✅ Traducciones opcionales
- ✅ Menú de ejercicios mejorado
- ✅ Navegación optimizada
- ✅ Atajos de teclado
- ✅ Recompensas variables
- ✅ Efectos de partículas

## Bloqueadores Actuales

Ninguno. El sistema está funcional y listo para expandir contenido.

## Notas de Desarrollo

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm run test
npm run test:watch
npm run test:coverage
```

### Estructura de Lecciones
```
content/
└── {language}/
    └── {level}/
        └── lessons/
            └── leaf-{id}-{name}.json
```

### Estructura de Ejercicios Core
Cada ejercicio tiene su propio componente en `src/components/exercises/`:
- `ShardDetectionExercise.tsx`
- `PragmaStrikeExercise.tsx`
- `EchoStreamExercise.tsx`
- `GlyphWeavingExercise.tsx`
- `ResonancePathExercise.tsx`
