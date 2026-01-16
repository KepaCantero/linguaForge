# System Patterns — Arquitectura y Patrones del Sistema

> Última actualización: 2026-01-14 (Code Quality Improvements)

## Arquitectura General

### Stack Tecnológico
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript (strict mode)
- **Estilos:** Tailwind CSS 3+
- **Estado Global:** Zustand 4+ con persistencia
- **Animaciones:** Framer Motion 10+
- **Validación:** Zod schemas
- **Audio:** Web Audio API + Howler.js (legacy)

### Estructura de Directorios

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Rutas de autenticación
│   ├── learn/             # Sistema de aprendizaje principal
│   │   ├── imported/      # Contenido importado por usuario
│   │   └── [nodeId]/      # Nodos dinámicos
│   ├── input/             # Sistema INPUT (video/audio/texto)
│   │   ├── video/         # Reproductor de video YouTube
│   │   ├── audio/         # Reproductor de audio
│   │   └── text/           # Lector de texto
│   ├── decks/             # Sistema SRS (Spaced Repetition)
│   │   └── review/        # Sesiones de repaso
│   ├── profile/           # Perfil de usuario
│   └── api/               # API routes
│       ├── youtube/       # Integración YouTube Transcript API
│       └── translate/    # Servicio de traducción
├── components/            # Componentes React
│   ├── exercises/        # Ejercicios de aprendizaje
│   ├── transcript/       # Componentes de transcripción
│   ├── layout/           # Componentes de layout
│   └── shared/           # Componentes compartidos
├── store/                # Zustand stores
│   ├── useSRSStore.ts    # Sistema SRS (SM-2)
│   ├── useInputStore.ts  # Métricas de input (Krashen)
│   ├── useImportedNodesStore.ts  # Contenido importado
│   ├── useWordDictionaryStore.ts # Diccionario de palabras estudiadas
│   └── useUserStore.ts   # Configuración de usuario
├── services/             # Servicios y lógica de negocio
│   ├── generateExercisesFromPhrases.ts  # Generación de ejercicios
│   ├── wordExtractor.ts  # Extracción de palabras clave
│   ├── translationService.ts  # Traducción automática
│   └── conjugationService.ts  # Conjugación francesa
├── schemas/              # Schemas Zod
│   └── content.ts        # Schemas de contenido
├── types/                # TypeScript types
│   ├── srs.ts           # Tipos SRS
│   └── wordDictionary.ts # Tipos de diccionario
└── lib/                  # Utilidades
    └── sm2.ts            # Algoritmo SuperMemo 2
```

## Patrones de Diseño

### 1. Store Pattern (Zustand)

**Patrón:** Estado global centralizado con persistencia

**Ejemplo:**
```typescript
export const useSRSStore = create<SRSStore>()(
  persist(
    (set, get) => ({
      cards: [],
      addCard: (input) => { /* ... */ },
      reviewCard: (cardId, response) => { /* ... */ },
    }),
    { name: 'srs-storage' }
  )
);
```

**Uso:**
- `useSRSStore` - Sistema de repaso espaciado
- `useInputStore` - Métricas de input comprensible
- `useImportedNodesStore` - Contenido importado por usuario
- `useWordDictionaryStore` - Palabras estudiadas
- `useUserStore` - Configuración de usuario (modo guiado/autónomo)

### 2. Service Pattern

**Patrón:** Lógica de negocio separada en servicios

**Ejemplos:**
- `generateExercisesFromPhrases.ts` - Genera ejercicios desde frases
- `wordExtractor.ts` - Extrae palabras clave (verbos, sustantivos, etc.)
- `translationService.ts` - Traducción automática
- `conjugationService.ts` - Conjugación de verbos franceses

**Características:**
- Funciones puras cuando es posible
- Sin dependencias de React
- Fáciles de testear

### 3. Custom Hooks Pattern (Domain-Specific Logic Extraction)

**Patrón:** Extraer lógica de componentes en hooks personalizados con patrón `[data, actions]`

**Ejemplo:** `usePhraseSelectionPanel` (21 hooks → 2 hooks, 90% reducción)

```typescript
// src/components/transcript/hooks/usePhraseSelectionPanel.ts
export interface PhraseSelectionPanelData {
  translations: Record<string, string>;
  isCreating: boolean;
  isTranslating: boolean;
  showWordExtraction: boolean;
  newWords: ExtractedWord[];
  wordsByType: Record<string, ExtractedWord[]>;
  canCreateCards: boolean;
  totalStudiedWords: number;
  newWordsCount: number;
  extractedWordsCount: number;
}

export interface PhraseSelectionPanelActions {
  setShowWordExtraction: (show: boolean) => void;
  handleCreateCards: () => Promise<void>;
}

export function usePhraseSelectionPanel(
  selectedPhrases: SelectedPhrase[],
  source: ContentSource,
  onPhrasesAdded?: (count: number) => void
): [PhraseSelectionPanelData, PhraseSelectionPanelActions] {
  // State hooks
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showWordExtraction, setShowWordExtraction] = useState(true);

  // Memoized values
  const extractedWords = useMemo(() => {
    const phrases = selectedPhrases.map(p => p.text);
    return extractKeywordsFromPhrases(phrases);
  }, [selectedPhrases]);

  // Actions
  const handleCreateCards = useCallback(async () => {
    // Implementation...
  }, [newWords, createCardData, addCards, addXP, addWord, onPhrasesAdded]);

  // Return [data, actions] tuple
  const data: PhraseSelectionPanelData = {
    translations,
    isCreating,
    isTranslating,
    showWordExtraction,
    extractedWords,
    newWords,
    wordsByType,
    canCreateCards,
    totalStudiedWords,
    newWordsCount: newWords.length,
    extractedWordsCount: extractedWords.length,
  };

  const actions: PhraseSelectionPanelActions = {
    setShowWordExtraction,
    handleCreateCards,
  };

  return [data, actions];
}
```

**Uso en Componente:**
```typescript
// src/components/transcript/PhraseSelectionPanel.tsx
export function PhraseSelectionPanel({
  selectedPhrases,
  source,
  onClose,
  onPhrasesAdded,
}: PhraseSelectionPanelProps) {
  const [data, actions] = usePhraseSelectionPanel({
    selectedPhrases,
    source,
    onPhrasesAdded,
  });

  const {
    translations,
    isCreating,
    isTranslating,
    showWordExtraction,
    newWords,
    wordsByType,
    canCreateCards,
    totalStudiedWords,
    newWordsCount,
    extractedWordsCount,
  } = data;

  const { setShowWordExtraction, handleCreateCards } = actions;

  // Component JSX...
}
```

**Hooks Implementados:**
- `useJanusComposer` - Lógica de composición Janus (27 hooks → 5 hooks)
- `usePhraseSelectionPanel` - Lógica de selección de frases (21 hooks → 2 hooks)
- `useMissionFeed` - Lógica de feed de misiones (22 hooks → 1 hook)

**Características:**
- Retorna tupla `[data, actions]` para separar datos de acciones
- Interfaces TypeScript explícitas para data y actions
- Usa `useMemo` para valores computados
- Usa `useCallback` para handlers de eventos
- Separa concerns de lógica de negocio de UI

### 4. Factory Functions Pattern (Zustand Stores)

**Patrón:** Organizar acciones de stores Zustand con funciones factory

**Ejemplo:** `useCognitiveLoadStore` refactorizado

```typescript
// src/store/useCognitiveLoadStore.ts
const createLoadActions = (
  set: (partial: Partial<CognitiveLoadStore>) => void,
  get: () => CognitiveLoadStore
) => ({
  updateIntrinsicLoad: (value: number, reason?: string) => {
    set({ intrinsicLoad: clamp(value, 0, 100) });
  },
  updateExtraneousLoad: (value: number, reason?: string) => {
    set({ extraneousLoad: clamp(value, 0, 100) });
  },
  updateGermaneLoad: (value: number, reason?: string) => {
    set({ germaneLoad: clamp(value, 0, 100) });
  },
});

const createFocusActions = (
  set: (partial: Partial<CognitiveLoadStore>) => void,
  get: () => CognitiveLoadStore
) => ({
  setFocusTarget: (target: FocusTarget) => {
    set({ currentFocusTarget: target });
  },
  updateFocusQuality: (quality: number) => {
    set({ focusQuality: clamp(quality, 0, 1) });
  },
});

export const useCognitiveLoadStore = create<CognitiveLoadStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...createLoadActions(set, get),
      ...createFocusActions(set, get),
      ...createSessionActions(set, get),
      ...createHelperActions(set, get),
    }),
    { name: 'cognitive-load-storage' }
  )
);
```

**Características:**
- Agrupa acciones relacionadas en funciones factory
- Reduce complejidad de funciones largas
- Mejora mantenibilidad y legibilidad
- Mantiene compatibilidad con Zustand persist

### 5. Repository Pattern (BaseRepository)

**Patrón:** Abstracción sobre Supabase con tipos TypeScript estrictos

**Ejemplo:** `baseRepository.ts` con `unknown` en lugar de `any`

```typescript
// src/services/repository/baseRepository.ts
export class BaseRepository<T> {
  private applyFilters(builder: unknown, where?: string | null): unknown {
    if (!where) return builder;

    const parts = where.split(' ').filter(Boolean);
    parts.forEach((part, i) => {
      const column = i % 2 === 0 ? part : null;
      // Safe type assertion where needed
      return (builder as { filter: (c: string, op: string, v: unknown) => unknown })
        .filter(column, 'eq', value);
    });

    return builder;
  }

  async findOne(
    where?: string | null,
    orderBy?: OrderByOptions
  ): Promise<T | null> {
    // Implementation...
  }
}
```

**Características:**
- Usa `unknown` en lugar de `any` con type assertions seguros
- Valida datos con Zod schemas antes de retornar
- Manejo de errores consistente
- Sin dependencias de React

### 6. AAA Accessibility Pattern

**Patrón:** Accesibilidad WCAG AAA integrada en componentes

**Componentes:**

#### A. Reduced Motion Hook (`src/hooks/useReducedMotion.ts`)

```typescript
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

export function useAnimationConfig() {
  const prefersReducedMotion = useReducedMotion();

  return {
    shouldAnimate: !prefersReducedMotion,
    prefersReducedMotion,
    transition: prefersReducedMotion
      ? { duration: 0.01 }
      : { type: 'spring', stiffness: 150, damping: 20 },
  };
}
```

**Uso:**
```typescript
const { shouldAnimate, transition } = useAnimationConfig();

<motion.div
  animate={shouldAnimate ? { scale: 1.05 } : {}}
  transition={transition}
>
```

#### B. Animation Budget Hook (`src/hooks/useAnimationBudget.ts`)

```typescript
export function useAnimationBudget() {
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const measureFPS = () => {
      const currentFps = Math.round(/* calculate FPS */);
      setFps(currentFps);

      // Disable animations if FPS drops below 30
      if (currentFps < 30 && shouldAnimate) {
        setShouldAnimate(false);
      } else if (currentFps > 50 && !shouldAnimate) {
        setShouldAnimate(true);
      }
    };

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, [shouldAnimate]);

  return { shouldAnimate, fps };
}

export function useAnimationControl() {
  const { shouldAnimate: canAnimateByPerf, fps } = useAnimationBudget();
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
  }, []);

  return {
    shouldAnimate: canAnimateByPerf && !prefersReduced,
    fps,
    prefersReduced,
  };
}
```

**Uso:**
```typescript
const { shouldAnimate, fps, prefersReduced } = useAnimationControl();

<motion.div
  style={{ willChange: shouldAnimate ? 'transform, opacity' : 'auto' }}
  animate={shouldAnimate ? { scale: 1.1 } : {}}
>
```

#### C. AAA Input Component Pattern

**Patrón:** Componentes interactivos con todas las características AAA

```typescript
export function AAAInputButton({ option, index }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const animationConfig = {
    type: shouldAnimate ? 'spring' : undefined,
    stiffness: shouldAnimate ? 150 : undefined,
    damping: shouldAnimate ? 20 : undefined,
  };

  return (
    <Link
      href={option.href}
      className="block"
      style={{
        // Touch target mínimo 44px
        width: 'max(128px, 44px)',
        height: 'max(128px, 44px)',
      }}
      aria-label={`${option.title}: ${option.description}. ${option.stats.map(s => `${s.label}: ${s.value}`).join(', ')}`}
    >
      <motion.div
        className="rounded-full"
        style={{
          background: option.gradient,
          willChange: shouldAnimate ? 'transform' : 'auto',
        }}
        animate={shouldAnimate ? { y: [0, -8, 0] } : {}}
        transition={{ duration: 3 + index * 0.5, repeat: shouldAnimate ? Infinity : 0 }}
        whileHover={{ scale: 1.15 }}
      >
        <div
          className="text-5xl"
          style={{
            // Text shadow para WCAG AAA contrast
            textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.4)',
          }}
        >
          {option.icon}
        </div>
      </motion.div>

      <div
        role="tooltip"
        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 px-4 py-2 rounded-xl bg-lf-dark/90 backdrop-blur-md"
      >
        <p className="text-sm font-semibold text-white">
          {option.title}
        </p>
      </div>
    </Link>
  );
}
```

**Características AAA incluidas:**
1. ✅ Reduced motion detection
2. ✅ 44px minimum touch targets
3. ✅ ARIA labels descriptivos
4. ✅ Text shadows para contraste
5. ✅ will-change optimization
6. ✅ Animaciones condicionales
7. ✅ Focus rings (via className)
8. ✅ Semantic HTML (role="tooltip")

#### D. Error Boundary Pattern

**Patrón:** ErrorBoundary con UI fallback AAA

```typescript
export class AAAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AAA Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center min-h-screen bg-lf-dark"
        >
          <div className="text-center p-8 max-w-md">
            <motion.div
              className="relative w-32 h-32 mx-auto mb-6 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #EF4444, #DC2626)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                ⚠️
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-3">
              Algo salió mal
            </h2>
            <p className="text-lf-muted mb-2">
              La animación se ha detenido para proteger tu experiencia
            </p>

            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-aaa-xl font-bold text-white"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
              }}
            >
              Recargar
            </motion.button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
```

**Características:**
- ✅ UI fallback con diseño AAA
- ✅ Animación de pulso en error
- ✅ Mensaje claro al usuario
- ✅ Botón de recarga accesible
- ✅ Logging de errores

#### E. Infinite Scroll Pattern

**Patrón:** Listas infinitas con virtualización

```typescript
export function InfiniteCourseMap({ translations, userProgress }: Props) {
  const [visibleNodes, setVisibleNodes] = useState(50); // Load in batches
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allNodes = useMemo(() => generateTopicNodes(), []);

  // Filter nodes based on search and filters
  const filteredNodes = useMemo(() => {
    return allNodes.filter(node => {
      const matchesSearch = searchQuery === '' ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || node.category === selectedCategory;
      const matchesLevel = !selectedLevel || node.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allNodes, searchQuery, selectedCategory, selectedLevel]);

  // Load more nodes on scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8 && visibleNodes < filteredNodes.length) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleNodes(prev => Math.min(prev + 20, filteredNodes.length));
        setIsLoading(false);
      }, 500);
    }
  }, [filteredNodes.length, visibleNodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const displayedNodes = filteredNodes.slice(0, visibleNodes);

  return (
    <div ref={containerRef} className="max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayedNodes.map((node, index) => (
          <TopicOrb key={node.id} node={node} index={index} />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <motion.div
            className="w-12 h-12 rounded-full border-4 border-lf-accent border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
}
```

**Características:**
- ✅ Lazy loading (50 nodos iniciales, +20 por scroll)
- ✅ Búsqueda en tiempo real
- ✅ Filtrado por categoría y nivel
- ✅ Loading indicator animado
- ✅ Grid responsivo
- ✅ Performance optimizada

### 4. AAA Text Shadow Pattern

**Patrón:** Sombras de texto para WCAG AAA contrast en fondos gradientes

```typescript
const TEXT_SHADOW_STRONG = '0 2px 8px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.4)';
const TEXT_SHADOW_MEDIUM = '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)';
const TEXT_SHADOW_SUBTLE = '0 1px 2px rgba(0,0,0,0.8)';

// Uso en componentes
<div style={{ textShadow: TEXT_SHADOW_STRONG }}>
  Texto sobre gradientes oscuros
</div>
```

### 5. AAA Focus Ring Pattern

**Patrón:** Anillos de foco visibles para navegación por teclado

```typescript
// Tailwind classes
className="focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-lf-dark"

// En JSX
<Link
  href="/learn"
  className="focus:outline-none focus:ring-4 focus:ring-inset focus:ring-lf-accent"
>
  Mapa de Aprendizaje
</Link>
```

### 6. ARIA Label Pattern

**Patrón:** Labels descriptivos para screen readers

```typescript
// Botones con iconos
<button
  aria-label="Reproducir audio"
  aria-pressed={isPlaying}
>
  ▶️
</button>

// Enlaces complejos
<Link
  href="/input/video"
  aria-label={`${option.title}: ${option.description}. ${option.stats.map(s => `${s.label}: ${s.value}`).join(', ')}`}
>
  Video
</Link>

// Tooltips
<div role="tooltip" aria-hidden="true">
  {tooltipContent}
</div>

// Skip link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]"
>
  Saltar al contenido principal
</a>
```

### 7. willChange Optimization Pattern

**Patrón:** Optimización GPU para animaciones

```typescript
const prefersReducedMotion = useReducedMotion();
const shouldAnimate = !prefersReducedMotion;

<motion.div
  style={{
    willChange: shouldAnimate ? 'transform, opacity' : 'auto',
  }}
  animate={shouldAnimate ? { scale: 1.1, rotate: 90 } : {}}
>
  ✨
</motion.div>
```

**Reglas:**
- Solo usar willChange cuando realmente hay animación
- Resetear a 'auto' cuando no hay animación (reduced motion)
- Limitar propiedades: transform, opacity principalmente

### 8. Schema-First Pattern (Zod)

**Patrón:** Validación y tipos desde schemas Zod

**Ejemplo:**
```typescript
export const SRSCardSchema = z.object({
  id: z.string(),
  phrase: z.string(),
  translation: z.string(),
  // ...
});

export type SRSCard = z.infer<typeof SRSCardSchema>;
```

**Beneficios:**
- Validación en runtime
- Tipos TypeScript generados
- Validación de datos de API

### 4. Dynamic Route Pattern (Next.js)

**Patrón:** Rutas dinámicas para contenido variable

**Ejemplos:**
- `/learn/imported/[nodeId]` - Nodos importados
- `/learn/imported/[nodeId]/exercises` - Ejercicios de un nodo
- `/decks/review?sourceType=video&sourceId=xyz` - Repaso filtrado

### 5. Component Composition Pattern

**Patrón:** Componentes pequeños y composables

**Ejemplo:**
```typescript
<WordSelector
  transcript={transcript}
  phrases={phrases}
  source={source}
  onWordsAdded={handleWordsAdded}
/>
```

**Características:**
- Props bien definidas
- Responsabilidad única
- Reutilizables

## Flujos Principales

### 1. Flujo de Input (Video/Audio/Texto)

```
Usuario carga contenido
  ↓
Sistema extrae transcripción (si aplica)
  ↓
Usuario selecciona palabras/frases
  ↓
Sistema extrae palabras clave
  ↓
Sistema traduce automáticamente
  ↓
Usuario crea cards SRS
  ↓
Cards agregadas a useSRSStore
```

### 2. Flujo de Ejercicios (Contenido Importado)

```
Usuario selecciona subtopic
  ↓
Sistema genera ejercicios desde frases
  ↓
Usuario elige tipo de ejercicio
  ↓
Sistema renderiza ejercicio específico
  ↓
Usuario completa ejercicio
  ↓
Sistema actualiza progreso
```

### 3. Flujo de Repaso SRS

```
Usuario inicia sesión de repaso
  ↓
Sistema obtiene cards due/new
  ↓
Sistema genera ejercicios (Cloze/Detection)
  ↓
Usuario responde (again/hard/good/easy)
  ↓
Sistema actualiza algoritmo SM-2
  ↓
Sistema marca card como revisada
```

## Convenciones de Código

### Nombres de Archivos
- **Componentes:** PascalCase (`WordSelector.tsx`)
- **Stores:** camelCase con `use` prefix (`useSRSStore.ts`)
- **Services:** camelCase (`wordExtractor.ts`)
- **Types:** camelCase (`srs.ts`)

### Estructura de Componentes
```typescript
'use client'; // Si es necesario

import { ... } from '...';

// Types
interface ComponentProps {
  // ...
}

// Component
export function Component({ ... }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return (...);
}
```

### Manejo de Estado
- **Estado local:** `useState` / `useReducer`
- **Estado global:** Zustand stores
- **Estado de servidor:** Next.js Server Components cuando es posible

### Manejo de Errores
- Try-catch en funciones async
- Validación con Zod schemas
- Mensajes de error user-friendly

## Integraciones Externas

### YouTube Transcript API
- **Servicio:** `youtube-transcript.io`
- **Ruta API:** `/api/youtube/transcript`
- **Uso:** Extracción automática de transcripciones

### Traducción
- **Primario:** Google Translate API (si está configurado)
- **Fallback:** MyMemory Translation API
- **Ruta API:** `/api/translate`

## Principios SOLID Aplicados

1. **Single Responsibility:** Cada componente/service tiene una responsabilidad
2. **Open/Closed:** Extensible mediante nuevos tipos de ejercicios
3. **Liskov Substitution:** Interfaces consistentes para ejercicios
4. **Interface Segregation:** Props específicas por componente
5. **Dependency Inversion:** Dependencias inyectadas, no hardcoded

## Estructura de Archivos

### Arquitectura de Directorios
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Rutas de autenticación
│   ├── learn/             # Sistema de aprendizaje principal
│   ├── input/             # Sistema INPUT (video/audio/texto)
│   ├── decks/             # Sistema SRS
│   ├── profile/           # Perfil de usuario
│   └── api/               # API routes
├── components/            # Componentes React
│   ├── exercises/        # Ejercicios de aprendizaje
│   ├── transcript/       # Componentes de transcripción
│   ├── layout/           # Componentes de layout
│   └── shared/           # Componentes compartidos
├── store/                # Zustand stores
├── services/             # Servicios y lógica de negocio
├── schemas/              # Schemas Zod
├── types/                # TypeScript types
└── lib/                  # Utilidades
```

### Convenciones de Naming
- **Componentes:** PascalCase (`WordSelector.tsx`)
- **Stores:** camelCase con `use` prefix (`useSRSStore.ts`)
- **Services:** camelCase (`wordExtractor.ts`)
- **Types:** camelCase (`srs.ts`)

## Decisiones Técnicas Clave

### Stack (FIJAS)
- **Framework:** Next.js 14 (App Router)
- **Estado:** Zustand (simplicidad, persistencia fácil)
- **Animaciones:** Framer Motion (API declarativa)
- **Validación:** Zod (runtime + tipos)
- **Backend:** Supabase (Auth + DB + Storage)

### Arquitectura
- **Estructura de Contenido:** Nodo → Subtopic → Phrases
- **Componentes:** Responsabilidad única, composables
- **Servicios:** Funciones puras cuando es posible
- **Schemas:** Validación y tipos desde Zod

## Notas de Arquitectura

### SSR Compatibility
- Todos los componentes con animaciones deben ser compatibles con SSR
- Usar `'use client'` solo cuando sea necesario
- Detectar montaje del cliente para animaciones

### Performance
- Lazy loading de ejercicios cuando sea posible
- Memoización con `useMemo` y `useCallback`
- Persistencia selectiva en Zustand stores

### Extensibilidad
- Nuevos tipos de ejercicios: agregar a `generateExercisesFromPhrases.ts`
- Nuevos tipos de input: extender `useInputStore`
- Nuevos algoritmos SRS: extender `lib/sm2.ts`

