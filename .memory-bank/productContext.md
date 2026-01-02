# Product Context — Contexto del Producto

> Última actualización: 2025-01-XX

## Visión del Producto

**FrenchA1Airbnb** (ahora **LinguaForge**) es una plataforma de adquisición lingüística gamificada que combina:

- **Krashen** → Input comprensible medido (i+1)
- **Janulus** → Fluidez combinatoria (matrices 4 columnas)
- **Octalysis** → Gamificación centrada en humanos
- **Cognitive Load Theory** → Control de carga cognitiva
- **Ullman's DP Model** → Activación neuronal previa (warm-ups)

**No es un clon de Duolingo. Es algo mejor.**

## Problemas que Resuelve

### 1. Input Comprensible Medido
- **Problema:** Apps tradicionales no miden input real (palabras leídas/escuchadas)
- **Solución:** Sistema de métricas Krashen que rastrea input real
- **Resultado:** Nivel emergente basado en input real, no en XP arbitrario

### 2. Fluidez Combinatoria
- **Problema:** Aprendizaje de frases aisladas sin conexión
- **Solución:** Matrices Janus que permiten generar 256+ combinaciones
- **Resultado:** Automatización neuronal sin traducción mental

### 3. Carga Cognitiva Controlada
- **Problema:** Sobrecarga cognitiva en adultos que "piensan demasiado"
- **Solución:** Calentamientos cognitivos que activan sistemas neuronales específicos
- **Resultado:** Preparación del cerebro para el tipo correcto de aprendizaje

### 4. Contenido Importado por Usuario
- **Problema:** Contenido limitado a lo que la app proporciona
- **Solución:** Sistema INPUT que permite importar video/audio/texto
- **Resultado:** Aprendizaje con contenido real y relevante para el usuario

### 5. Repaso Espaciado Inteligente
- **Problema:** Olvido de vocabulario aprendido
- **Solución:** Sistema SRS (SuperMemo 2) integrado con contenido importado
- **Resultado:** Retención a largo plazo de vocabulario aprendido

## Funcionalidades Principales

### 1. Sistema INPUT
- **Video:** Reproductor YouTube con transcripción sincronizada
- **Audio:** Reproductor de audio con transcripción
- **Texto:** Lector de texto con generación de audio (TTS)
- **Métricas:** Contadores de visualizaciones, escuchas, lecturas
- **Importación:** Creación de nodos desde contenido consumido

### 2. Sistema de Ejercicios
- **Cloze:** Completar palabras faltantes
- **Variations:** Variaciones de frases
- **ConversationalEcho:** Repetición conversacional
- **DialogueIntonation:** Entonación de diálogos
- **JanusComposer:** Matrices combinatorias
- **Detection:** Detección de palabras clave

### 3. Sistema SRS
- **Algoritmo:** SuperMemo 2 (SM-2)
- **Cards:** Generadas automáticamente desde palabras seleccionadas
- **Ejercicios:** Cloze y Detection generados automáticamente
- **Repaso:** Sesiones de repaso con filtros por fuente
- **Dashboard:** Vista de todos los decks y estadísticas

### 4. Sistema de Contenido Importado
- **Nodos:** Estructura jerárquica (Nodo → Subtopic → Phrases)
- **Ejercicios:** Generación automática desde frases
- **Modos:** Academia (training) y Desafío (challenge)
- **Progreso:** Tracking de subtopics completados

### 5. Gamificación
- **XP:** Experiencia por ejercicios completados
- **Coins:** Monedas por input consumido
- **Gems:** Gemas por comprensión validada
- **Streak:** Racha diaria
- **Niveles:** 10 niveles de usuario

## Flujos de Usuario

### Flujo 1: Consumir Contenido y Aprender
```
1. Usuario navega a /input
2. Selecciona tipo (video/audio/texto)
3. Carga o importa contenido
4. Consume contenido (ve/escucha/lee)
5. Selecciona palabras clave del transcript
6. Sistema traduce automáticamente
7. Usuario crea cards SRS
8. Cards agregadas al sistema de repaso
```

### Flujo 2: Repasar Vocabulario
```
1. Usuario navega a /decks
2. Ve todos sus decks organizados por fuente
3. Selecciona "Repasar" en un deck
4. Sistema muestra ejercicios (Cloze/Detection)
5. Usuario responde (again/hard/good/easy)
6. Sistema actualiza algoritmo SM-2
7. Próxima sesión programada automáticamente
```

### Flujo 3: Aprender con Contenido Importado
```
1. Usuario importa contenido (video/audio/texto)
2. Sistema crea nodo con subtopics
3. Usuario navega a /learn/imported/[nodeId]
4. Selecciona subtopic
5. Elige modo (Academia/Desafío)
6. Selecciona tipo de ejercicio
7. Completa ejercicios
8. Sistema actualiza progreso
```

## Diferenciadores vs Competencia

| Aspecto | Duolingo | LinguaForge |
|---------|----------|-------------|
| Metodología | Gamificación pura | Krashen + Janulus + CLT |
| Métricas | XP arbitrario | Input real medido |
| Nivel | Badges decorativos | Estimación cognitiva |
| Combinatoria | No existe | Janus Matrix (256+ frases) |
| Contenido | Limitado | Importación de usuario |
| Repaso | Básico | SRS avanzado (SM-2) |
| Contexto | Frases random | Contenido real y relevante |

## Métricas de Éxito

### Métricas de Usuario
- **Retención:** % de usuarios que regresan después de 7 días
- **Engagement:** Promedio de minutos por sesión
- **Progreso:** Número de palabras aprendidas
- **Streak:** Racha promedio de usuarios activos

### Métricas Técnicas
- **Input medido:** Palabras leídas/escuchadas totales
- **Cards SRS:** Número de cards creadas y revisadas
- **Ejercicios completados:** Por tipo de ejercicio
- **Contenido importado:** Número de nodos creados

## Estructura de Contenido

### Áreas Temáticas A1 (20 áreas)
- A: Llegada y primer contacto
- B: Alojamiento y convivencia
- C: Alimentación y compras
- D: Salud y bienestar
- E: Trabajo y profesión
- F: Vida social y relaciones
- G: Administración y servicios
- H: Situaciones incómodas
- I: Comunicación digital
- J: Cultura y no verbal
- K: Supervivencia lingüística
- L: Ambigüedad y matices
- M: Identidad personal
- N: Seguridad personal
- O: Tiempo y clima
- P: Números y cantidades
- Q: Tiempo y horarios
- R: Descripción física
- S: Ocio y entretenimiento
- T: Familia y relaciones

### ÁREA 0 — Base Absoluta (CRÍTICA)
7 nodos para usuarios con 0 conocimiento:
- NODO 0.1: Saludos y Despedidas
- NODO 0.2: Presentaciones Básicas
- NODO 0.3: Números 0-20
- NODO 0.4: Verbos Clave (être, avoir, aller)
- NODO 0.5: Preguntas Básicas
- NODO 0.6: Cortesía y Agradecimientos
- NODO 0.7: Despedidas y Próximos Pasos

**Ver `MASTER_PLAN.md` FASE 3 para detalles completos.**

## Roadmap de Producto

### Corto Plazo (1-2 meses)
- ✅ Sistema INPUT completo (video/audio/texto)
- ✅ Sistema SRS integrado
- ✅ Generación automática de ejercicios
- ⏳ ÁREA 0 (Base Absoluta) - CRÍTICA
- ⏳ Sistema de misiones con warm-ups
- ⏳ Dashboard mejorado

### Medio Plazo (3-6 meses)
- ⏳ Más tipos de ejercicios
- ⏳ Personalización avanzada
- ⏳ Analytics y métricas de efectividad
- ⏳ Backend completo (Auth + Sync)

### Largo Plazo (6+ meses)
- ⏳ Múltiples idiomas
- ⏳ Contenido generado por IA
- ⏳ Comunidad y compartir contenido
- ⏳ Monetización (última fase)

## Personas

### Persona Principal: Adulto Aprendiendo Francés
- **Edad:** 25-45 años
- **Objetivo:** Aprender francés para viajar/trabajar
- **Motivación:** Contenido práctico y relevante
- **Frustraciones:** Apps que no miden progreso real, contenido limitado

### Persona Secundaria: Estudiante Universitario
- **Edad:** 18-25 años
- **Objetivo:** Aprender francés para estudios
- **Motivación:** Gamificación y progreso visible
- **Frustraciones:** Métodos tradicionales aburridos

## Principios de Diseño

1. **Input First:** El input comprensible es la base del aprendizaje
2. **Medición Real:** Métricas basadas en input real, no en XP arbitrario
3. **Contenido Relevante:** El usuario puede aprender con su propio contenido
4. **Repaso Inteligente:** SRS para retención a largo plazo
5. **Carga Cognitiva Controlada:** Warm-ups para preparar el cerebro
6. **Gamificación Significativa:** Recompensas que reflejan progreso real

## Notas de Producto

### Modo Guiado vs Autónomo
- **Guiado:** Muestra contenido predefinido (A0 francés)
- **Autónomo:** Solo contenido importado por usuario
- **Configuración:** En perfil de usuario

### Fuentes de Contenido
- **YouTube:** Videos con transcripción automática
- **Audio:** Podcasts y archivos de audio
- **Texto:** Artículos, PDFs, texto plano
- **Futuro:** Spotify, Vimeo, más fuentes

### Sistema de Ejercicios
- **Generación automática:** Desde frases importadas
- **Tipos variados:** Cloze, Detection, Variations, Janus, etc.
- **Adaptativo:** Dificultad según nivel del usuario
- **Modos:** Academia (training) y Desafío (challenge)

