# Guía de Integración de Librerías

Esta guía documenta cómo usar las librerías integradas en LinguaForge.

## 1. react-countup - Animaciones de Números

### Uso básico

```tsx
import { CountUpNumber } from '@/components/ui/CountUpNumber';

<CountUpNumber value={xp} duration={0.8} />
<CountUpNumber value={coins} duration={0.6} suffix=" monedas" />
<CountUpNumber value={1234.56} decimals={2} />
```

### Con formato personalizado

```tsx
import {
  CountUpNumber,
  formatLargeNumber,
} from "@/components/ui/CountUpNumber";

<CountUpNumber
  value={25000}
  formatValue={formatLargeNumber}
  // Muestra: 25.0K
/>;
```

## 2. @tsparticles/react - Efectos de Partículas

### Uso básico

```tsx
import { ParticlesSurge } from "@/components/ui/ParticlesSurge";

<ParticlesSurge
  active={showSurge}
  type="surge"
  onComplete={() => setShowSurge(false)}
/>;
```

### Tipos disponibles

- `surge`: Efecto de "Wordweave Surge" (partículas doradas)
- `level-up`: Efecto de subida de nivel (verde)
- `rank-up`: Efecto de subida de rango (púrpura)

### Integración global

El componente `XPSurgeEffect` está integrado en `layout.tsx` y escucha automáticamente eventos:

- `xp-surge`: Dispara partículas de surge
- `level-up`: Dispara partículas de level-up
- `rank-up`: Dispara partículas de rank-up

## 3. React Flow - Janus Matrix Avanzado

### Uso básico

```tsx
import { JanusMatrixFlow } from "@/components/janus/JanusMatrixFlow";

<JanusMatrixFlow
  matrix={matrix}
  onNodeClick={(nodeId, columnIndex) => {
    console.log("Nodo clickeado:", nodeId);
  }}
  selectedNodes={selectedNodeIds}
  connections={[
    { from: "node-1", to: "node-2" },
    { from: "node-2", to: "node-3" },
  ]}
/>;
```

### Características

- Nodos arrastrables con snap-to-grid
- Zoom y paneo con controles integrados
- MiniMap para navegación
- Conexiones animadas entre nodos
- Background con puntos

## 4. Recharts - Dashboard Krashen

### Uso básico

```tsx
import { KrashenCharts } from "@/components/dashboard/KrashenCharts";

<KrashenCharts
  stats={{
    wordsRead: 18200,
    wordsHeard: 24100,
    wordsSpoken: 3200,
    minutesListened: 120,
    minutesRead: 45,
  }}
  thresholds={{
    read: 30000,
    heard: 35000,
    spoken: 5000,
  }}
  languageCode="fr"
  levelCode="A1"
/>;
```

### Componentes incluidos

- Gráfico de barras: Progreso vs Objetivo
- Gráfico de área: Actividad semanal
- Indicadores de progreso: Barras de progreso individuales

## 5. use-undo - Historial de Deshacer

### Uso básico

```tsx
import { useUndo } from '@/hooks/useUndo';

const {
  state: selectedCells,
  set: setSelectedCells,
  undo,
  redo,
  canUndo,
  canRedo,
} = useUndo<(string | null)[]>([null, null, null, null]);

// Usar
<button onClick={undo} disabled={!canUndo}>
  Deshacer
</button>
<button onClick={redo} disabled={!canRedo}>
  Rehacer
</button>
```

### Integrado en JanusMatrix

El componente `JanusMatrix` ya incluye botones de deshacer/rehacer que aparecen automáticamente cuando hay historial disponible.

## Ejemplos de Integración

### Header con CountUpNumber

```tsx
// Ya integrado en src/components/layout/Header.tsx
<CountUpNumber value={xp} duration={0.8} />
<CountUpNumber value={coins} duration={0.6} />
```

### Dashboard con KrashenCharts

```tsx
// Ya integrado en src/app/dashboard/page.tsx
<KrashenCharts stats={stats} thresholds={thresholds} />
```

### Efectos de partículas globales

```tsx
// Ya integrado en src/app/layout.tsx
<XPSurgeEffect />
```

## Próximos Pasos

1. Personalizar colores de partículas según tema
2. Agregar más tipos de gráficos en KrashenCharts
3. Mejorar interacciones en JanusMatrixFlow
4. Agregar más animaciones con react-countup
