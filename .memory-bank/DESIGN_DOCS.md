# Documentos de Diseño — Consolidado

> Última actualización: 2025-01-XX

Este documento consolida todos los documentos de diseño y rediseño del sistema.

---

## 1. Sistema INPUT — Rediseño Completo

### Arquitectura Funcional

```
INPUT HUB (/input)
├── VIDEO (YouTube)
│   ├── Reproductor YouTube IFrame API
│   ├── Transcripción sincronizada automática
│   ├── Tracking de visualizaciones únicas
│   └── Selección de palabras clave
├── AUDIO (Podcast/Archivo)
│   ├── Player de audio con controles
│   ├── Transcripción manual/automática
│   ├── Tracking de escuchas únicas
│   └── Selección de palabras clave
└── TEXTO (Reader)
    ├── Textarea para contenido
    ├── Generación de audio (TTS)
    ├── Contador de palabras leídas
    └── Selección de palabras clave
```

### Estado Actual: ✅ 100% Implementado

- Hub INPUT (`/input`)
- Reproductor de Video con YouTube API
- Reproductor de Audio
- Lector de Texto con TTS
- Extracción automática de transcripciones
- Tracking de métricas
- Selección de palabras clave
- Integración con SRS

**Ver `INPUT_SYSTEM_REDESIGN.md` para detalles completos del diseño original.**

---

## 2. Ejercicios Core — Rediseño v2.0

### Problemas Detectados

1. "Repetición de audio" y "Reconocimiento de audio" eran el mismo ejercicio
2. "Construcción de frases" no aportaba valor real
3. Entonación no enseñaba ritmo conversacional
4. Práctica oral no reflejaba interacción real
5. Matrices Janus: columnas como filas, sin conjugación automática

### Solución: Nuevos Ejercicios

| Ejercicio Actual            | Nuevo Ejercicio        | Estado |
| --------------------------- | ---------------------- | ------ |
| Repetición + Reconocimiento | **ConversationalEcho** | ✅     |
| Construcción de frases      | **ELIMINADO**          | ✅     |
| Shadowing clásico           | **DialogueIntonation** | ✅     |
| N/A                         | **InteractiveSpeech**  | ⏳     |
| Matrices Janus              | **JanusComposer**      | ✅     |

### Ejercicios Implementados

- ✅ **ConversationalEcho** - Respuesta natural dentro del contexto conversacional
- ✅ **DialogueIntonation** - Entonación de diálogos con visualización de ritmo
- ✅ **JanusComposer** - Matrices con conjugación automática
- ✅ **Shard Detection** - Reconocimiento rápido de palabras clave
- ✅ **Pragma Strike** - Comunicación situacional
- ✅ **Echo Stream** - Repetición con visualización de ondas
- ✅ **Glyph Weaving** - Patrones rítmicos en matriz
- ✅ **Resonance Path** - Entonación con comparación nativa
- ⏳ **InteractiveSpeech** - Diálogo interactivo (pendiente)
- ⏳ **Forge Mandate** - Orquestador de ejercicios (pendiente)

**Ver `EXERCISES_REDESIGN.md` para detalles completos del rediseño.**

---

## 3. Warm-ups Cognitivos — Implementación

### Estado: ✅ 85% Implementado

**Componentes Implementados:**

- ✅ Schemas y tipos (`src/schemas/warmup.ts`)
- ✅ Store de warm-ups (`src/store/useWarmupStore.ts`)
- ✅ RhythmSequenceWarmup (Gramática → Ganglios Basales)
- ✅ VisualMatchWarmup (Vocabulario → Lóbulo Temporal)
- ✅ VoiceImitationWarmup (Pronunciación → Cerebelo)
- ✅ WarmupTransition (Transición fluida)
- ✅ WarmupGate (Wrapper para misiones)
- ✅ Selector de warm-ups (`src/services/warmupSelector.ts`)

**Pendiente:**

- ⏳ Integración con MissionFeed

**Ver `WARMUP_IMPLEMENTATION_SUMMARY.md` para detalles completos.**

---

## 4. Análisis UX y Behavioral Design

### Principios Aplicados

**Feedback Háptico:**

- Vibración en móviles al seleccionar opciones
- Implementado en: Cloze, Pragma Strike, Shard Detection

**Traducciones Opcionales:**

- Toggle para mostrar/ocultar traducciones
- Permite aprendizaje sin traducciones
- Implementado en todos los ejercicios principales

**Menú de Ejercicios:**

- Diseño visual atractivo con gradientes
- Layout compacto que muestra todo "en un golpe de vista"
- Progreso visible por ejercicio y tipo

**Navegación Optimizada:**

- Eliminada pantalla intermedia de selección de modo
- Modo seleccionado directamente desde intro
- En Academia: completar todas las frases de un tipo antes de volver al menú

**Atajos de Teclado:**

- `SPACE`: Reproducir audio
- `1-4`: Seleccionar opción en ejercicios de opción múltiple

**Recompensas Variables:**

- 10% de probabilidad de "critical surge" (doble XP)
- Efectos de partículas para feedback visual

**Ver `ux-analysis.md` para análisis completo de UX.**

---

## 5. Paleta de Colores y Branding

### Paleta Actual

**Colores Principales:**

- Primary Purple: `#7E22CE`
- Primary Indigo: `#4F46E5` (inconsistencia detectada)
- Accent Pink: `#EC4899`
- Background Dark: `#0F172A`

**Problemas Identificados:**

- Inconsistencias entre purple e indigo
- Problemas de accesibilidad en algunos contrastes
- Falta de sistema de colores unificado

**Recomendaciones:**

- Unificar en una sola paleta primaria
- Mejorar contrastes para accesibilidad
- Sistema de tokens de color consistente

---

## Resumen de Diseños

### Completados ✅

- Sistema INPUT completo
- Rediseño de ejercicios core v2.0 (9/11 ejercicios)
- Warm-ups cognitivos (7/9 componentes)
- Mejoras UX significativas

### Pendientes ⏳

- Integración warm-ups con MissionFeed
- InteractiveSpeech exercise
- Forge Mandate exercise
- Sistema de colores unificado
- Mejoras de accesibilidad

---

**Nota:** Los documentos originales (`INPUT_SYSTEM_REDESIGN.md`, `EXERCISES_REDESIGN.md`, `WARMUP_IMPLEMENTATION_SUMMARY.md`, `ux-analysis.md`) pueden mantenerse como referencia detallada, pero este documento consolidado proporciona una visión general rápida.
