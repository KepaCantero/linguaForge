# Tech Context — Contexto Técnico

> Última actualización: 2026-01-14 (Code Quality Improvements)

## Stack Tecnológico

### Frontend Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.2.35 | Framework React con App Router |
| React | 18.x | Biblioteca UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.4.1 | Estilos utility-first |

### Estado y Datos

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Zustand | 5.0.9 | Estado global con persistencia |
| Zod | 4.2.1 | Validación y schemas |

### UI y Animaciones

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Framer Motion | 12.23.26 | Animaciones y transiciones |
| react-countup | 6.5.3 | Animaciones de números |
| @tsparticles/react | 3.0.0 | Efectos de partículas |
| useReducedMotion (custom) | 1.0 | Detección de prefers-reduced-motion |
| useAnimationBudget (custom) | 1.0 | Monitoreo de FPS y degradación automática |

### Componentes AAA UI

| Componente | Ruta | Propósito |
|------------|------|-----------|
| AAAErrorBoundary | `src/components/ui/ErrorBoundary.tsx` | Error boundary con UI fallback AAA |
| AAAAnimatedBackground | `src/components/ui/AAAAnimatedBackground.tsx` | Fondo animado con 4 variantes |
| XPSurgeEffect | `src/components/ui/XPSurgeEffect.tsx` | Efecto visual de ganancia de XP |
| GamificationFeedback | `src/components/ui/GamificationFeedback.tsx` | Feedback visual de logros |
| InfiniteCourseMap | `src/components/learn/InfiniteCourseMap.tsx` | Mapa infinito con 600+ temas |

### Audio y Video

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Howler.js | 2.2.4 | Reproducción de audio (legacy) |
| Web Audio API | Native | Análisis de audio en tiempo real |
| YouTube IFrame API | Native | Reproductor de video YouTube |

### Utilidades

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Fuse.js | 7.1.0 | Búsqueda difusa |
| reactflow | 11.11.4 | Visualización de grafos |
| recharts | 3.6.0 | Gráficos y visualizaciones |
| use-undo | 1.1.1 | Funcionalidad deshacer/rehacer |

## Configuración del Proyecto

### Next.js Config

```javascript
// next.config.mjs
- App Router habilitado
- Image optimization configurada
- Remote patterns para imágenes externas
```

### TypeScript Config

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

### Tailwind Config

- Modo oscuro habilitado
- Colores personalizados definidos
- Breakpoints estándar

## Estructura de Stores (Zustand)

### useSRSStore
- **Persistencia:** `srs-storage`
- **Datos:** Cards SRS, estadísticas de repaso
- **Algoritmo:** SuperMemo 2 (SM-2)

### useInputStore
- **Persistencia:** `input-storage`
- **Datos:** Métricas de input (Krashen)
- **Métricas:** wordsRead, wordsHeard, wordsSpoken, minutesListened, minutesRead

### useImportedNodesStore
- **Persistencia:** `imported-nodes-storage`
- **Datos:** Nodos de contenido importado por usuario
- **Estructura:** Nodos → Subtopics → Phrases

### useWordDictionaryStore
- **Persistencia:** `word-dictionary-storage`
- **Datos:** Palabras estudiadas con sus tipos y SRS card IDs
- **Propósito:** Evitar duplicados en extracción de palabras

### useUserStore
- **Persistencia:** `user-storage`
- **Datos:** Configuración de usuario (idioma, modo de aprendizaje)

### useNodeProgressStore
- **Persistencia:** `node-progress-storage`
- **Datos:** Progreso de nodos del modo guiado
- **Estructura:** NodeProgress con completedLessons, currentLessonIndex, completedExercises, totalExercises

### useMissionStore
- **Persistencia:** `mission-storage`
- **Datos:** Misiones diarias y su progreso
- **Sistema:** Generación, tracking, recompensas

### useCognitiveLoadStore
- **Persistencia:** `cognitive-load-storage`
- **Datos:** Métricas de carga cognitiva (CLT)
- **Modos:** 4 niveles de Focus Mode

### useGamificationStore
- **Persistencia:** `gamification-storage`
- **Datos:** XP, coins, gems, streak, nivel
- **Sistema:** Progresión, recompensas, logros

### useConstructionStore
- **Persistencia:** `construction-storage`
- **Datos:** Sistema de construcción 3D
- **Elementos:** 15 materiales, 14 elementos constructivos, 57 hitos
- **Modos:** 'guided' | 'autonomous'

## Custom Hooks (Domain-Specific Logic)

### useJanusComposer (2026-01-14)
- **Ubicación:** `src/components/exercises/hooks/useJanusComposer.ts`
- **Propósito:** Lógica de composición Janus (constructor de frases)
- **Reducción:** 27 hooks → 5 hooks (81% reducción)
- **Retorna:** `{ selections, orderedColumns, generatedPhrase, generatedTranslation, allRequiredSelected, currentDialogueIndex, phrasesCreated, dialoguesCompleted, handlers }`

### usePhraseSelectionPanel (2026-01-14)
- **Ubicación:** `src/components/transcript/hooks/usePhraseSelectionPanel.ts`
- **Propósito:** Lógica de selección de frases y extracción de palabras
- **Reducción:** 21 hooks → 2 hooks (90% reducción)
- **Patrón:** `[data, actions]` tuple
- **Retorna:**
  - `data`: `{ translations, isCreating, isTranslating, showWordExtraction, newWords, wordsByType, canCreateCards, totalStudiedWords, counts }`
  - `actions`: `{ setShowWordExtraction, handleCreateCards }`

### useMissionFeed (2026-01-14)
- **Ubicación:** `src/components/missions/hooks/useMissionFeed.ts`
- **Propósito:** Lógica de feed de misiones diarias
- **Reducción:** 22 hooks → 1 hook (95% reducción)
- **Retorna:** `{ state, computedValues, handlers, utilityFunctions }`

### Shared Exercise Hooks
- **Ubicación:** `src/components/exercises/hooks/`
- **Hooks:**
  - `useExerciseState` - Estado de ejercicios
  - `useExercisePhase` - Fases de ejercicios
  - `useExerciseTimer` - Temporizadores
  - `useExerciseGamification` - XP y recompensas
  - `useExerciseAudio` - Audio y TTS
  - `useExerciseUI` - Estados UI
  - `useKeyboardShortcuts` - Atajos de teclado

## Servicios Principales

### generateExercisesFromPhrases.ts
Genera ejercicios desde arrays de frases:
- Cloze exercises
- Variations exercises
- ConversationalEcho exercises
- DialogueIntonation exercises
- JanusComposer exercises

### wordExtractor.ts
Extrae palabras clave de texto:
- Identifica verbos, sustantivos, adverbios, adjetivos
- Normaliza palabras (minúsculas, sin acentos)
- Filtra palabras comunes
- Retorna palabras únicas con contexto

### translationService.ts
Traducción automática:
- Google Translate API (si está configurado)
- Fallback a MyMemory Translation API
- Cache de traducciones (futuro)

### conjugationService.ts
Conjugación de verbos franceses:
- Base de datos de verbos A1/A2
- Conjugación automática para presente, passé composé, futur proche, imparfait
- Soporte para verbos regulares e irregulares

## API Routes

### /api/youtube/transcript
- **Método:** GET
- **Parámetros:** `videoId` (query)
- **Servicio:** youtube-transcript.io API
- **Fallback:** Scraping manual (si API falla)

### /api/translate
- **Método:** POST
- **Body:** `{ text, targetLang, sourceLang }`
- **Servicio:** Google Translate API o MyMemory

## Algoritmos Implementados

### SuperMemo 2 (SM-2)
- **Ubicación:** `src/lib/sm2.ts`
- **Uso:** Sistema de repaso espaciado
- **Parámetros:**
  - Initial ease factor: 2.5
  - Minimum ease factor: 1.3
  - Maximum interval: 365 días

### Extracción de Palabras Clave
- **Ubicación:** `src/services/wordExtractor.ts`
- **Heurísticas:**
  - Verbos: terminaciones comunes (-er, -ir, -re, conjugaciones)
  - Sustantivos: palabras después de artículos
  - Adverbios: terminaciones (-ment)
  - Adjetivos: posición y terminaciones

## Variables de Entorno

```bash
# YouTube Transcript API
YOUTUBE_TRANSCRIPT_API_TOKEN=...

# Google Translate API (opcional)
GOOGLE_TRANSLATE_API_KEY=...

# Next.js
NEXT_PUBLIC_APP_URL=...
```

## Dependencias de Desarrollo

```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "eslint": "^8",
  "eslint-config-next": "14.2.35"
}
```

## Limitaciones Conocidas

1. **Audio:** Howler.js usado en algunos componentes legacy, migrando a Web Audio API
2. **Traducción:** Sin cache implementado aún
3. **Offline:** PWA no completamente implementada
4. **Backend:** Sin Supabase integrado aún (persistencia solo local)

## Próximas Integraciones

1. **Supabase Auth:** Autenticación con magic links
2. **Supabase Postgres:** Persistencia en la nube
3. **Supabase Storage:** Almacenamiento de audio/video
4. **Service Worker:** PWA completa con offline support

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Linting
npm run lint

# Type checking
npm run type-check
```

## Schemas Principales

### Schemas de Contenido (`src/schemas/content.ts`)
- `LessonContentSchema` - Contenido de lecciones
- `PhraseSchema` - Frases con ejercicios
- `JanusComposerSchema` - Matrices Janus
- `ConversationalEchoSchema` - Ejercicios conversacionales
- `DialogueIntonationSchema` - Ejercicios de entonación
- `SRSCardSchema` - Cards de repaso espaciado
- `WarmupSchema` - Calentamientos cognitivos

### Schemas de Estado
- Stores de Zustand con persistencia
- Validación con Zod en runtime
- Tipos TypeScript generados desde schemas

**Ver código fuente en `src/schemas/` para detalles completos.**

## Notas de Desarrollo

### SSR Compatibility
- Todos los componentes con animaciones deben detectar montaje del cliente
- Usar `useEffect` para inicializar animaciones
- Renderizar valores estáticos en servidor

### Performance
- Lazy loading de ejercicios cuando sea posible
- Memoización de cálculos costosos
- Persistencia selectiva en stores

### Testing
- Tests unitarios para servicios
- Tests de integración para flujos principales
- Tests E2E para flujos de usuario críticos

