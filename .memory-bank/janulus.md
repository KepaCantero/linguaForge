# Método Janulus — Fluidez Combinatoria

> Basado en Powell Janulus (récord Guinness: 42 idiomas)

## Concepto Core

En lugar de memorizar vocabulario estático, el usuario trabaja con una **matriz de 4 columnas** que permite generar millones de combinaciones con solo 16-20 palabras.

## Estructura de la Janus Matrix

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  COLUMNA 1  │  COLUMNA 2  │  COLUMNA 3  │  COLUMNA 4  │
│   SUJETO    │   RAZÓN     │   ACCIÓN    │ CIRCUNSTAN. │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Je          │ veux        │ réserver    │ la chambre  │
│ Nous        │ dois        │ voir        │ l'appartement│
│ Vous        │ peux        │ utiliser    │ la cuisine  │
│ Il/Elle     │ voudrais    │ trouver     │ les clés    │
│ On          │ aimerais    │ demander    │ le wifi     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

## Matemáticas de la Combinatoria

Con 5 elementos por columna:
- **5 × 5 × 5 × 5 = 625 frases posibles**

Con 4 columnas de 4 elementos:
- **4 × 4 × 4 × 4 = 256 frases mínimo**

## Regla de Automatización

> Repetir combinaciones **25-30 veces** crea automaticidad neuronal.
> El usuario piensa directamente en francés sin traducción mental.

## Implementación Técnica

### Estructura de Datos

```typescript
interface JanusColumn {
  id: string;
  label: string;              // "Sujeto", "Razón", etc.
  grammaticalRole: 'subject' | 'modal' | 'verb' | 'complement';
  cells: JanusCell[];
}

interface JanusCell {
  id: string;
  text: string;               // "Je", "veux", etc.
  translation: string;        // "Yo", "quiero", etc.
  audioUrl?: string;
  timesUsed: number;          // Para tracking de repeticiones
}

interface JanusMatrix {
  id: string;
  worldId: string;
  title: string;
  columns: [JanusColumn, JanusColumn, JanusColumn, JanusColumn]; // Exactamente 4
  targetRepetitions: number;  // Default: 25
}

interface JanusCombination {
  cells: [string, string, string, string]; // IDs de las celdas seleccionadas
  resultPhrase: string;                     // Frase generada
  timestamp: Date;
}
```

### Flujo de Usuario

1. **Ver matriz** → Grid visual de 4 columnas
2. **Seleccionar celdas** → Una por columna (en orden)
3. **Ver frase resultante** → Concatenación automática
4. **Escuchar pronunciación** → Audio de la frase completa
5. **Repetir** → Contador incrementa
6. **Completar** → 25+ repeticiones = matriz dominada

### UI Specification

```
┌────────────────────────────────────────────────────────┐
│                    JANUS MATRIX                        │
│                "Reservar alojamiento"                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│   [Je]        [veux]      [réserver]   [la chambre]   │
│   [Nous]      [dois]      [voir]       [l'appart.]    │
│   [Vous]      [peux]      [utiliser]   [la cuisine]   │
│   [Il/Elle]   [voudrais]  [trouver]    [les clés]     │
│   [On]        [aimerais]  [demander]   [le wifi]      │
│                                                        │
├────────────────────────────────────────────────────────┤
│  FRASE: "Je veux réserver la chambre"                 │
│  TRAD:  "Yo quiero reservar la habitación"            │
│                        [▶ Escuchar]                    │
├────────────────────────────────────────────────────────┤
│  Repeticiones: 12/25    ████████░░░░░░░░  48%         │
└────────────────────────────────────────────────────────┘
```

### Reglas de Negocio (FIJAS)

| Regla | Valor | Razón |
|-------|-------|-------|
| Columnas por matriz | 4 | Estructura Janulus estándar |
| Celdas mínimas por columna | 4 | 256 combinaciones mínimo |
| Celdas máximas por columna | 6 | Evitar sobrecarga cognitiva |
| Repeticiones para dominio | 25 | Automatización neuronal |
| Orden de selección | Izq→Der | Estructura gramatical francesa |

---

## Técnica de Intoning

### Concepto

Asignar ritmos y melodías a palabras objetivo. Cantar/salmodiar 3 veces sincroniza boca, oído, cerebro y cuerpo.

### Implementación

```typescript
interface IntoningSession {
  matrixId: string;
  words: string[];           // 20-30 palabras de la matriz
  cyclesCompleted: number;   // Target: 3
  playbackRate: number;      // 0.75 | 1.0 | 1.25
}
```

### Flujo

1. **Mostrar palabras** → Lista visual de la columna
2. **Reproducir audio** → Secuencia rítmica
3. **Usuario repite** → En voz alta (sin grabación v1)
4. **Ciclo completo** → 3 repeticiones = sesión completada

### UI del Intoning

```
┌────────────────────────────────────────┐
│         🎵 INTONING MODE               │
│         Columna: Acciones              │
├────────────────────────────────────────┤
│                                        │
│    → réserver ←                        │
│      voir                              │
│      utiliser                          │
│      trouver                           │
│      demander                          │
│                                        │
├────────────────────────────────────────┤
│  Velocidad: [🐢] [Normal] [🐇]         │
│  Ciclo: 2/3   ██████████░░░░░  67%    │
│                                        │
│         [▶ Reproducir Todo]            │
└────────────────────────────────────────┘
```

---

## Integración con el Flujo de Aprendizaje

```
World Map
    │
    ▼
┌─────────────────┐
│  Janus Matrix   │ ← PRIMERO (base combinatoria)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Intoning     │ ← Opcional (refuerzo rítmico)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Matrix 1..5    │ ← Ejercicios contextuales
│  (Cloze, etc.)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    MiniTask     │ ← Producción libre
└─────────────────┘
```

---

## Métricas de Janulus

| Métrica | Cálculo |
|---------|---------|
| `combinationsCreated` | Count de JanusCombination |
| `uniqueCombinations` | Distinct combinations |
| `cellMastery` | Cells con timesUsed >= 25 |
| `matrixProgress` | cellMastery / totalCells |
