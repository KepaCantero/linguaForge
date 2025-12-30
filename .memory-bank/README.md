# Memory Bank — FrenchA1Airbnb WebApp v4.0

Este directorio contiene la documentación de contexto para el desarrollo del proyecto.

## Propósito

El Memory Bank permite:
- Mantener contexto entre sesiones
- Tracking de progreso (27 tareas)
- Referencia rápida de arquitectura
- Documentación de metodologías (Janulus, Krashen, Octalysis)

## Archivos

### Core
| Archivo | Descripción | Cuándo consultar |
|---------|-------------|------------------|
| `projectBrief.md` | Visión v4.0, stack, objetivos | Al inicio de cada sesión |
| `taskProgress.md` | 27 tareas atómicas con código | Para ver qué hacer next |
| `activeContext.md` | Sesión actual de trabajo | Durante el desarrollo |

### Técnicos
| Archivo | Descripción | Cuándo consultar |
|---------|-------------|------------------|
| `schemas.md` | Zod schemas + ejemplos JSON | Al implementar tipos |
| `fileStructure.md` | Arquitectura de directorios | Al crear archivos |
| `techDecisions.md` | Log de decisiones | Al tomar decisiones |

### Metodologías
| Archivo | Descripción | Cuándo consultar |
|---------|-------------|------------------|
| `janulus.md` | Método Janulus (4 columnas) | Tareas 11-13 |
| `octalysis.md` | Gamificación (XP, coins, etc) | Tarea 22 |
| `krashenMethodology.md` | Input comprensible | Tareas 8, 18-21 |

## Cómo Usar

### Al Iniciar Sesión
```bash
# Leer brief del proyecto
cat .memory-bank/projectBrief.md

# Ver estado de tareas
cat .memory-bank/taskProgress.md | head -100

# Ver contexto actual
cat .memory-bank/activeContext.md
```

### Durante el Desarrollo
1. Marcar tarea como `[~]` en progreso
2. Seguir especificaciones exactas de `taskProgress.md`
3. Copiar código de `schemas.md` cuando corresponda
4. Actualizar `activeContext.md` con notas

### Al Finalizar Sesión
1. Marcar tareas completadas `[x]`
2. Actualizar contador en `taskProgress.md`
3. Actualizar `activeContext.md` con próximos pasos

## Estructura del Proyecto (27 Tareas)

```
FASE 0:  [0.1] Constantes
FASE 1:  [1-2] Bootstrap & Shell
FASE 2:  [3-4] Modelos & Schemas
FASE 3:  [5-6] Contenido JSON
FASE 4:  [7-8] Estado Global
FASE 5:  [9-10] Mapa & Progresión
FASE 6:  [11-13] Janulus Matrix ← CORE
FASE 7:  [14-17] Ejercicios
FASE 8:  [18-20] Input Comprensible
FASE 9:  [21] Dashboard
FASE 10: [22] Gamificación
FASE 11: [23-24] Backend
FASE 12: [25] PWA
FASE 13: [26-27] Extensibilidad
```

## Principios de Implementación

1. **Cada tarea es atómica** - Código exacto incluido
2. **Sin decisiones implícitas** - Todo en constants.ts
3. **Validación con Zod** - Nada sin schema
4. **UI specs incluidas** - ASCII mockups en cada tarea
5. **Criterios de éxito claros** - Verificación objetiva

## Quick Reference

### Stack
- Next.js 14 + TypeScript + Tailwind
- Zustand (estado) + Zod (validación)
- Framer Motion (animaciones) + Howler.js (audio)
- Supabase (auth + db) + PWA

### Contenido v1
- Idioma: Francés (fr)
- Nivel: A1
- World: Airbnb
- 1 Janus Matrix + 5 Matrices + 50 frases

### Métricas
- wordsRead, wordsHeard, wordsSpoken
- minutesListened, minutesRead
- XP, coins, gems, streak
