# Estrategia de Arquitectura y Diseño: LinguaForge (Plan Maestro v2.0)

> Documento maestro que detalla la convergencia entre adquisición de lenguas, diseño de comportamiento inspirado en "Solo Leveling" y ingeniería multimedia para la WebApp FrenchA1Airbnb.

**Versión:** 2.0  
**Fecha:** 2025-01-XX  
**Estado:** Estrategia expandida - Implementación pendiente

---

## I. Fundamentos de Adquisición Lingüística

### 1.1 Adquisición vs. Aprendizaje (Krashen)

El sistema se basa en la distinción fundamental de Stephen Krashen entre **adquisición** (subconsciente) y **aprendizaje** (consciente):

- **Adquisición**: Internalización subconsciente del lenguaje mediante exposición natural
- **Aprendizaje**: Estudio consciente de reglas gramaticales y vocabulario

**Prioridad:** Adquisición sobre aprendizaje. El sistema minimiza explicaciones gramaticales y maximiza la exposición a input comprensible.

### 1.2 Input Comprensible (i+1)

**Principio:** El contenido se sitúa justo un nivel por encima de la capacidad actual del usuario.

**Implementación técnica:**

- Niveles CEFR (A1-C2) con umbrales de palabras medidos
- Sistema de tracking de input (leído, escuchado, hablado)
- Estimación de nivel emergente basada en métricas Krashen
- Contenido adaptativo que ajusta dificultad según progreso

**Umbrales por nivel:**
| Nivel | Leídas | Escuchadas | Habladas |
|-------|--------|------------|----------|
| A1 | 30,000 | 35,000 | 5,000 |
| A2 | 60,000 | 70,000 | 12,000 |
| B1 | 100,000| 120,000 | 25,000 |

### 1.3 Filtro Afectivo

**Objetivo:** Reducir la ansiedad mediante un entorno de juego "White Hat" (positivo, no punitivo).

**Mecánicas implementadas:**

- Sistema de recompensas sin penalizaciones severas
- Errores como oportunidades de aprendizaje (XP incluso por respuestas incorrectas)
- Sin bloqueos permanentes de progreso
- Feedback positivo constante

---

## II. El Método Janulus y la Fluidez Combinatoria

### 2.1 Encharting (Powell Janulus)

**Concepto:** Generación de automaticidad neuronal mediante matrices combinatorias.

**Estructura:**

- Matriz de 4 columnas (Sujeto, Razón/Modal, Acción/Verbo, Circunstancia/Complemento)
- 4-6 elementos por columna = 256-1,296 combinaciones posibles
- Target: 25 repeticiones únicas para automatización neuronal

**Neurociencia:**

- Activa áreas motoras del lenguaje (Broca)
- Crea conexiones directas sin traducción mental
- Mejora la fluidez combinatoria (capacidad de generar frases nuevas)

### 2.2 Intoning: Sincronización Multisensorial

**Técnica:** Repetición rítmica de palabras para sincronizar:

- Oído (procesamiento auditivo)
- Cerebro (memoria de trabajo)
- Aparato fonador (producción motora)

**Implementación:**

- 3 ciclos de repetición por columna
- Velocidades ajustables (0.75x, 1.0x, 1.25x)
- Visualización de palabras con audio sincronizado

**Efectos neurocientíficos:**

- Estimula ganglios basales (automatización motora)
- Mejora prosodia y entonación nativa
- Reduce acento extranjero mediante imitación rítmica

---

## III. El Sistema de Progresión "Solo Leveling"

### 3.1 Concepto: Cazador Lingüístico

**Inspiración:** Sistema de rangos del manhwa "Solo Leveling" adaptado para adquisición lingüística.

**Objetivo:** Generar adherencia extrema en Generación Z mediante:

- Progresión visible y tangible
- Narrativa épica de crecimiento
- Rangos prestigiosos que reflejan dominio real

### 3.2 Rangos de Cazador

| Rango | Nombre              | Requisitos                        | Características                |
| ----- | ------------------- | --------------------------------- | ------------------------------ |
| E     | Novato              | 0-500 XP                          | Acceso básico a contenido A1   |
| D     | Aprendiz            | 500-1,500 XP                      | Desbloquea matrices avanzadas  |
| C     | Competente          | 1,500-3,000 XP                    | Acceso a contenido A2          |
| B     | Experto             | 3,000-5,000 XP                    | Desbloquea contenido B1        |
| A     | Maestro             | 5,000-8,000 XP                    | Acceso completo a contenido B2 |
| S     | Leyenda Lingüística | 8,000+ XP + Dominio de 2+ idiomas | Acceso a contenido C1/C2       |

**Implementación técnica:**

- Sistema de rangos independiente pero complementario a niveles Octalysis
- Badges visuales distintivos por rango
- Desbloqueo de contenido basado en rango
- Tablero de clasificación por rango (futuro)

### 3.3 Daily Directives (Misiones Diarias)

**Mecánica:** Misiones diarias obligatorias que mantienen el compromiso.

**Tipos de misiones:**

1. **Input Mission**: Consumir X minutos de input comprensible
2. **Janus Mission**: Completar Y combinaciones en matriz Janus
3. **Exercise Mission**: Completar Z ejercicios de cualquier tipo
4. **Streak Mission**: Mantener racha de N días consecutivos

**Sistema de penalizaciones:**

- **HP (Salud)**: Se reduce si no se completan misiones diarias
- **HP mínimo**: 0 HP bloquea acceso a contenido premium
- **Recuperación**: Completar misiones restaura HP gradualmente

**Sistema de recompensas:**

- **XP**: Por completar misiones
- **Coins**: Moneda virtual para mercado futuro
- **Gems**: Recompensas especiales por misiones perfectas

---

## IV. Dinámicas de Microaprendizaje

### 4.1 Sesiones Ultra-Cortas (2-5 minutos)

**Principio:** Fragmentar el aprendizaje en unidades mínimas de tiempo.

**Evidencia científica:**

- Microaprendizaje: 80-90% tasa de finalización
- Cursos tradicionales: ~20% tasa de finalización
- Memoria de trabajo: ~7 elementos simultáneos máximo

**Implementación:**

- Cada ejercicio diseñado para completarse en <5 minutos
- Sesiones diarias recomendadas: 3-5 micro-sesiones
- Progreso guardado automáticamente entre sesiones

### 4.2 Fragmentación Cognitiva

**Estrategia:** Respetar límites de memoria de trabajo.

**Aplicación:**

- Máximo 4 opciones en ejercicios de selección múltiple
- Máximo 7 elementos en listas visuales
- Pausas automáticas cada 3-4 ejercicios
- Feedback inmediato para liberar carga cognitiva

---

## V. Documento de Diseño de Juego (GDD): Los 6 Ejercicios Core

### 5.1 Shard Detection (Flash Comprehension)

**Mecánica:**

- Audio de 3-8 segundos
- 3 LinguaShards (imágenes) mostradas simultáneamente
- Usuario debe identificar el fragmento correcto antes de que se agote el tiempo
- Timer visual con presión temporal

**Neurociencia:**

- Fortalece memoria de trabajo auditiva
- Mejora procesamiento rápido de input comprensible
- Activa área de Wernicke (comprensión)

**Implementación técnica:**

- Componente: `ShardDetectionExercise.tsx`
- Audio con Howler.js
- Timer con Framer Motion
- Sistema de scoring basado en velocidad y precisión

**XP y recompensas:**

- Correcto rápido (<3s): 20 XP
- Correcto normal: 15 XP
- Incorrecto: 5 XP (aprendizaje)

### 5.2 Echo Stream (Narrative Surf)

**Mecánica:**

- Usuario mantiene el dedo en pantalla siguiendo una onda de audio
- Debe deslizar rápidamente al escuchar "Power Words" (palabras clave contextuales)
- Onda visual representa la amplitud del audio
- Fallar en detectar Power Word reduce puntuación

**Neurociencia:**

- Activa atención sostenida
- Mejora detección de patrones fonéticos
- Entrena reconocimiento de palabras clave en contexto

**Implementación técnica:**

- Componente: `EchoStreamExercise.tsx`
- Canvas API para visualización de onda
- Touch events para seguimiento
- Análisis de audio para detectar Power Words

**XP y recompensas:**

- Power Words detectadas: 10 XP cada una
- Completar stream completo: 30 XP bonus
- Precisión >90%: 10 gems adicionales

### 5.3 Glyph Weaving (Synapse Beat)

**Mecánica:**

- Conectar glifos en una matriz 4x4 siguiendo un pulso musical (BPM)
- Acertar en el golpe del beat otorga doble puntuación
- Efectos de "resonancia" visual cuando se sincroniza con el beat
- Patrones de conexión generados proceduralmente

**Neurociencia:**

- El ritmo estimula ganglios basales
- Facilita automatización motora del habla
- Mejora coordinación oído-mano-voz

**Implementación técnica:**

- Componente: `GlyphWeavingExercise.tsx`
- Web Audio API para análisis de BPM
- Canvas para matriz de glifos
- Sistema de sincronización temporal preciso

**XP y recompensas:**

- Conexión en beat: 15 XP (doble)
- Conexión fuera de beat: 7 XP
- Completar patrón completo: 50 XP
- Sincronización perfecta (>95%): 20 gems

### 5.4 Pragma Strike (Context Snap)

**Mecánica:**

- Foto de una situación social ambigua
- Usuario tiene 5 segundos para elegir la frase más cortés (pragmática) en francés
- 3-4 opciones contextualmente similares pero con diferencias sutiles de cortesía
- Feedback explicando por qué una opción es más apropiada

**Neurociencia:**

- Activa memoria episódica
- Vincula lenguaje a emociones y contextos sociales reales
- Mejora competencia pragmática (uso social del lenguaje)

**Implementación técnica:**

- Componente: `PragmaStrikeExercise.tsx`
- Imágenes de situaciones sociales reales
- Timer de 5 segundos con presión visual
- Sistema de explicaciones contextuales

**XP y recompensas:**

- Correcto rápido (<3s): 25 XP
- Correcto normal: 20 XP
- Incorrecto: 10 XP + explicación educativa

### 5.5 Resonance Path (Voice Paint)

**Mecánica:**

- Shadowing visual donde el usuario debe "pintar" con su voz sobre una trayectoria de entonación nativa
- Visualización de curva de entonación del hablante nativo
- Usuario graba su voz y ve su curva superpuesta
- Feedback visual de precisión de entonación

**Neurociencia:**

- Mejora prosodia y fluidez
- Estudios indican elevación de competencia fonológica de "Baja" a "Muy Fluida" en 4 semanas
- Activa áreas motoras y auditivas simultáneamente

**Implementación técnica:**

- Componente: `ResonancePathExercise.tsx`
- Web Audio API para análisis de frecuencia
- Canvas para visualización de curvas de entonación
- Comparación algoritmo de similitud de curvas

**XP y recompensas:**

- Sincronización >80%: 30 XP
- Sincronización >90%: 50 XP + 10 gems
- Mejora progresiva: Bonus de streak

### 5.6 The Forge Mandate (Daily Heist)

**Mecánica:**

- Misión diaria que encadena 3 ejercicios aleatorios bajo una narrativa de espionaje o supervivencia
- Cada ejercicio completado revela parte de la historia
- Completar la misión diaria otorga recompensas especiales
- Dificultad adaptativa según nivel del usuario

**Neurociencia:**

- Combate curva del olvido mediante repetición espaciada
- Compromiso intrínseco mediante narrativa
- Variedad de ejercicios previene aburrimiento

**Implementación técnica:**

- Componente: `ForgeMandateExercise.tsx`
- Sistema de selección aleatoria de ejercicios
- Narrativa procedural basada en progreso
- Sistema de recompensas diarias únicas

**XP y recompensas:**

- Completar misión diaria: 100 XP + 50 coins + 20 gems
- Bonus por completar en <15 minutos: 50 XP adicional
- Streak de misiones diarias: Bonus exponencial

---

## VI. Arquitectura Técnica Recomendada

### 6.1 Frontend

**Stack actual (confirmado):**

- **Next.js 14**: App Router, SSR, optimizaciones automáticas
- **React 18**: Concurrent rendering, Suspense
- **TypeScript 5+**: Strict mode, type safety
- **Tailwind CSS 3+**: Utility-first, dark mode
- **Framer Motion 12+**: Animaciones fluidas, gestos

**Justificación:**

- Carga instantánea mediante SSR y optimizaciones de Next.js
- Renderizado concurrente mejora percepción de velocidad
- Type safety reduce bugs en lógica compleja de gamificación

### 6.2 Estado Global

**Stack actual:**

- **Zustand 5+**: Estado global ligero
- **Persist middleware**: LocalStorage automático
- **Arquitectura basada en eventos**: Reducciones puras

**Ventajas:**

- Sin boilerplate comparado con Redux
- Persistencia automática sin configuración adicional
- Fácil testing de lógica de negocio

### 6.3 Persistencia y Offline

**Stack actual:**

- **PWA**: Service Workers + Cache API
- **LocalStorage**: Para estado de usuario
- **IndexedDB**: Para almacenamiento de audios grandes (futuro)

**Estrategia de caché:**

- Audios precargados para ejercicios activos
- Contenido JSON en caché permanente
- Sincronización con backend cuando hay conexión

### 6.4 Validación y Búsqueda

**Stack actual:**

- **Zod 4+**: Validación de schemas TypeScript-first
- **Fuse.js 7+**: Búsqueda difusa para tolerar errores tipográficos

**Aplicación:**

- Validación de contenido JSON con Zod
- Búsqueda de frases con tolerancia a errores
- Autocompletado inteligente en ejercicios

### 6.5 Audio y Multimedia

**Stack actual:**

- **Howler.js 2.2+**: Reproducción de audio multiplataforma
- **Web Audio API**: Análisis de frecuencia, visualización
- **Canvas API**: Visualizaciones de ondas y glifos

**Futuro:**

- **Web Speech API**: Reconocimiento de voz para ejercicios de pronunciación
- **MediaRecorder API**: Grabación de voz del usuario

---

## VII. Integración con Sistema Actual

### 7.1 Ejercicios Existentes vs. Nuevos

**Ejercicios actuales (v4.0):**

- ✅ Cloze Exercise (completar hueco)
- ✅ Shadowing Exercise (repetir audio)
- ✅ Variations Exercise (leer variantes)
- ✅ MiniTask Exercise (producción escrita)

**Nuevos ejercicios (v2.0 - pendientes):**

- ⏳ Shard Detection (Flash Comprehension)
- ⏳ Echo Stream (Narrative Surf)
- ⏳ Glyph Weaving (Synapse Beat)
- ⏳ Pragma Strike (Context Snap)
- ⏳ Resonance Path (Voice Paint) - Evolución de Shadowing
- ⏳ Forge Mandate (Daily Heist) - Orquestador de ejercicios

### 7.2 Sistema de Rangos Solo Leveling

**Estado actual:**

- ✅ Sistema de niveles Octalysis (Débutant → Maître)
- ⏳ Sistema de rangos Solo Leveling (E → S)

**Integración:**

- Rangos complementan niveles Octalysis
- Rangos determinan desbloqueo de contenido
- Niveles determinan progreso dentro del rango

### 7.3 Daily Directives

**Estado actual:**

- ✅ Sistema de streaks diarios
- ⏳ Sistema de HP (Salud)
- ⏳ Misiones diarias estructuradas

**Implementación futura:**

- Daily Directives como capa sobre streaks existentes
- HP como métrica adicional de compromiso
- Sistema de penalizaciones suaves (no bloqueantes)

---

## VIII. Roadmap de Implementación

### Fase 1: Sistema de Rangos (Prioridad Alta)

1. Implementar sistema de rangos E-S
2. Integrar con sistema de niveles existente
3. Crear UI de badges de rango
4. Sistema de desbloqueo basado en rango

### Fase 2: Ejercicios Core (Prioridad Media-Alta)

1. Shard Detection (más simple, buen punto de entrada)
2. Resonance Path (evolución de Shadowing existente)
3. Pragma Strike (alto valor educativo)
4. Echo Stream (requiere análisis de audio)
5. Glyph Weaving (más complejo técnicamente)
6. Forge Mandate (orquestador final)

### Fase 3: Daily Directives (Prioridad Media)

1. Sistema de HP
2. Misiones diarias estructuradas
3. Sistema de penalizaciones suaves
4. Narrativa de misiones

### Fase 4: Optimizaciones (Prioridad Baja)

1. IndexedDB para audios grandes
2. Web Speech API para reconocimiento
3. MediaRecorder para grabación
4. Análisis avanzado de audio

---

## IX. Métricas de Éxito

### 9.1 Métricas de Usuario

- **Tasa de finalización de sesiones**: Target >85%
- **Tiempo promedio de sesión**: Target 3-5 minutos
- **Streak promedio**: Target >7 días
- **Ejercicios completados por día**: Target >5

### 9.2 Métricas de Aprendizaje

- **Progreso de input Krashen**: Palabras leídas/escuchadas/habladas
- **Dominio de matrices Janus**: % de combinaciones completadas
- **Precisión en ejercicios**: Target >80%
- **Mejora de prosodia**: Medición mediante Resonance Path

### 9.3 Métricas Técnicas

- **Tiempo de carga inicial**: Target <2s
- **Tiempo de carga de ejercicios**: Target <1s
- **Tasa de errores**: Target <1%
- **Compatibilidad offline**: Target 100% de funcionalidad core

---

## X. Referencias y Evidencia Científica

### 10.1 Adquisición Lingüística

- Krashen, S. (1982). _Principles and Practice in Second Language Acquisition_
- Krashen, S. (1985). _The Input Hypothesis: Issues and Implications_

### 10.2 Método Janulus

- Janulus, P. (2012). _Language Learning: The Janulus Method_

### 10.3 Microaprendizaje

- Hug, T. (2005). _Microlearning: A New Pedagogical Challenge_
- Torgerson, C. (2003). _The Promise of E-Learning_

### 10.4 Gamificación

- Chou, Y. (2015). _Octalysis: Complete Gamification Framework_
- Deterding, S. (2011). _Gamification: Using Game Design Elements_

---

## XI. Notas de Diseño

### 11.1 Principios de UX

1. **Feedback inmediato**: Cada acción tiene respuesta visual/auditiva instantánea
2. **Progreso visible**: Barras, porcentajes, badges siempre visibles
3. **Sin bloqueos**: El usuario siempre puede avanzar, aunque sea lentamente
4. **Micro-recompensas**: XP, coins, gems por acciones pequeñas
5. **Narrativa épica**: Sensación de crecimiento y dominio

### 11.2 Accesibilidad

- Soporte para lectores de pantalla
- Contraste de colores WCAG AA mínimo
- Tamaños de texto ajustables
- Modo oscuro nativo
- Controles de teclado para todas las funciones

### 11.3 Internacionalización

- Sistema preparado para múltiples idiomas
- Contenido separado de código
- Traducciones de UI en archivos JSON
- Formato de fecha/hora localizado

---

**Fin del documento**
