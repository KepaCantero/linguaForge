# Metodología Krashen — Input Comprensible

> Este documento define la base científica del sistema de aprendizaje

## Principio Core

**Krashen NO dice:** "Si ves X vídeos ya sabes el idioma"

**Krashen dice:** El nivel emerge cuando hay suficiente input comprensible (i+1)

## Qué Mide la App

| Métrica | Por qué importa |
|---------|-----------------|
| Cantidad | Volumen de exposición |
| Tipo | Balance audio/video/texto |
| Nivel | Dificultad apropiada (i+1) |
| Comprensión | Validación de entendimiento |

---

## InputStats Expandido

```typescript
interface InputStats {
  // Contadores de palabras
  wordsRead: number;
  wordsHeard: number;
  wordsSpoken: number;

  // Contadores de tiempo
  minutesListened: number;
  minutesRead: number;
}
```

**Separados por:**
- Idioma (fr, de, es...)
- Nivel (A1, A2...)
- Global (total del jugador)

---

## Umbrales Krashen-Inspired

```typescript
interface LevelThresholds {
  [level: string]: {
    read: number;
    heard: number;
    spoken: number;
  }
}

const defaultThresholds: LevelThresholds = {
  A1: {
    read: 30000,
    heard: 35000,
    spoken: 5000
  },
  A2: {
    read: 60000,
    heard: 70000,
    spoken: 12000
  },
  // etc.
}
```

**Características:**
- No bloquean progreso
- Sugieren nivel emergente
- Se muestran como "estimación cognitiva"
- Son configurables

---

## Dashboard de Input

### Visualización Gen Z (simple pero poderosa)

```
INPUT FRANCÉS A1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Leídas:     18.200 / 30.000  ████████████░░░░  61%
🎧 Escuchadas: 24.100 / 35.000  ██████████████░░  69%
🗣 Habladas:    3.200 /  5.000  ████████████░░░░  64%

Nivel estimado: A1 alto
```

**Diferenciador vs Duolingo:** Métricas reales, no XP arbitrario.

---

## Botón "Input para mí"

### Disponibilidad
- Home (siempre visible)
- Dashboard
- Tras completar una Matrix

### Flujo Interno

#### Paso 1 — Detectar Perfil
```typescript
interface InputProfile {
  language: LanguageCode;
  level: LevelCode;
  weakness: 'listening' | 'reading' | 'speaking';
}
```

#### Paso 2 — Seleccionar Contenido

**Tipos posibles:**
| Tipo | Duración |
|------|----------|
| 🎧 Audio corto | 30–90s |
| 🎥 Clip vídeo | subtítulos opcionales |
| 📄 Texto corto | narrativo |

**Criterios de selección:**
- i+1 (ligeramente por encima del nivel actual)
- Vocabulario ≥ 80% conocido
- Temática familiar (Airbnb, viaje...)

#### Paso 3 — Presentar Input

**UI minimalista:**
- Sin botones innecesarios
- Sin distracciones
- Contador discreto: `🎧 escuchado 1/3`
- Cada exposición suma input

#### Paso 4 — Test de Comprensión (ligero)

**Tipos de test (no examen, no producción forzada):**
- Selección de idea principal
- Ordenar eventos
- "¿Qué pasó primero?"
- Seleccionar frase verdadera

**Si falla:**
- No castigo
- Solo "Repite el input"

**Qué valida el test:**
- NO valida gramática
- Valida comprensión global
- 100% Krashen

---

## Registro de Eventos

```typescript
interface InputEvent {
  id: string;
  timestamp: Date;
  type: 'audio' | 'video' | 'text';
  contentId: string;
  wordsCounted: number;
  durationSeconds?: number;
  understood: boolean;
  languageCode: LanguageCode;
  levelCode: LevelCode;
}
```

**Qué se contabiliza:**
- Palabras → dashboard
- Tiempo → stats
- Comprensión → confianza del sistema

---

## Nuevos Servicios

### InputContentService
- Selecciona contenido apropiado
- Controla dificultad (i+1)
- Balancea tipos (audio/video/texto)

### InputTracker
- Incrementa contadores
- Registra eventos
- Calcula nivel emergente

### ComprehensionValidator
- Tests simples
- Heurísticas (no ML)
- Sin "magia"

---

## Sistema de Recompensas

| Acción | Recompensa |
|--------|------------|
| Completar input | 💰 Monedas |
| Pasar comprensión | 💎 Gemas |
| Racha diaria | 🔥 Streak bonus |

**Filosofía:** El input no es pasivo, pero tampoco es escolar.

---

## Diferenciadores del Producto

| Aspecto | Duolingo | Esta App |
|---------|----------|----------|
| Métricas | XP arbitrario | Input real medido |
| Nivel | Badges decorativos | Estimación cognitiva |
| Comprensión | No medida | Validada |
| Krashen | No aplicado | Core del producto |
| Output | Forzado temprano | Solo cuando hay input suficiente |

---

## Resultado Final

La app:
- ✅ Respeta Krashen de verdad
- ✅ Mide input real
- ✅ No fuerza output antes de tiempo
- ✅ Tiene feedback cognitivo
- ✅ Es adictiva
- ✅ Es escalable
- ✅ Es científicamente defendible

**Esto NO es un clon de Duolingo.**
**Es una plataforma de adquisición lingüística gamificada.**
