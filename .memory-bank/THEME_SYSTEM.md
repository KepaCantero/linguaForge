# Theme System - Abstracción de Temas de Aprendizaje

> **Fecha de creación:** 2026-01-15
> **Estado:** Activo
> **Versión:** 1.0.0

## Resumen Ejecutivo

El **Theme System** es una abstracción que agrupa Nodes relacionados en unidades coherentes de aprendizaje. Permite organizar contenido importado en temas lógicos con prerrequisitos, metadatos calculados y seguimiento de progreso.

### Arquitectura

```
Node (Contenido Individual)
    ↓
Theme (Agrupación Lógica)
    ↓
Learning Path (Secuencia de Themes)
```

## Conceptos Clave

### Node vs Theme

| Aspecto | Node | Theme |
|---------|------|-------|
| **Propósito** | Contenedor de contenido individual | Agrupación lógica de nodes relacionados |
| **Contenido** | Texto/video/audio con subtopics | Referencias a IDs de nodes |
| **Estructura** | Node → Subtopics → Phrases | Theme → Nodes (array de IDs) |
| **Ejemplo** | "Artículo sobre comida francesa" | "Comida en Francia" (contiene 5 nodes) |
| **Creación** | Importación de contenido | Manual o automática al importar |

### Categorías de Themes

8 categorías disponibles:
- **basics** - Fundamentos (saludos, alphabet, números)
- **travel** - Viajes (transporte, hoteles, direcciones)
- **food** - Comida (restaurantes, recetas, vocabulario culinario)
- **culture** - Cultura (arte, historia, costumbres)
- **business** - Negocios (correo, reuniones, presentaciones)
- **daily_life** - Vida diaria (familia, hogar, rutinas)
- **health** - Salud (médico, farmacia, emergencias)
- **shopping** - Compras (tiendas, precios, devoluciones)

### Niveles CEFR

7 niveles soportados: `A0`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`

## Archivos del Sistema

### Tipos y Schemas

```
src/types/theme.ts
├── Theme, ThemeMetadata, ThemeCategory, CEFRLevel
├── CreateThemeInput, UpdateThemeInput, ThemeFilters
├── ThemeRecommendation
└── Funciones helper: calculateDifficultyScore, validatePrerequisites

src/schemas/theme.ts
└── Re-exporta schemas desde types/theme.ts
```

### Store (Zustand)

```
src/store/useLearningThemeStore.ts
├── Estado: themes[], activeThemeId, completedThemes[]
├── CRUD: createTheme, updateTheme, deleteTheme, getTheme
├── Nodos: addNodeToTheme, removeNodeFromTheme, updateThemeProgress
├── Queries: getThemesByCategory, getThemesByLevel, getFilteredThemes
├── Prerrequisitos: getPrerequisites, isThemeLocked, getAvailableThemes
├── Recomendaciones: getRecommendedThemes
└── Hooks: useLearningThemes, useLearningTheme, useAvailableLearningThemes
```

### Servicio de Negocio

```
src/services/themeService.ts
├── generateThemeFromNodes() - Crea theme desde nodos
├── calculateThemeDifficulty() - Calcula dificultad
├── validateThemePrerequisites() - Valida prerrequisitos
├── suggestNextTheme() - Sugiere siguiente tema
├── generateThemeRecommendations() - Genera recomendaciones
├── calculateThemeProgress() - Calcula progreso
├── exportThemeToJson() / importThemeFromJson() - Import/Export
└── getThemesStats() - Estadísticas agregadas
```

### Componentes UI

```
src/components/learn/ThemeSelector.tsx
├── FilterBar - Filtros de categoría y nivel
├── ThemeCard - Tarjeta de theme individual
├── EmptyState - Estado vacío
└── ThemeSelector - Componente principal
```

### Hooks de Integración

```
src/hooks/input/useTextImportWithTheme.ts
├── importWithTheme() - Importa texto creando/añadiendo a theme
├── importMultipleToTheme() - Importa múltiples en un theme
├── suggestThemeCategory() - Sugiere categoría por contenido
├── suggestThemeLevel() - Sugiere nivel por complejidad
└── generateThemeTitle/Description() - Genera metadatos
```

## Flujo de Trabajo

### 1. Importación con Theme Automático

```typescript
// Al importar texto, crear theme automáticamente
const { importWithTheme } = useTextImportWithTheme();

const result = await importWithTheme(textContent, {
  strategy: 'create',
  themeTitle: 'Mi Primer Theme',
  themeCategory: 'food',
  themeLevel: 'A1',
});

// result.themeId contiene el ID del theme creado
```

### 2. Añadir a Theme Existente

```typescript
// Añadir nuevo import a theme existente
const result = await importWithTheme(textContent, {
  strategy: 'add-to-existing',
  existingThemeId: 'theme-123',
});
```

### 3. Selección de Theme

```typescript
// Componente de selección de themes
<ThemeSelector
  onThemeSelect={(themeId) => navigateToTheme(themeId)}
  showOnlyAvailable={true}
  initialFilters={{ category: 'travel' }}
/>
```

### 4. Consulta de Progreso

```typescript
// Obtener progreso de un theme
const { isCompleted, isLocked, progress } = useLearningThemeProgress(themeId);

// Obtener themes disponibles
const availableThemes = useAvailableLearningThemes();

// Obtener recomendaciones
const recommendations = useLearningThemeRecommendations(currentLevel, 5);
```

## Metadatos Calculados

### Dificultad (0-100)

Se calcula basándose en:
1. **Categoría base** (10-80 puntos)
2. **Nivel CEFR** (modificador 0.5x - 1.6x)
3. **Prerrequisitos** (+5 puntos cada uno)

```typescript
difficultyScore = baseDifficulty * levelModifier + (prerequisitesCount * 5)
```

### Tiempo Estimado de Estudio

Se calcula basándose en:
1. **Conteo de palabras** total del theme
2. **Velocidad de lectura** por nivel (palabras/minuto)
3. **Factor de ejercicios** (+50% adicional)

```typescript
studyTime = (wordCount / wordsPerMinute) * 1.5
```

Velocidades por nivel:
- A0: 5 palabras/minuto
- A1: 8 palabras/minuto
- A2: 12 palabras/minuto
- B1: 18 palabras/minuto
- B2: 25 palabras/minuto
- C1: 35 palabras/minuto
- C2: 50 palabras/minuto

## Prerrequisitos y Bloqueo

### Sistema de Prerrequisitos

```typescript
// Theme con prerrequisitos
const theme: Theme = {
  id: 'theme-advanced',
  title: 'Francés de Negocios',
  category: 'business',
  level: 'B2',
  prerequisites: ['theme-basics', 'theme-daily-life'], // IDs requeridos
  // ...
};
```

### Validación

```typescript
// Verificar si un theme está bloqueado
const isLocked = useLearningThemeStore(state =>
  state.isThemeLocked('theme-advanced')
);

// Obtener prerrequisitos faltantes
const { met, missing, missingThemes } = validateThemePrerequisites(
  theme,
  completedThemes,
  allThemes
);
```

## Recomendaciones

### Algoritmo de Recomendación

1. **Filtrar candidatos** (no completados, nivel apropiado)
2. **Calcular puntuación** (0-100):
   - Nivel apropiado: 30 puntos
   - Prerrequisitos cumplidos: 40 puntos
   - Diversidad de categoría: 20 puntos
   - Fundamentos: 10 puntos
3. **Ordenar** por puntuación
4. **Retornar** top N

### Uso

```typescript
const recommendations = useLearningThemeRecommendations('A1', 5);

// recommendations[0] =
// {
//   themeId: 'theme-food',
//   reason: 'Apto para tu nivel actual. Sin prerrequisitos requeridos',
//   priority: 'high',
//   prerequisitesMet: true,
//   estimatedReadiness: 100
// }
```

## Patrones de Diseño

### 1. Factory Functions Pattern

Las acciones del store están organizadas en funciones factory:

```typescript
const createCRUDActions = (set, get) => ({ /* CRUD */ });
const createNodeActions = (set, get) => ({ /* nodos */ });
const createQueryActions = (set, get) => ({ /* consultas */ });
const createProgressActions = (set, get) => ({ /* progreso */ });
```

### 2. Schema-First Pattern

Todos los tipos se definen con Zod primero:

```typescript
export const ThemeSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  // ...
});

export type Theme = z.infer<typeof ThemeSchema>;
```

### 3. Service Pattern

Lógica de negocio separada en servicios puros:

```typescript
// Servicio: funciones puras, sin dependencias de React
export function generateThemeFromNodes(nodes, title, description, category, level) {
  // Lógica de negocio
  return theme;
}
```

## Integración con Sistema Existente

### Con Imported Nodes

```typescript
// Los themes referencian nodes por ID
theme.nodes = ['imported-123', 'imported-456', 'imported-789'];

// Obtener nodes de un theme
const theme = useLearningTheme(themeId);
const nodes = theme.nodes.map(nodeId =>
  useImportedNodesStore(state => state.getNode(nodeId))
);
```

### Con SRS Store

```typescript
// Al completar ejercicios de un node, actualizar progreso del theme
const handleExerciseComplete = () => {
  // Actualizar progreso del node
  // ...

  // Recalcular progreso del theme
  const updatedMetadata = calculateThemeProgress(theme, nodeProgressMap);
  useLearningThemeStore.getState().updateThemeProgress(
    themeId,
    updatedMetadata.completedNodes,
    updatedMetadata.averageNodeProgress
  );
};
```

## Export/Import

### Exportar Theme

```typescript
const json = exportThemeToJson(theme, true, nodesData);
// Guardar en archivo o compartir
```

### Importar Theme

```typescript
const theme = importThemeFromJson(jsonString);
const themeId = useLearningThemeStore.getState().createTheme(theme);
```

## Casos de Uso

### 1. Crear Curso Estructurado

```typescript
// Crear secuencia de temas con prerrequisitos
const basicsId = createTheme({ title: 'Fundamentos', category: 'basics', level: 'A0', prerequisites: [] });
const foodId = createTheme({ title: 'Comida', category: 'food', level: 'A1', prerequisites: [basicsId] });
const travelId = createTheme({ title: 'Viajes', category: 'travel', level: 'A1', prerequisites: [basicsId] });
```

### 2. Agrupar Contenido Importado

```typescript
// Usuario importa 5 artículos sobre comida
const articleIds = await Promise.all(articles.map(a => importArticle(a)));

// Crear theme con todos los artículos
const themeId = createTheme({
  title: 'Gastronomía Francesa',
  category: 'food',
  level: 'A2',
  nodes: articleIds,
});
```

### 3. Seguimiento de Progreso

```typescript
// Obtener progreso del usuario
const { completedThemes } = useLearningThemeStore();
const availableThemes = useAvailableLearningThemes();
const recommendations = useLearningThemeRecommendations(userLevel, 5);

// Mostrar próximos pasos
<ThemeSelector
  showOnlyAvailable={true}
  onThemeSelect={startLearning}
/>
```

## Testing

### Unit Tests

```typescript
// Tests de servicios
describe('themeService', () => {
  it('calcula dificultad correctamente', () => {
    const difficulty = calculateThemeDifficulty(theme);
    expect(difficulty).toBeBetween(0, 100);
  });

  it('valida prerrequisitos', () => {
    const validation = validateThemePrerequisites(theme, completed, all);
    expect(validation.met).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Tests de store
describe('useLearningThemeStore', () => {
  it('crea theme correctamente', () => {
    const id = useLearningThemeStore.getState().createTheme(input);
    expect(id).toBeTruthy();
  });

  it('bloquea themes con prerrequisitos pendientes', () => {
    const isLocked = useLearningThemeStore.getState().isThemeLocked(themeId);
    expect(isLocked).toBe(true);
  });
});
```

## Roadmap

### v1.1 (Futuro)
- [ ] Themes colaborativos (compartir entre usuarios)
- [ ] Sincronización con Supabase
- [ ] Analytics de progreso por theme
- [ ] Sugerencias inteligentes con ML

### v1.2 (Futuro)
- [ ] Themes oficiales predefinidos
- [ ] Marketplace de themes
- [ ] Valoración y reseñas de themes
- [ ] Integración con sistema de gamificación

## Referencias

- **Documentación principal:** `src/types/theme.ts`
- **Implementación del store:** `src/store/useLearningThemeStore.ts`
- **Lógica de negocio:** `src/services/themeService.ts`
- **Componente UI:** `src/components/learn/ThemeSelector.tsx`
- **Integración con imports:** `src/hooks/input/useTextImportWithTheme.ts`

## Changelog

### v1.0.0 (2026-01-15)
- ✅ Sistema completo de Themes implementado
- ✅ 8 categorías temáticas
- ✅ Sistema de prerrequisitos y bloqueo
- ✅ Algoritmo de recomendaciones
- ✅ Integración con flujo de importación
- ✅ Componente UI de selección
- ✅ Export/Import de themes
