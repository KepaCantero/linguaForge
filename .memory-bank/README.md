# Memory Bank — LinguaForge v5.1

> Última actualización: 2026-01-01

Este directorio contiene la documentación de contexto para el desarrollo del proyecto.

## Estado del Proyecto

- **Progreso técnico:** ~45% completado (22/49 tareas)
- **Arquitectura core:** Completada
- **Sistema INPUT:** MVP implementado (SRS + YouTube + Transcripts)
- **Ejercicios:** En rediseño (ver EXERCISES_REDESIGN.md)

---

## Archivos Principales

### Core (Leer al inicio de cada sesión)
| Archivo | Descripción |
|---------|-------------|
| `projectBrief.md` | Visión, stack, objetivos |
| `taskProgress.md` | 49 tareas con estado |
| `activeContext.md` | Notas de sesión actual |

### Diseño y Arquitectura
| Archivo | Descripción |
|---------|-------------|
| `architectureStrategy.md` | Estrategia de arquitectura |
| `INPUT_SYSTEM_REDESIGN.md` | **Sistema INPUT completo (SRS, Video, etc.)** |
| `EXERCISES_REDESIGN.md` | **Rediseño de ejercicios Audio/Habla/Matrices** |
| `ux-analysis.md` | Análisis UX detallado |

### Contenido
| Archivo | Descripción |
|---------|-------------|
| `contentStructure.md` | 50 ramas, 209 hojas A1 |
| `contentTracking.md` | Progreso de creación de contenido |
| `TAREAS_AREA_0_Y_EXPANSIONES.md` | ÁREA 0 (Base Absoluta) |

### Metodologías
| Archivo | Descripción |
|---------|-------------|
| `janulus.md` | Método Janulus (4 columnas) |
| `krashenMethodology.md` | Input comprensible |
| `octalysis.md` | Gamificación |

### Referencia Técnica
| Archivo | Descripción |
|---------|-------------|
| `schemas.md` | Zod schemas + ejemplos JSON |
| `fileStructure.md` | Arquitectura de directorios |
| `techDecisions.md` | Log de decisiones técnicas |

### Análisis Visual
| Archivo | Descripción |
|---------|-------------|
| `ANALISIS_PALETA_COLORES.md` | Paleta de colores del proyecto |

---

## Stack Tecnológico

```
Frontend:  Next.js 14 + TypeScript + Tailwind
Estado:    Zustand (persist)
Validación: Zod
Animaciones: Framer Motion
Audio:     Web Audio API
Backend:   Supabase (auth + db)
```

---

## Sistemas Implementados

### Sistema INPUT (MVP Completo)
- SRS con algoritmo SM-2
- YouTube Player con tracking
- Transcript interactivo con guardado SRS
- Input Hub con métricas

### Ejercicios Core
- Cloze (rellenar huecos)
- Variations (variaciones de frase)
- PragmaStrike (comunicación situacional)
- ShardDetection (reconocimiento audio)
- EchoStream (repetición de palabras clave)
- GlyphWeaving (patrones rítmicos)

### Gamificación
- XP, Coins, Gems
- Streaks con freeze
- Ranks (E → S)
- Misiones diarias

---

## Próximos Pasos Prioritarios

1. **Rediseño de ejercicios** (EXERCISES_REDESIGN.md)
   - Unificar Audio + Repetición
   - Mejorar práctica oral interactiva
   - Rediseñar Matrices Janus

2. **Contenido ÁREA 0** (7 nodos críticos)
   - Saludos, Números, Verbos clave, etc.

3. **Supabase Auth** (Tarea 23)

---

## Quick Commands

```bash
# Desarrollo
npm run dev

# Tests
npm run test

# Build
npm run build
```
