# Resumen Ejecutivo — LinguaForge (FrenchA1Airbnb)

> Visión general del proyecto y estado actual

**Última actualización:** 2025-01-XX  
**Versión:** v4.0 (Base) + v2.0 (Expansión)

---

## Visión del Proyecto

**LinguaForge** es una plataforma de adquisición lingüística gamificada que combina:

1. **Krashen** → Input comprensible (i+1) con métricas reales
2. **Janulus** → Fluidez combinatoria mediante matrices de 4 columnas
3. **Octalysis** → Gamificación centrada en humanos (White Hat)
4. **Solo Leveling** → Sistema de rangos épico para adherencia extrema
5. **Microaprendizaje** → Sesiones de 2-5 minutos con alta tasa de finalización

**Diferenciador clave:** No es un clon de Duolingo. Es una plataforma basada en ciencia cognitiva y neurociencia del lenguaje.

---

## Estado Actual

### v4.0 (Plan Base) — 81% Completado

**22/27 tareas completadas**

✅ **Completado:**
- Arquitectura base (Next.js 14, TypeScript, Tailwind)
- Sistema de stores (Zustand) con persistencia
- Método Janulus completo (matrices + intoning)
- 4 ejercicios clásicos (Cloze, Shadowing, Variations, MiniTask)
- Sistema de input comprensible con tracking Krashen
- Dashboard con métricas cognitivas
- Gamificación Octalysis (XP, coins, gems, streak)
- Tests unitarios (51 tests pasando)

⏳ **Pendiente:**
- Supabase Auth (Tarea 23)
- Sync Service (Tarea 24)
- Service Worker PWA (Tarea 25)
- Contenido A2 Francés (Tarea 26)
- Contenido Alemán A1 (Tarea 27)

### v2.0 (Expansión LinguaForge) — 0% Completado

**0/14 tareas completadas**

**Nuevas características:**
1. **Sistema de Rangos Solo Leveling** (E → S)
2. **6 Ejercicios Core del GDD:**
   - Shard Detection (Flash Comprehension)
   - Echo Stream (Narrative Surf)
   - Glyph Weaving (Synapse Beat)
   - Pragma Strike (Context Snap)
   - Resonance Path (Voice Paint)
   - Forge Mandate (Daily Heist)
3. **Daily Directives** con sistema de HP
4. **Microaprendizaje** optimizado

---

## Arquitectura Técnica

### Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router, SSR)
- React 18 (Concurrent rendering)
- TypeScript 5+ (Strict mode)
- Tailwind CSS 3+ (Utility-first)
- Framer Motion 12+ (Animaciones)

**Estado y Persistencia:**
- Zustand 5+ (Estado global)
- LocalStorage (Persistencia automática)
- Service Workers (PWA offline)

**Multimedia:**
- Howler.js 2.2+ (Audio)
- Web Audio API (Análisis)
- Canvas API (Visualizaciones)

**Validación:**
- Zod 4+ (Schemas TypeScript-first)
- Fuse.js 7+ (Búsqueda difusa)

**Backend (Pendiente):**
- Supabase Auth (Magic link)
- Supabase Postgres (Persistencia)
- Supabase Storage (Audio/Video)

---

## Metodologías Implementadas

### 1. Krashen (Input Comprensible)

**Métricas reales:**
- Palabras leídas/escuchadas/habladas por nivel
- Umbrales CEFR (A1-C2) medidos
- Nivel emergente basado en input real

**Umbrales A1:**
- 30,000 palabras leídas
- 35,000 palabras escuchadas
- 5,000 palabras habladas

### 2. Janulus (Fluidez Combinatoria)

**Matrices de 4 columnas:**
- Sujeto, Razón/Modal, Acción/Verbo, Circunstancia/Complemento
- 4-6 elementos por columna = 256-1,296 combinaciones
- Target: 25 repeticiones para automatización neuronal

**Intoning:**
- 3 ciclos de repetición rítmica
- Sincronización oído-cerebro-voz
- Velocidades ajustables (0.75x, 1.0x, 1.25x)

### 3. Octalysis (Gamificación)

**Sistema de recompensas:**
- ⭐ XP por ejercicios completados
- 💰 Coins por input consumido
- 💎 Gems por comprensión validada
- 🔥 Streak por constancia diaria

**Niveles:**
1. Débutant (0 XP)
2. Curieux (100 XP)
3. Apprenti (300 XP)
4. Explorateur (600 XP)
5. Voyageur (1,000 XP)
6. Aventurier (1,500 XP)
7. Francophile (2,200 XP)
8. Parisien (3,000 XP)
9. Expert (4,000 XP)
10. Maître (5,500 XP)

### 4. Solo Leveling (v2.0 - Pendiente)

**Rangos de cazador:**
- E: Novato (0-500 XP)
- D: Aprendiz (500-1,500 XP)
- C: Competente (1,500-3,000 XP)
- B: Experto (3,000-5,000 XP)
- A: Maestro (5,000-8,000 XP)
- S: Leyenda Lingüística (8,000+ XP)

**Desbloqueo de contenido basado en rango**

---

## Ejercicios Implementados

### Ejercicios Clásicos (v4.0) ✅

1. **Cloze Exercise**
   - Completar hueco en frase
   - 4 opciones múltiples
   - Feedback inmediato

2. **Shadowing Exercise**
   - Repetir audio nativo
   - 2 escuchas requeridas
   - Tracking de pronunciación

3. **Variations Exercise**
   - Leer variantes de frases
   - Expansión de vocabulario
   - Contexto múltiple

4. **MiniTask Exercise**
   - Producción escrita libre
   - Keywords requeridas (50% mínimo)
   - Validación con Fuse.js

### Ejercicios Core (v2.0 - Pendientes) ⏳

1. **Shard Detection**
   - Audio 3-8s + 3 imágenes
   - Comprensión flash
   - Timer con presión temporal

2. **Echo Stream**
   - Seguimiento de onda de audio
   - Detección de Power Words
   - Gestos táctiles

3. **Glyph Weaving**
   - Conexión de glifos en matriz 4x4
   - Sincronización con beat musical
   - Efectos de resonancia visual

4. **Pragma Strike**
   - Situaciones sociales
   - Selección de frase más cortés
   - Competencia pragmática

5. **Resonance Path**
   - Shadowing con visualización de entonación
   - Comparación con nativo
   - Mejora de prosodia

6. **Forge Mandate**
   - Orquestador de ejercicios diarios
   - Narrativa de misión
   - 3 ejercicios aleatorios encadenados

---

## Contenido Actual

### Mundo: French A1 - Airbnb ✅

**Estructura:**
- 1 Janus Matrix (16-20 palabras clave)
- 5 Matrices contextuales:
  1. Check-in
  2. Habitación
  3. Cocina
  4. Problemas
  5. Check-out
- 50 frases con ejercicios
- 5 MiniTasks
- Input comprensible (audio/video/texto)

### Contenido Pendiente ⏳

- French A2 (Tarea 26)
- German A1 (Tarea 27)
- Contenido para nuevos ejercicios v2.0 (Tareas 39-41)

---

## Roadmap de Implementación

### Fase Actual: Completar v4.0

**Prioridad Alta:**
1. Service Worker PWA (Tarea 25)
2. Supabase Auth (Tarea 23)
3. Sync Service (Tarea 24)

**Prioridad Media:**
4. Contenido A2 Francés (Tarea 26)
5. Contenido Alemán A1 (Tarea 27)

### Fase Siguiente: Expansión v2.0

**Sprint 1: Sistema de Rangos**
- Tarea 28: Sistema de Rangos (E-S)
- Tarea 29: UI de Rangos

**Sprint 2: Ejercicios Core (Parte 1)**
- Tarea 31: Shard Detection
- Tarea 33: Pragma Strike
- Tareas 39-40: Contenido

**Sprint 3: Ejercicios Core (Parte 2)**
- Tarea 32: Resonance Path
- Tarea 34: Echo Stream
- Tarea 35: Glyph Weaving
- Tarea 41: Contenido

**Sprint 4: Daily Directives**
- Tarea 30: Sistema de HP
- Tarea 37: Sistema de Misiones
- Tarea 38: Integración HP-Misiones
- Tarea 36: Forge Mandate

---

## Métricas de Éxito

### Métricas de Usuario (Targets)

- **Tasa de finalización de sesiones:** >85%
- **Tiempo promedio de sesión:** 3-5 minutos
- **Streak promedio:** >7 días
- **Ejercicios completados por día:** >5

### Métricas de Aprendizaje

- **Progreso de input Krashen:** Palabras leídas/escuchadas/habladas
- **Dominio de matrices Janus:** % de combinaciones completadas
- **Precisión en ejercicios:** >80%
- **Mejora de prosodia:** Medición mediante Resonance Path

### Métricas Técnicas

- **Tiempo de carga inicial:** <2s
- **Tiempo de carga de ejercicios:** <1s
- **Tasa de errores:** <1%
- **Compatibilidad offline:** 100% de funcionalidad core

---

## Diferenciadores vs. Competencia

| Aspecto | Duolingo | LinguaForge |
|---------|----------|-------------|
| Metodología | Gamificación pura | Krashen + Janulus + Neurociencia |
| Métricas | XP arbitrario | Input real medido (Krashen) |
| Nivel | Badges decorativos | Estimación cognitiva emergente |
| Combinatoria | No existe | Janus Matrix (256+ frases) |
| Contexto | Frases random | Situaciones prácticas reales |
| Ejercicios | Tradicionales | 6 ejercicios core innovadores |
| Offline | Limitado | PWA completa |
| Rangos | No existe | Sistema Solo Leveling (E-S) |
| Microaprendizaje | No optimizado | Sesiones 2-5 min diseñadas |

---

## Archivos Clave del Proyecto

### Memory Bank
```
.memory-bank/
├── architectureStrategy.md  # Plan Maestro v2.0 completo
├── tasksV2.md               # 14 nuevas tareas v2.0
├── projectBrief.md          # Visión y objetivos v4.0
├── taskProgress.md          # Estado de 27 tareas v4.0
├── activeContext.md          # Contexto actual
└── [metodologías].md        # Documentación técnica
```

### Código Fuente
```
src/
├── app/                     # Next.js App Router
├── components/              # Componentes React
│   ├── exercises/          # Ejercicios (4 implementados)
│   ├── janus/              # Matrices Janus
│   └── input/              # Input comprensible
├── store/                   # Zustand stores
├── services/                # Lógica de negocio
├── schemas/                 # Validación Zod
└── lib/                     # Utilidades y constantes
```

---

## Próximos Pasos Inmediatos

1. **Completar v4.0:**
   - Implementar Service Worker para PWA
   - Integrar Supabase Auth
   - Crear Sync Service

2. **Iniciar v2.0:**
   - Implementar sistema de rangos Solo Leveling
   - Crear primeros ejercicios core (Shard Detection, Pragma Strike)
   - Desarrollar Daily Directives con HP

3. **Contenido:**
   - Expandir contenido A1
   - Crear contenido A2
   - Preparar contenido para nuevos ejercicios

---

**Fin del Resumen Ejecutivo**

