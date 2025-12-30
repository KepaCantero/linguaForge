# FrenchA1 Airbnb - Guía de Desarrollo

## Requisitos Previos

- Node.js 18.17 o superior
- npm 9.0 o superior

## Instalación

```bash
# Clonar o navegar al proyecto
cd frenchWebApp

# Instalar dependencias
npm install
```

## Ejecutar en Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
frenchWebApp/
├── src/
│   ├── app/                    # Rutas de Next.js App Router
│   │   ├── page.tsx           # Página principal (mapa de mundos)
│   │   ├── layout.tsx         # Layout principal con Header y BottomNav
│   │   ├── input/             # Página de Input Comprensible
│   │   ├── dashboard/         # Página de estadísticas
│   │   ├── profile/           # Página de perfil
│   │   └── world/[worldId]/   # Rutas dinámicas de mundos
│   │       ├── page.tsx       # Mapa del mundo
│   │       ├── janus/         # Janus Matrix
│   │       └── matrix/[matrixId]/ # Ejercicios
│   │
│   ├── components/            # Componentes React
│   │   ├── layout/           # Header, BottomNav
│   │   ├── map/              # WorldMap, MapNode
│   │   ├── janus/            # JanusMatrix, JanusCell, IntoningMode
│   │   ├── exercises/        # Cloze, Shadowing, Variations, MiniTask
│   │   └── input/            # InputSelector, InputPlayer, ComprehensionTest
│   │
│   ├── store/                 # Estado global con Zustand
│   │   ├── useProgressStore.ts   # Progreso de mundos y matrices
│   │   ├── useInputStore.ts      # Estadísticas de input (Krashen)
│   │   ├── useGamificationStore.ts # XP, coins, gems, streak
│   │   └── useUIStore.ts         # Loading, errores, animaciones
│   │
│   ├── services/              # Lógica de negocio
│   │   ├── contentLoader.ts  # Carga de contenido JSON
│   │   └── inputTracker.ts   # Cálculos de estadísticas Krashen
│   │
│   ├── schemas/               # Validación con Zod
│   │   └── content.ts        # Schemas para todo el contenido
│   │
│   ├── lib/                   # Utilidades
│   │   └── constants.ts      # Configuración, reglas de XP, niveles
│   │
│   └── types/                 # TypeScript types
│       └── index.ts          # Re-exportación de tipos
│
├── content/                   # Contenido JSON
│   └── fr/A1/airbnb.json     # Mundo de francés A1 Airbnb
│
├── __tests__/                 # Tests
│   ├── unit/                 # Tests unitarios
│   ├── integration/          # Tests de integración
│   └── setup.ts              # Configuración de tests
│
└── public/                    # Assets estáticos
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Producción
npm run build        # Build de producción
npm run start        # Iniciar servidor de producción

# Tests
npm run test         # Ejecutar tests unitarios
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con cobertura

# Linting
npm run lint         # Ejecutar ESLint
```

## Tests

### Ejecutar todos los tests
```bash
npm run test
```

### Ejecutar tests con cobertura
```bash
npm run test:coverage
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

## Arquitectura

### Metodología Krashen (Input Comprensible)
La app sigue la hipótesis del input comprensible de Krashen:
- **Umbrales de nivel**: Para avanzar a A2 se necesitan:
  - 30,000 palabras leídas
  - 35,000 palabras escuchadas
  - 5,000 palabras producidas

### Método Janulus
Matrices de 4 columnas (sujeto, modal, verbo, complemento) que generan 256+ combinaciones:
- Target: 25 combinaciones únicas para completar
- Modo Intoning: 3 ciclos de repetición rítmica

### Gamificación (Octalysis)
Sistema de recompensas:
- **XP**: Por completar ejercicios
- **Monedas**: Por input y streaks
- **Gemas**: Por comprensión perfecta
- **Streak**: Días consecutivos de práctica

## Flujo de Ejercicios

1. **Selección de Mundo** → Mapa principal
2. **Janus Matrix** → Generación de frases combinatorias
3. **Intoning** → Práctica de pronunciación rítmica
4. **Por cada frase**:
   - Cloze (completar hueco)
   - Shadowing (repetir audio)
   - Variations (leer variantes)
5. **MiniTask** → Producción escrita con keywords

## Contenido JSON

Estructura de un mundo:
```json
{
  "id": "airbnb",
  "languageCode": "fr",
  "levelCode": "A1",
  "title": "Airbnb en París",
  "janusMatrix": {
    "columns": [
      { "label": "Sujeto", "cells": [...] },
      { "label": "Modal", "cells": [...] },
      { "label": "Verbo", "cells": [...] },
      { "label": "Complemento", "cells": [...] }
    ]
  },
  "matrices": [
    {
      "title": "Check-in",
      "phrases": [...],
      "miniTask": {...}
    }
  ]
}
```

## Stores (Zustand)

### useProgressStore
- `activeLanguage`, `activeLevel`
- `worldProgress`: Matrices completadas, progreso de Janus

### useInputStore
- `stats`: Palabras leídas/escuchadas/habladas por idioma+nivel
- `recentContentIds`: Historial para evitar repetición

### useGamificationStore
- `xp`, `coins`, `gems`, `streak`
- `updateStreak()`: Calcula y actualiza racha diaria

### useUIStore
- `isLoading`, `error`
- `showReward()`: Animaciones de recompensa

## Persistencia

Todos los stores usan `zustand/middleware/persist` con localStorage:
- `french-app-progress`
- `french-app-input`
- `french-app-gamification`

## Notas de Desarrollo

### Agregar nuevo contenido
1. Crear JSON en `content/{lang}/{level}/{worldId}.json`
2. Validar contra `WorldSchema`
3. Agregar a `AVAILABLE_WORLDS` en `contentLoader.ts`

### Agregar nuevo idioma
1. Agregar código a `LanguageCodeSchema`
2. Crear directorio en `content/`
3. Agregar bandera en `LANGUAGE_INFO`

### Modificar reglas de XP
Editar `XP_RULES` en `src/lib/constants.ts`

## Troubleshooting

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de TypeScript
```bash
npm run lint
npm run build
```

### Limpiar cache de Next.js
```bash
rm -rf .next
npm run dev
```
