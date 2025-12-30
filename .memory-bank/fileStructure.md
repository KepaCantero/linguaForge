# File Structure — v4.0

## Arquitectura de Directorios

```
frenchWebApp/
├── .memory-bank/              # Memory bank (documentación)
│   ├── README.md
│   ├── projectBrief.md
│   ├── taskProgress.md
│   ├── activeContext.md
│   ├── techDecisions.md
│   ├── fileStructure.md
│   ├── schemas.md
│   ├── janulus.md
│   ├── octalysis.md
│   └── krashenMethodology.md
│
├── content/                   # Contenido JSON (NO en src)
│   ├── fr/
│   │   ├── A1/
│   │   │   └── airbnb.json   # World completo
│   │   └── A2/
│   │       └── demo.json     # World dummy
│   └── de/
│       └── A1/
│           └── demo.json     # World dummy alemán
│
├── public/
│   ├── sw.js                  # Service Worker
│   ├── manifest.json          # PWA Manifest
│   ├── audio/
│   │   └── fr/
│   │       └── a1/
│   │           └── airbnb/    # Audios del world
│   └── images/
│       └── worlds/
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # RootLayout
│   │   ├── page.tsx           # Home (World Map)
│   │   ├── globals.css
│   │   │
│   │   ├── janus/
│   │   │   └── [worldId]/
│   │   │       └── page.tsx   # Janus Matrix View
│   │   │
│   │   ├── intoning/
│   │   │   └── [worldId]/
│   │   │       └── [columnId]/
│   │   │           └── page.tsx  # Intoning Mode
│   │   │
│   │   ├── matrix/
│   │   │   └── [worldId]/
│   │   │       └── [matrixId]/
│   │   │           └── page.tsx  # Matrix Exercises
│   │   │
│   │   ├── input/
│   │   │   └── page.tsx       # Input Player
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Dashboard
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx       # Profile
│   │   │
│   │   └── login/
│   │       └── page.tsx       # Auth
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── BottomNav.tsx
│   │   │
│   │   ├── janus/
│   │   │   ├── JanusMatrixView.tsx
│   │   │   ├── JanusColumn.tsx
│   │   │   ├── JanusCell.tsx
│   │   │   └── PhraseResult.tsx
│   │   │
│   │   ├── intoning/
│   │   │   ├── IntoningView.tsx
│   │   │   ├── WordHighlight.tsx
│   │   │   └── PlaybackControls.tsx
│   │   │
│   │   ├── exercises/
│   │   │   ├── ClozeExercise.tsx
│   │   │   ├── ShadowingExercise.tsx
│   │   │   ├── VariationView.tsx
│   │   │   └── MiniTask.tsx
│   │   │
│   │   ├── input/
│   │   │   ├── InputPlayerView.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── TextReader.tsx
│   │   │   └── InputTest.tsx
│   │   │
│   │   ├── map/
│   │   │   ├── WorldMapView.tsx
│   │   │   └── MatrixNode.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── InputStatsView.tsx
│   │   │   ├── LevelEstimator.tsx
│   │   │   ├── GamificationStats.tsx
│   │   │   └── JanusProgress.tsx
│   │   │
│   │   ├── auth/
│   │   │   └── AuthProvider.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── RewardAnimation.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── store/                 # Zustand stores
│   │   ├── useProgressStore.ts
│   │   ├── useInputStore.ts
│   │   ├── useGamificationStore.ts
│   │   └── useUIStore.ts
│   │
│   ├── services/              # Lógica de negocio
│   │   ├── contentLoader.ts
│   │   ├── progressionRules.ts
│   │   ├── janusTracker.ts
│   │   ├── inputTracker.ts
│   │   ├── inputSelector.ts
│   │   ├── rewardEngine.ts
│   │   └── syncService.ts
│   │
│   ├── schemas/               # Zod schemas
│   │   └── content.ts
│   │
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   │
│   └── lib/                   # Utilidades
│       ├── constants.ts
│       ├── supabase.ts
│       └── utils.ts
│
├── .env.local                 # Variables de entorno
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Mapeo Tarea → Archivos

| Tarea | Archivos Principales |
|-------|---------------------|
| 0.1 | `src/lib/constants.ts` |
| 1 | Proyecto base, package.json, configs |
| 2 | `layout.tsx`, `Header.tsx`, `BottomNav.tsx` |
| 3 | `src/types/index.ts` |
| 4 | `src/schemas/content.ts` |
| 5 | `content/fr/A1/airbnb.json` |
| 6 | `src/services/contentLoader.ts` |
| 7 | `src/store/*.ts` (4 stores) |
| 8 | `src/services/inputTracker.ts` |
| 9 | `src/app/page.tsx`, `WorldMapView.tsx`, `MatrixNode.tsx` |
| 10 | `src/services/progressionRules.ts` |
| 11 | `src/app/janus/[worldId]/page.tsx`, `JanusMatrixView.tsx` |
| 12 | `src/services/janusTracker.ts` |
| 13 | `src/app/intoning/[worldId]/[columnId]/page.tsx` |
| 14 | `src/components/exercises/ClozeExercise.tsx` |
| 15 | `src/components/exercises/ShadowingExercise.tsx` |
| 16 | `src/components/exercises/VariationView.tsx` |
| 17 | `src/components/exercises/MiniTask.tsx` |
| 18 | `src/services/inputSelector.ts` |
| 19 | `src/app/input/page.tsx`, `InputPlayerView.tsx` |
| 20 | `src/components/input/InputTest.tsx` |
| 21 | `src/app/dashboard/page.tsx`, componentes dashboard |
| 22 | `src/services/rewardEngine.ts`, `RewardAnimation.tsx` |
| 23 | `src/lib/supabase.ts`, `src/app/login/page.tsx` |
| 24 | `src/services/syncService.ts` |
| 25 | `public/sw.js`, `public/manifest.json` |
| 26 | `content/fr/A2/demo.json` |
| 27 | `content/de/A1/demo.json` |

---

## Convenciones de Naming

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `JanusMatrixView.tsx` |
| Hooks/Stores | camelCase + prefijo | `useProgressStore.ts` |
| Services | camelCase | `contentLoader.ts` |
| Types/Interfaces | PascalCase | `JanusMatrix` |
| Constantes | SCREAMING_SNAKE | `XP_RULES` |
| JSON content | kebab-case | `airbnb.json` |
| Rutas dinámicas | `[param]` | `[worldId]` |

---

## Dependencias Clave

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "zustand": "^4.0.0",
    "zod": "^3.0.0",
    "framer-motion": "^10.0.0",
    "howler": "^2.2.0",
    "fuse.js": "^7.0.0",
    "@supabase/supabase-js": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@types/howler": "^2.2.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## Rutas de la Aplicación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | World Map |
| `/janus/[worldId]` | Janus | Matriz combinatoria |
| `/intoning/[worldId]/[columnId]` | Intoning | Modo ritmo |
| `/matrix/[worldId]/[matrixId]` | Matrix | Ejercicios |
| `/input` | Input | Player de contenido |
| `/dashboard` | Dashboard | Estadísticas |
| `/profile` | Profile | Perfil usuario |
| `/login` | Login | Autenticación |
