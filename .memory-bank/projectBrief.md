# Project Brief — FrenchA1Airbnb WebApp (v4.0)

## Vision

Plataforma de adquisición lingüística gamificada que combina:

- **Krashen** → Input comprensible (i+1)
- **Janulus** → Fluidez combinatoria (matrices 4 columnas)
- **Octalysis** → Gamificación centrada en humanos

**No es un clon de Duolingo. Es algo mejor.**

## Objetivo Final Verificable

Al completar las 27 tareas:

- [ ] Arquitectura funciona
- [ ] French A1 – Airbnb completo (1 Janus + 5 Matrices)
- [ ] Sistema Janulus operativo (combinatoria + intoning)
- [ ] Input comprensible medido (Krashen real)
- [ ] Dashboard con métricas cognitivas
- [ ] Gamificación Octalysis (XP, coins, gems, streak)
- [ ] PWA instalable y offline
- [ ] Extensible a idiomas y niveles

---

## Stack Tecnológico (FIJO)

### Frontend

| Tecnología    | Versión | Uso             |
| ------------- | ------- | --------------- |
| Next.js       | 14      | App Router, SSR |
| TypeScript    | 5+      | strict mode     |
| Tailwind CSS  | 3+      | estilos         |
| Framer Motion | 10+     | animaciones     |
| Zustand       | 4+      | estado global   |
| Howler.js     | 2.2+    | audio           |
| Fuse.js       | 7+      | búsqueda difusa |

### Backend

| Tecnología        | Uso              |
| ----------------- | ---------------- |
| Supabase Auth     | Magic link email |
| Supabase Postgres | Persistencia     |
| Supabase Storage  | Audio/Video      |

### Infraestructura

| Tecnología | Uso                        |
| ---------- | -------------------------- |
| PWA        | Service Worker + Cache API |
| Zod        | Validación de schemas      |

---

## Flujo Principal de Usuario

```
1. LOGIN
   │
   ▼
2. HOME (World Map)
   │
   ├──► JANUS MATRIX (primero obligatorio)
   │    └── Combinatoria 4 columnas
   │    └── 25 repeticiones para dominar
   │
   ├──► INTONING (opcional)
   │    └── Ritmo por columna
   │    └── 3 ciclos por columna
   │
   ├──► MATRICES 1-5 (secuencial)
   │    └── Cloze → Shadowing → Variations → MiniTask
   │
   ├──► INPUT COMPRENSIBLE
   │    └── Audio/Video/Texto
   │    └── Test de comprensión
   │
   └──► DASHBOARD
        └── Stats Krashen
        └── Nivel emergente
        └── Gamificación
```

---

## Método Janulus (Core del Producto)

### Estructura de Matriz

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

### Matemáticas

- 4 columnas × 4 celdas = **256 combinaciones posibles**
- 25 repeticiones = **automatización neuronal**
- Sin traducción mental

Ver `janulus.md` para detalles completos.

---

## Metodología Krashen

### Métricas de Input

| Contador        | Descripción           |
| --------------- | --------------------- |
| wordsRead       | Palabras leídas       |
| wordsHeard      | Palabras escuchadas   |
| wordsSpoken     | Palabras pronunciadas |
| minutesListened | Tiempo escuchando     |
| minutesRead     | Tiempo leyendo        |

### Umbrales por Nivel

| Nivel | Read   | Heard  | Spoken |
| ----- | ------ | ------ | ------ |
| A1    | 30,000 | 35,000 | 5,000  |
| A2    | 60,000 | 70,000 | 12,000 |

### Nivel Emergente

- No bloquea progreso
- Estimación cognitiva basada en input real
- "A1 bajo", "A1 medio", "A1 alto"

Ver `krashenMethodology.md` para detalles.

---

## Gamificación Octalysis

### Sistema de Recompensas

| Recurso   | Fuente                 |
| --------- | ---------------------- |
| ⭐ XP     | Ejercicios completados |
| 💰 Coins  | Input consumido        |
| 💎 Gems   | Comprensión validada   |
| 🔥 Streak | Constancia diaria      |

### Niveles de Usuario

1. Débutant (0 XP)
2. Curieux (100 XP)
3. Apprenti (300 XP)
4. Explorateur (600 XP)
5. Voyageur (1000 XP)
6. Aventurier (1500 XP)
7. Francophile (2200 XP)
8. Parisien (3000 XP)
9. Expert (4000 XP)
10. Maître (5500 XP)

Ver `octalysis.md` para detalles.

---

## Contenido A1 — Estructura Expandida

### Filosofía

> Cubrir TODA la experiencia humana con otros humanos en francés.

### Estructura jerárquica

```
Nivel (A1/A2/B1/B2)
└── Área (20 áreas: A-T)
    └── Rama (50 ramas por nivel)
        └── Hoja (3-8 hojas por rama)
            └── Lección (JSON con bloques conversacionales)
```

### Estadísticas A1

| Métrica           | Cantidad               |
| ----------------- | ---------------------- |
| Áreas             | 20                     |
| Ramas             | 50                     |
| Hojas (lecciones) | ~209                   |
| Frases estimadas  | ~4000                  |
| Tiempo total      | ~50 horas de contenido |

### Áreas temáticas

| Área | Nombre                     | Ramas |
| ---- | -------------------------- | ----- |
| A    | Llegada y primer contacto  | 5     |
| B    | Alojamiento y convivencia  | 6     |
| C    | Alimentación y compras     | 6     |
| D    | Salud y bienestar          | 5     |
| E    | Trabajo y profesión        | 6     |
| F    | Vida social y relaciones   | 7     |
| G    | Administración y servicios | 5     |
| H    | Situaciones incómodas      | 4     |
| I    | Comunicación digital       | 3     |
| J    | Cultura y no verbal        | 4     |
| K    | Supervivencia lingüística  | 3     |
| L    | Ambigüedad y matices       | 2     |
| M    | Identidad personal         | 3     |
| N    | Seguridad personal         | 2     |
| O    | Tiempo y clima             | 2     |
| P    | Números y cantidades       | 2     |
| Q    | Tiempo y horarios          | 2     |
| R    | Descripción física         | 2     |
| S    | Ocio y entretenimiento     | 3     |
| T    | Familia y relaciones       | 2     |

Ver `contentStructure.md` para detalles completos.
Ver `contentTracking.md` para progreso.

---

## Diferenciadores vs Duolingo

| Aspecto      | Duolingo           | FrenchA1Airbnb             |
| ------------ | ------------------ | -------------------------- |
| Metodología  | Gamificación pura  | Krashen + Janulus          |
| Métricas     | XP arbitrario      | Input real medido          |
| Nivel        | Badges decorativos | Estimación cognitiva       |
| Combinatoria | No existe          | Janus Matrix (256+ frases) |
| Contexto     | Frases random      | Hospitalidad práctica      |
| Offline      | Limitado           | PWA completa               |

---

## Resumen de Tareas (27 total)

| Fase | Tareas | Descripción           |
| ---- | ------ | --------------------- |
| 0    | 1      | Constantes inmutables |
| 1    | 2      | Bootstrap & Shell     |
| 2    | 2      | Modelos & Schemas     |
| 3    | 2      | Contenido JSON        |
| 4    | 2      | Estado global         |
| 5    | 2      | Mapa & Progresión     |
| 6    | 3      | Janulus Matrix        |
| 7    | 4      | Ejercicios clásicos   |
| 8    | 3      | Input comprensible    |
| 9    | 1      | Dashboard             |
| 10   | 1      | Gamificación          |
| 11   | 2      | Backend               |
| 12   | 1      | PWA                   |
| 13   | 2      | Extensibilidad        |

Ver `taskProgress.md` para detalles de cada tarea.
