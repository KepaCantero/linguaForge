# Plan de Arquitectura Limpia - LinguaForge v2.0

## Alcance Actual vs Futuro

```
AHORA (MVP)                      FUTURO
─────────────────────────────────────────────────
Idioma:   Solo Francés      →   +Alemán, +Italiano...
Nivel:    Solo A0           →   +A1, +A2, +B1...
Modos:    Guiado + Autónomo →   Sin cambios
```

La arquitectura debe soportar expansión sin refactor.

---

## Diagnóstico: Estado Actual

### Deuda Técnica Crítica
```
├── Componentes duplicados (SpeechRecorder x2, RhythmVisualizer x2)
├── Código muerto (RadialTree, MatrixTree, 3 árboles sin usar)
├── 2 stores de progreso confusos (useProgressStore vs useTreeProgressStore)
├── 1 de 33 lecciones implementada
├── Contenido en 2 ubicaciones (content/ y public/content/)
├── Schemas con campos deprecated no eliminados
└── useGamificationStore con 210 líneas mezclando 5 concerns
```

### Lo Que Se Elimina
- `/world/*` rutas (escenarios Janus antiguos)
- `/input/*` rutas (sistema Krashen separado)
- RadialTree, MatrixTree, HierarchicalTree (todos)
- Mapa visual actual (tree/)
- Topic trees duplicados
- Ejercicios deprecated (ShardDetection, EchoStream, GlyphWeaving, ResonancePath)

### Lo Que Se Mantiene
- Stack: Next.js 14, Zustand, Supabase, Zod, Tailwind, Framer Motion
- Ejercicios core: Cloze, Variations, ConversationalEcho, DialogueIntonation, JanusComposer
- Sistema de gamificación (simplificado)
- Schemas base de contenido

---

## Nueva Arquitectura Propuesta

### Estructura de Carpetas Final

```
src/
├── app/
│   ├── page.tsx                    # Landing
│   ├── layout.tsx                  # Layout global + i18n provider
│   ├── providers.tsx               # Providers (Supabase, Theme, i18n)
│   │
│   ├── onboarding/                 # NUEVO: Flujo inicial
│   │   └── page.tsx                # Idioma app → Modo
│   │
│   ├── learn/                      # NUEVO: Hub principal
│   │   ├── page.tsx                # CourseMap (guiado) o OrganicMap (autónomo)
│   │   ├── node/[nodeId]/page.tsx  # Lección individual
│   │   └── review/page.tsx         # Repaso SRS
│   │
│   ├── import/                     # NUEVO: Solo modo autónomo
│   │   ├── page.tsx                # Selector de fuente
│   │   ├── podcast/page.tsx        # Importar podcast
│   │   ├── article/page.tsx        # Importar artículo
│   │   └── youtube/page.tsx        # Importar YouTube
│   │
│   ├── profile/page.tsx            # Perfil + Configuración (idioma, modo)
│   └── auth/                       # Auth (mantener)
│
├── i18n/                           # NUEVO: Traducciones de la UI
│   ├── es.json                     # Español
│   └── en.json                     # English
│
├── components/
│   ├── exercises/                  # 6 ejercicios finales
│   │   ├── ClozeExercise.tsx
│   │   ├── VariationsExercise.tsx
│   │   ├── ConversationalEchoExercise.tsx
│   │   ├── DialogueIntonationExercise.tsx
│   │   ├── JanusComposerExercise.tsx
│   │   └── VocabularyExercise.tsx
│   │
│   ├── learn/                      # NUEVO: Componentes de aprendizaje
│   │   ├── CourseMap.tsx           # Mapa modo guiado (5 nodos lineales)
│   │   ├── OrganicMap.tsx          # Mapa modo autónomo (force-directed)
│   │   ├── NodeCard.tsx            # Tarjeta de nodo
│   │   ├── LessonPlayer.tsx        # Reproductor de lección
│   │   └── ProgressRing.tsx        # Anillo de progreso
│   │
│   ├── import/                     # NUEVO: Componentes de importación
│   │   ├── PodcastImporter.tsx
│   │   ├── ArticleImporter.tsx
│   │   └── TopicDetector.tsx       # Detector de tópicos
│   │
│   ├── shared/                     # Componentes compartidos
│   │   ├── SpeechRecorder.tsx      # ÚNICO (eliminar duplicado)
│   │   ├── RhythmVisualizer.tsx    # ÚNICO (eliminar duplicado)
│   │   └── AudioPlayer.tsx
│   │
│   ├── ui/                         # UI genérica (mantener)
│   └── layout/                     # Layout (mantener)
│
├── store/
│   ├── useUserStore.ts             # NUEVO: Perfil + modo + idioma
│   ├── useProgressStore.ts         # SIMPLIFICADO: Solo progreso de nodos
│   ├── useGamificationStore.ts     # SIMPLIFICADO: XP + streak + coins
│   ├── useSRSStore.ts              # Mantener
│   └── useImportStore.ts           # NUEVO: Contenido importado
│
├── services/
│   ├── contentService.ts           # UNIFICADO: Cargar todo el contenido
│   ├── topicDetector.ts            # NUEVO: Detectar tópicos de texto
│   ├── nodeGenerator.ts            # NUEVO: Generar nodos dinámicos
│   ├── conjugationService.ts       # Mantener
│   └── ttsService.ts               # Mantener
│
├── lib/
│   ├── supabase/                   # Mantener
│   ├── constants.ts                # Simplificar
│   └── sm2.ts                      # Mantener
│
├── schemas/
│   ├── content.ts                  # LIMPIAR: Solo ejercicios activos
│   ├── user.ts                     # NUEVO: Perfil de usuario
│   └── node.ts                     # NUEVO: Estructura de nodos
│
└── types/
    └── index.ts                    # Tipos unificados
```

---

## Modelo de Datos Simplificado

### Usuario y Perfil

```typescript
// schemas/user.ts
const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),

  // Idioma de la interfaz (traducciones de la app)
  appLanguage: z.enum(['es', 'en']),     // Idioma de la UI

  // Configuración de aprendizaje (extensible para futuro)
  targetLanguage: z.enum(['fr']),        // MVP: solo francés
  // targetLanguage: z.enum(['fr', 'de', 'it']),  // FUTURO

  // Modo de aprendizaje
  mode: z.enum(['guided', 'autonomous']),
  // guided    → Muestra A0 (5 nodos predefinidos) - GRATIS
  // autonomous → NO muestra A0, solo contenido importado

  // Preferencias
  dailyGoal: z.number().default(10), // minutos
  notifications: z.boolean().default(true),

  // Timestamps
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime(),
});
```

### Lógica de Modos

```
┌─────────────────────────────────────────────────────────┐
│  MODO GUIADO (gratis)                                   │
│  ─────────────────────                                  │
│  • Muestra A0 francés (5 nodos predefinidos)           │
│  • Progresión lineal: Nodo 1 → 2 → 3 → 4 → 5           │
│  • Ideal para principiantes absolutos                   │
│  • Sin importación de contenido                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  MODO AUTÓNOMO                                          │
│  ─────────────────                                      │
│  • NO muestra A0 (usuario ya tiene base)               │
│  • Mapa orgánico generado por importaciones            │
│  • Importa podcasts, artículos, YouTube                │
│  • Para usuarios intermedios+                           │
└─────────────────────────────────────────────────────────┘
```

### Estructura de Nodos

```typescript
// schemas/node.ts
const NodeSchema = z.object({
  id: z.string(),

  // Metadatos
  title: z.string(),
  description: z.string(),
  icon: z.string(), // emoji

  // Categorización
  category: z.enum([
    'alojamiento',
    'comida',
    'transporte',
    'salud',
    'emergencias',
    'custom' // Para nodos generados
  ]),

  // Origen
  source: z.enum(['predefined', 'imported']),
  sourceUrl: z.string().url().optional(), // URL del podcast/artículo

  // Contenido
  phrases: z.array(PhraseSchema),
  exercises: z.array(ExerciseSchema),

  // Progreso (calculado, no almacenado aquí)
  estimatedMinutes: z.number(),
});

// 5 nodos predefinidos para modo guiado
const GUIDED_NODES = [
  { id: 'node-1', category: 'alojamiento', title: 'Check-in & Problemas' },
  { id: 'node-2', category: 'comida', title: 'Restaurantes & Cafés' },
  { id: 'node-3', category: 'transporte', title: 'Metro, Taxi, Tren' },
  { id: 'node-4', category: 'salud', title: 'Farmacia & Emergencias' },
  { id: 'node-5', category: 'emergencias', title: 'Ayuda & Recuperación' },
];
```

### Contenido Importado (Modo Autónomo)

```typescript
// schemas/import.ts
const ImportedContentSchema = z.object({
  id: z.string(),
  userId: z.string(),

  // Fuente
  sourceType: z.enum(['podcast', 'article', 'youtube']),
  sourceUrl: z.string().url(),
  sourceTitle: z.string(),

  // Contenido procesado
  rawText: z.string(),
  detectedTopics: z.array(z.string()), // ['alojamiento', 'problemas']
  extractedPhrases: z.array(PhraseSchema),

  // Estado
  status: z.enum(['pending', 'processed', 'error']),
  generatedNodeId: z.string().optional(),

  createdAt: z.string().datetime(),
});
```

---

## Flujos de Usuario

### Flujo 1: Onboarding (Nuevo Usuario)

```
Landing → Registro/Login → Onboarding

Onboarding (MVP):
┌─────────────────────────────────────┐
│  Paso 1: Idioma de la app          │
│                                     │
│  [🇪🇸 Español]  [🇬🇧 English]       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Paso 2: ¿Cómo quieres aprender    │
│          francés?                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📚 Modo Guiado              │   │
│  │ "Empiezo desde cero"         │   │
│  │ "5 situaciones esenciales"   │   │
│  │ [GRATIS]                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🚀 Modo Autónomo            │   │
│  │ "Ya tengo una base"          │   │
│  │ "Quiero aprender de podcasts"│   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              ↓
    Guiado → /learn (CourseMap A0)
    Autónomo → /learn (OrganicMap + /import)
```

**Configuración en Perfil (/profile)**:
- Cambiar idioma de la app (es/en)
- Cambiar modo (guiado ↔ autónomo)
- Próximamente: idioma objetivo (fr, de, it...)

**FUTURO**: Cuando se añadan más idiomas:
```
Paso 1: Idioma de la app (es, en)
Paso 2: ¿Qué idioma quieres aprender? (fr, de, it)
Paso 3: Modo (guiado, autónomo)
```

### Flujo 2: Modo Guiado (Curso)

```
/learn (Modo Guiado)
┌─────────────────────────────────────┐
│  Tu Camino de Aprendizaje          │
│                                     │
│  [1] 🏠 Alojamiento    ████░░ 60%  │
│      └─ "Check-in & Problemas"      │
│                                     │
│  [2] 🍽️ Comida         ░░░░░░ 0%   │
│      └─ Bloqueado                   │
│                                     │
│  [3] 🚇 Transporte     ░░░░░░ 0%   │
│      └─ Bloqueado                   │
│                                     │
│  [4] 🏥 Salud          ░░░░░░ 0%   │
│      └─ Bloqueado                   │
│                                     │
│  [5] 🆘 Emergencias    ░░░░░░ 0%   │
│      └─ Bloqueado                   │
└─────────────────────────────────────┘

Click en nodo → /learn/node/[nodeId]

┌─────────────────────────────────────┐
│  🏠 Alojamiento                     │
│  "Check-in & Problemas"             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Frase 1/8                   │   │
│  │ "Bonjour, j'ai une          │   │
│  │  réservation..."            │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Ejercicio: Cloze]                │
│  [Ejercicio: Echo]                 │
│  [Ejercicio: Variaciones]          │
│                                     │
│  [← Anterior]  [Siguiente →]        │
└─────────────────────────────────────┘
```

### Flujo 3: Modo Autónomo (Premium)

```
/learn (Modo Autónomo)
┌─────────────────────────────────────┐
│  Tu Mapa de Aprendizaje            │
│                                     │
│        [🏠]───────[🍽️]             │
│          \       /                  │
│           [📻]←─┘   ← Importado    │
│          /                          │
│      [🚇]                           │
│                                     │
│  + Importar contenido              │
└─────────────────────────────────────┘

Click "Importar" → /import

┌─────────────────────────────────────┐
│  Importar Contenido                │
│                                     │
│  [🎙️ Podcast]                       │
│  "One Thing In A French Day"        │
│                                     │
│  [📰 Artículo]                      │
│  "Pega una URL o texto"             │
│                                     │
│  [▶️ YouTube]                       │
│  "Video con subtítulos"             │
└─────────────────────────────────────┘

Importar Podcast → Detector de Tópicos

┌─────────────────────────────────────┐
│  Analizando: "Episode 234"         │
│                                     │
│  Tópicos detectados:               │
│  ✓ 🏠 Alojamiento (85%)            │
│  ✓ 🔧 Problemas (72%)              │
│                                     │
│  Frases extraídas: 12              │
│  Ejercicios generados: 8           │
│                                     │
│  [Crear Nodo]                      │
└─────────────────────────────────────┘
```

---

## Detector de Tópicos (Implementación)

```typescript
// services/topicDetector.ts

interface TopicPattern {
  keywords: string[];
  ngrams: string[];
  weight: number;
}

const TOPIC_PATTERNS: Record<string, TopicPattern> = {
  'alojamiento': {
    keywords: ['hôtel', 'chambre', 'réservation', 'clé', 'lit', 'douche', 'airbnb'],
    ngrams: ['check in', 'check out', 'eau chaude', 'ne marche pas'],
    weight: 1.0,
  },
  'alojamiento-problemas': {
    keywords: ['problème', 'cassé', 'bruit', 'froid', 'sale'],
    ngrams: ['ça ne marche pas', 'il y a un problème', 'pas d\'eau'],
    weight: 1.2, // Mayor peso para subcategorías
  },
  'comida': {
    keywords: ['restaurant', 'café', 'menu', 'addition', 'serveur', 'table'],
    ngrams: ['je voudrais', 'l\'addition s\'il vous plaît', 'une table pour'],
    weight: 1.0,
  },
  'transporte': {
    keywords: ['métro', 'bus', 'taxi', 'train', 'billet', 'station', 'arrêt'],
    ngrams: ['aller à', 'quelle ligne', 'prochain train'],
    weight: 1.0,
  },
  'salud': {
    keywords: ['pharmacie', 'médecin', 'hôpital', 'mal', 'douleur', 'médicament'],
    ngrams: ['j\'ai mal', 'je suis malade', 'besoin d\'un médecin'],
    weight: 1.0,
  },
  'emergencias': {
    keywords: ['police', 'urgence', 'aide', 'volé', 'perdu', 'accident'],
    ngrams: ['au secours', 'j\'ai perdu', 'on m\'a volé', 'appeler la police'],
    weight: 1.0,
  },
};

export function detectTopics(text: string): DetectedTopic[] {
  const normalizedText = text.toLowerCase();
  const results: DetectedTopic[] = [];

  for (const [topicId, pattern] of Object.entries(TOPIC_PATTERNS)) {
    let score = 0;
    const matches: string[] = [];

    // Buscar keywords
    for (const keyword of pattern.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const found = normalizedText.match(regex);
      if (found) {
        score += found.length * 1;
        matches.push(...found);
      }
    }

    // Buscar ngrams (mayor peso)
    for (const ngram of pattern.ngrams) {
      if (normalizedText.includes(ngram)) {
        score += 3; // Ngrams valen más
        matches.push(ngram);
      }
    }

    // Aplicar peso del tópico
    score *= pattern.weight;

    if (score > 0) {
      results.push({
        topicId,
        score,
        confidence: Math.min(score / 10, 1), // Normalizar a 0-1
        matches,
      });
    }
  }

  // Ordenar por score descendente
  return results.sort((a, b) => b.score - a.score);
}
```

---

## Plan de Implementación

### Fase 0: Limpieza (2-3 días)
- [x] Eliminar componentes duplicados (SpeechRecorder, RhythmVisualizer)
- [x] Eliminar código muerto (RadialTree, MatrixTree, HierarchicalTree)
- [x] Eliminar rutas obsoletas (/world/*, /input/*, /tree/*, /dashboard)
- [x] Eliminar componentes huérfanos (janus/, input/, warmup/, missions/, map/)
- [ ] Limpiar schemas (pendiente análisis de ejercicios)
- [x] Analizar stores de progreso (unificación en Fase 1)

**Stores de progreso actuales** (a unificar en Fase 1):
- `useProgressStore`: usado en `/profile` - tracks world/matrix progress
- `useTreeProgressStore`: usado en `/page.tsx` y `useProgressSync` - tracks tree/leaf progress
- Ambos serán reemplazados por `useNodeProgressStore` en la nueva arquitectura

**PENDIENTE DE ANÁLISIS**: Ejercicios y Schemas deprecated
Los siguientes ejercicios están marcados como deprecated pero NO se eliminaron.
Analizar si pueden reutilizarse o deben eliminarse:
- ShardDetectionExercise
- EchoStreamExercise
- GlyphWeavingExercise
- ResonancePathExercise
- MiniTaskExercise
- ForgeMandateExercise
- ShadowingExercise
- BlockBuilderExercise
- BlockSwapExercise
- BlockEchoExercise
- PragmaStrikeExercise

### Fase 1: Core Nuevo (1 semana)
- [ ] Crear estructura de carpetas nueva (/learn, /onboarding, /import)
- [ ] Implementar useUserStore (appLanguage, mode, targetLanguage)
- [ ] Implementar i18n básico (es/en) para la UI
- [ ] Crear onboarding (idioma app → modo)
- [ ] Implementar CourseMap (5 nodos lineales para francés A0)
- [ ] Migrar ejercicios existentes a nueva estructura

### Fase 2: Modo Guiado Completo (1 semana)
- [ ] Crear contenido para 5 nodos (solo francés A0)
  - Nodo 1: Alojamiento (check-in, problemas)
  - Nodo 2: Comida (restaurantes, cafés)
  - Nodo 3: Transporte (metro, taxi)
  - Nodo 4: Salud (farmacia, emergencias)
  - Nodo 5: Recuperación (pedir ayuda, repetir)
- [ ] Implementar LessonPlayer con ejercicios
- [ ] Implementar progreso y desbloqueo secuencial
- [ ] Testing del flujo completo

### Fase 3: Modo Autónomo (1-2 semanas)
- [ ] Implementar detector de tópicos (keywords + ngrams)
- [ ] Crear PodcastImporter (One Thing In A French Day)
- [ ] Crear ArticleImporter (texto/URL)
- [ ] Implementar generador de nodos desde contenido importado
- [ ] Implementar OrganicMap (force-directed graph)
- [ ] Testing con contenido real de podcasts

### Fase Futura (ver ROADMAP_MONETIZACION.md)
- [ ] Sistema de trial y paywall
- [ ] Integración con Supabase para suscripciones
- [ ] Añadir alemán A0
- [ ] Añadir niveles A1, A2
- [ ] Expandir onboarding con selección de idioma/nivel
- [ ] Más fuentes de importación (YouTube, Netflix)
- [ ] PWA y offline support

---

## Decisiones Técnicas

1. **Almacenamiento de contenido importado**
   - LocalStorage para cache local (límite ~5MB)
   - Supabase Storage para persistencia
   - **Decisión**: Híbrido - cache local + sync a Supabase

2. **Sistema SRS**
   - El sistema actual es robusto (385 líneas)
   - **Decisión**: Mantener e integrar con nuevo flujo

3. **Estructura de contenido (extensible)**
   ```
   content/
   ├── fr/          # Francés (MVP)
   │   └── A0/
   ├── de/          # Alemán (futuro)
   │   └── A0/
   └── it/          # Italiano (futuro)
   ```

4. **Monetización**: Ver `ROADMAP_MONETIZACION.md`
