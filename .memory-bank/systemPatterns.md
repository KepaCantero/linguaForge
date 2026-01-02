# System Patterns — Arquitectura y Patrones del Sistema

> Última actualización: 2025-01-XX

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

### 3. Schema-First Pattern (Zod)

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

