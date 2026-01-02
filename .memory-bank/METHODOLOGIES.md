# Metodologías — Fundamentos Científicos

> Última actualización: 2025-01-XX

Este documento consolida todas las metodologías científicas que fundamentan LinguaForge.

---

## 1. Krashen — Input Comprensible

### Principios Clave

**Adquisición vs. Aprendizaje:**
- **Adquisición:** Internalización subconsciente mediante exposición natural
- **Aprendizaje:** Estudio consciente de reglas gramaticales
- **Prioridad:** Adquisición sobre aprendizaje

**Input Comprensible (i+1):**
- Contenido justo un nivel por encima de la capacidad actual
- Niveles CEFR (A1-C2) con umbrales medidos
- Tracking de input real (leído, escuchado, hablado)

**Umbrales por Nivel:**
| Nivel | Leídas | Escuchadas | Habladas |
|-------|--------|------------|----------|
| A1    | 30,000 | 35,000     | 5,000    |
| A2    | 60,000 | 70,000     | 12,000   |
| B1    | 100,000| 120,000    | 25,000   |

**Filtro Afectivo:**
- Reducir ansiedad mediante entorno positivo
- Errores como oportunidades (XP incluso por respuestas incorrectas)
- Sin bloqueos permanentes de progreso

**Implementación en LinguaForge:**
- Sistema INPUT con tracking de métricas Krashen
- Nivel emergente basado en input real
- Contenido adaptativo según progreso

---

## 2. Janulus — Fluidez Combinatoria

### Concepto

**Matrices de 4 Columnas:**
- Sujeto → Modal → Verbo → Complemento
- 4 columnas × 4 celdas = 256 combinaciones posibles
- 25 repeticiones = automatización neuronal

**Matemáticas:**
- Sin traducción mental
- Procesamiento como patrones, no como reglas
- Activación del sistema procedimental (ganglios basales)

**Implementación:**
- `JanusComposer` exercise
- Generación automática desde frases importadas
- Conjugación automática con `conjugationService.ts`

**Ejemplo:**
```
┌─────────┬─────────┬─────────┬─────────┐
│ SUJETO  │  MODAL  │ ACCIÓN  │ COMPL.  │
├─────────┼─────────┼─────────┼─────────┤
│ Je      │ veux    │ réserver│ chambre │
│ Nous    │ dois    │ voir    │ appart  │
│ Vous    │ peux    │ utiliser│ cuisine │
│ On      │voudrais │ trouver │ clés    │
└─────────┴─────────┴─────────┴─────────┘
```

---

## 3. Octalysis — Gamificación

### Los 8 Core Drives

**White Hat (Positivo):**
- CD1: Significado Épico
- CD2: Logro y Desarrollo (XP, Niveles)
- CD4: Propiedad y Posesión (Coins, Personalización)

**Black Hat (Urgente):**
- CD8: Pérdida y Evitación (Streaks)

**Implementación en LinguaForge:**
- **XP:** Por ejercicios completados
- **Coins:** Por input consumido
- **Gems:** Por comprensión validada
- **Streak:** Constancia diaria
- **Niveles:** 10 niveles de usuario (Débutant → Maître)

**Sistema de Recompensas:**
- Recompensas variables (10% critical surge)
- Efectos de partículas para feedback visual
- Sin penalizaciones severas

---

## 4. Cognitive Load Theory (CLT)

### Tipos de Carga Cognitiva

**Carga Intrínseca:**
- Complejidad inherente del contenido
- Controlada mediante: bloques cortos (30-45s), 1 intención comunicativa por bloque

**Carga Extraña:**
- Ruido visual/decisional
- Controlada mediante: Modo Focus (ocultar HUD durante audio), sin animaciones durante input

**Carga Germana:**
- Esfuerzo constructivo para aprender
- Maximizada mediante: recuperación activa, ejercicios contextuales

**Implementación:**
- `useCognitiveLoadStore` (pendiente)
- Modo Focus automático durante audio
- Gamificación post-cognitiva (XP después, no durante)

---

## 5. Ullman's DP Model — Activación Neuronal Previa

### Concepto: Priming Neuronal

**Problema:**
- Adultos dependen excesivamente del Sistema Declarativo
- Intentan "estudiar" gramática como reglas

**Solución: Warm-ups Cognitivos**
- Activar la zona cerebral correcta ANTES de la misión
- "Caballo de Troya": El usuario cree que está jugando, pero está activando el sistema correcto

**Mapeo:**
- **Gramática** → Ganglios Basales → Rhythm Sequence
- **Vocabulario** → Lóbulo Temporal → Visual Match
- **Pronunciación** → Cerebelo → Voice Imitation

**Implementación:**
- `useWarmupStore` ✅
- `RhythmSequenceWarmup` ✅
- `VisualMatchWarmup` ✅
- `VoiceImitationWarmup` ✅
- Integración con MissionFeed ⏳ (pendiente)

---

## 6. Spaced Repetition (SuperMemo 2)

### Algoritmo SM-2

**Parámetros:**
- Initial ease factor: 2.5
- Minimum ease factor: 1.3
- Maximum interval: 365 días

**Respuestas:**
- Again (0): Repetir inmediatamente
- Hard (1): Intervalo reducido
- Good (2): Intervalo normal
- Easy (3): Intervalo extendido

**Implementación:**
- `useSRSStore` con algoritmo SM-2 ✅
- Cards con metadata completa (fuente, contexto)
- Dashboard SRS (`/decks`) ✅
- Sesiones de repaso (`/decks/review`) ✅

---

## Integración de Metodologías

### Flujo Completo

```
1. Warm-up Cognitivo (Ullman)
   ↓
2. Input Comprensible (Krashen)
   ↓
3. Ejercicios con Control CLT
   ↓
4. Matrices Janus (Combinatoria)
   ↓
5. Repaso Espaciado (SM-2)
   ↓
6. Gamificación (Octalysis)
```

### Sinergias

- **Krashen + Janulus:** Input comprensible → Combinatoria automática
- **CLT + Warm-ups:** Carga controlada + Activación previa
- **SM-2 + Gamificación:** Repaso efectivo + Motivación
- **Octalysis + Krashen:** Métricas reales + Recompensas significativas

---

**Referencias:**
- Krashen, S. (1982). Principles and Practice in Second Language Acquisition
- Janulus, G. (2017). The Janulus Method
- Chou, Y. (2015). Actionable Gamification
- Sweller, J. (1988). Cognitive Load Theory
- Ullman, M. (2001). The Declarative/Procedural Model

