# Plan Maestro — LinguaForge

> Última actualización: 2025-01-XX  
> Versión: 1.0 Unificado

## Visión del Proyecto

**LinguaForge** es una plataforma de **entrenamiento cognitivo** y **desbloqueo neuronal** que combina:
- **Krashen** → Input comprensible medido (i+1) con visualización de "irrigación neuronal"
- **Janulus** → Fluidez combinatoria (matrices 4 columnas) con navegación optimizada
- **Cognitive Load Theory** → Control de carga cognitiva mediante entrenamiento adaptativo
- **Ullman's DP Model** → Activación neuronal previa (warm-ups) para preparar sistemas cerebrales
- **Octalysis** → Gamificación centrada en humanos con narrativa de transformación biológica
- **Neurodiseño Educativo** → Visualización del "Músculo Cognitivo" y métricas de neuroplasticidad

## Estado Actual del Proyecto

### ✅ Completado (85%)

#### Sistema INPUT Completo
- ✅ Hub INPUT (`/input`)
- ✅ Reproductor de Video (YouTube con transcripciones)
- ✅ Reproductor de Audio
- ✅ Lector de Texto (con TTS)
- ✅ Tracking de métricas (visualizaciones, escuchas, lecturas)
- ✅ Extracción automática de transcripciones

#### Sistema SRS (Spaced Repetition)
- ✅ Algoritmo SuperMemo 2 (SM-2)
- ✅ Dashboard SRS (`/decks`)
- ✅ Sesiones de repaso (`/decks/review`)
- ✅ Extracción de palabras clave
- ✅ Generación automática de ejercicios (Cloze/Detection)
- ✅ Traducción automática
- ✅ Diccionario de palabras estudiadas

#### Sistema de Contenido Importado
- ✅ Nodos importados con estructura jerárquica
- ✅ Generación de ejercicios desde frases
- ✅ Modos Academia y Desafío
- ✅ 5 tipos de ejercicios generados automáticamente

#### Ejercicios Core
- ✅ Cloze, Variations, ConversationalEcho, DialogueIntonation
- ✅ JanusComposer (mejorado recientemente)
- ✅ Shard Detection, Pragma Strike, Echo Stream, Glyph Weaving, Resonance Path

#### Gamificación
- ✅ Sistema de XP, Coins, Gems, Streak
- ✅ Niveles de usuario (10 niveles)
- ✅ Recompensas variables

---

## 📋 PLAN DE TAREAS UNIFICADO

### FASE 1: Sistema de Entrenamiento Cognitivo con Control de Carga (CLT)

> **Filosofía:** Transformar "estudio" en "entrenamiento cognitivo" donde cada sesión fortalece el músculo cognitivo.

#### TAREA 1.1: Store de Carga Cognitiva
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivo:** `src/store/useCognitiveLoadStore.ts`

**Funcionalidad:**
- Tracking de carga intrínseca, extraña y germana
- Modo Focus automático durante entrenamiento de input
- Métricas de sesión de entrenamiento
- Algoritmo de reducción de carga adaptativo
- Integración con visualización de progreso neuronal

**Dependencias:** Ninguna

---

#### TAREA 1.2: Modo Focus (Entrenamiento Inmersivo)
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/components/shared/FocusMode.tsx`

**Funcionalidad:**
- Ocultar HUD (XP, coins, gems) durante entrenamiento de input
- Desactivar animaciones durante consumo de contenido
- Bloquear notificaciones durante sesiones de entrenamiento
- Modo Focus automático basado en tipo de actividad
- Transición fluida post-entrenamiento con feedback acumulado

**Dependencias:** TAREA 1.1

---

#### TAREA 1.3: Sistema de Métricas CLT y Neurodiseño
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivo:** `src/services/cognitiveLoadMetrics.ts`

**Funcionalidad:**
- Calcular carga intrínseca (duración, palabras, complejidad)
- Calcular carga extraña (CTAs, animaciones, fricción)
- Calcular carga germana (tipo de ejercicio, tipo de entrenamiento)
- Tracking automático de sesiones de entrenamiento
- Métricas de "irrigación neuronal" (input comprensible procesado)
- Integración con visualización de densidad sináptica

**Dependencias:** TAREA 1.1

---

#### TAREA 1.4: Refactorizar useMissionStore para CLT
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivo:** `src/store/useMissionStore.ts`

**Cambios:**
- Agregar `cognitiveLoadTarget` a misiones
- Misiones adaptativas basadas en carga
- Nuevos tipos CLT-aware

**Dependencias:** TAREA 1.1, TAREA 1.3

---

#### TAREA 1.5: Algoritmo de Generación de Misiones CLT
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivo:** `src/services/missionGenerator.ts`

**Funcionalidad:**
- Generar misiones basadas en carga cognitiva
- Integración con FSRS
- Misiones adaptativas

**Dependencias:** TAREA 1.4

---

#### TAREA 1.6: Componente MissionFeed (Feed de Entrenamiento)
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivo:** `src/components/missions/MissionFeed.tsx`

**Funcionalidad:**
- Feed único: "Siguiente bloque de entrenamiento recomendado"
- FSRS decide qué mostrar basado en curva de olvido
- Modo Focus automático durante entrenamiento
- Visualización de progreso neuronal integrada
- Narrativa de "entrenamiento" en lugar de "lección"

**Dependencias:** TAREA 1.4, TAREA 1.5

---

#### TAREA 1.7: Gamificación Post-Cognitiva
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/components/exercises/*.tsx`, `src/store/useGamificationStore.ts`

**Cambios:**
- Ocultar XP durante input/ejercicios
- Mostrar recompensas después de completar
- Resumen visual al cerrar sesión

**Dependencias:** TAREA 1.2

---

#### TAREA 1.8: Resumen de Sesión de Entrenamiento
**Prioridad:** Baja  
**Estado:** Pendiente  
**Archivo:** `src/components/session/SessionSummary.tsx`

**Funcionalidad:**
- Métricas de input comprensible procesado (minutos de irrigación neuronal)
- Bloques de entrenamiento completados
- Carga cognitiva promedio de la sesión
- Visualización de zonas cerebrales activadas
- Recompensas acumuladas (mostradas post-entrenamiento)
- Narrativa de "fortalecimiento del músculo cognitivo"

**Dependencias:** TAREA 1.3, TAREA 1.7

---

### FASE 2: Sistema de Calentamientos Cognitivos (Warm-ups)

#### TAREA 2.1: Schemas y Tipos para Warm-ups
**Prioridad:** Alta  
**Estado:** ✅ Completado  
**Archivo:** `src/schemas/warmup.ts`

**Nota:** Ya implementado según WARMUP_IMPLEMENTATION_SUMMARY.md

---

#### TAREA 2.2: Store de Warm-ups
**Prioridad:** Alta  
**Estado:** ✅ Completado  
**Archivo:** `src/store/useWarmupStore.ts`

**Nota:** Ya implementado

---

#### TAREA 2.3: RhythmSequenceWarmup Component
**Prioridad:** Alta  
**Estado:** ✅ Completado  
**Archivo:** `src/components/warmup/RhythmSequenceWarmup.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.4: VisualMatchWarmup Component
**Prioridad:** Alta  
**Estado:** ✅ Completado  
**Archivo:** `src/components/warmup/VisualMatchWarmup.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.5: VoiceImitationWarmup Component
**Prioridad:** Alta  
**Estado:** ✅ Completado  
**Archivo:** `src/components/warmup/VoiceImitationWarmup.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.6: WarmupTransition Component
**Prioridad:** Media  
**Estado:** ✅ Completado  
**Archivo:** `src/components/warmup/WarmupTransition.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.7: WarmupGate Component
**Prioridad:** Alta  
**Estado:** ✅ Completado  
**Archivo:** `src/components/warmup/WarmupGate.tsx`

**Nota:** Ya implementado

---

#### TAREA 2.8: Integrar Warm-ups con MissionFeed
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/components/missions/MissionFeed.tsx`

**Funcionalidad:**
- Mostrar warm-up antes de misión
- Asignación automática según tipo de misión
- Transición fluida

**Dependencias:** TAREA 1.6, TAREA 2.7

---

#### TAREA 2.9: Selector de Warm-ups
**Prioridad:** Media  
**Estado:** ✅ Completado  
**Archivo:** `src/services/warmupSelector.ts`

**Nota:** Ya implementado

---

### FASE 2.5: Optimización UX — Protocolo Low Click

> **Objetivo:** Eliminar fricción para alcanzar flujo de "clic mínimo" o "sin manos" durante entrenamiento.

#### TAREA 2.10: Hotkeys para Validación SRS
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/app/decks/review/page.tsx`, `src/components/srs/SRSCard.tsx`

**Funcionalidad:**
- Hotkeys 1-4 para validación rápida (Again, Hard, Good, Easy)
- Eliminar necesidad de clics en botones
- Feedback visual inmediato (< 300ms)
- Ahorro estimado: ~60% de tiempo por tarjeta

**Dependencias:** Sistema SRS existente

---

#### TAREA 2.11: Gestos de Swipe para SRS
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/components/srs/SRSCard.tsx`

**Funcionalidad:**
- Swipe derecho = "Conocido" (Good/Easy)
- Swipe izquierdo = "Repasar" (Again/Hard)
- Animación fluida con Framer Motion
- Soporte táctil y desktop (drag equivalente)

**Dependencias:** TAREA 2.10

---

#### TAREA 2.12: Navegación Optimizada para Janus Matrix
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/components/exercises/JanusComposerExercise.tsx`

**Funcionalidad:**
- Navegación por teclado (flechas) entre celdas
- Selección automática inteligente basada en contexto
- Hover-to-reveal para traducciones/información secundaria
- Eliminación de scroll manual innecesario
- Regla de Miller: máximo 7 elementos simultáneos visibles

**Dependencias:** Ejercicio JanusComposer existente

---

#### TAREA 2.13: Micro-interacciones Optimizadas
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/components/shared/MicroInteractions.tsx`

**Funcionalidad:**
- Duración máxima de 300ms para todas las animaciones
- Feedback inline para errores (sin modales)
- Vibración visual (shake) para correcciones
- Autocompletado inteligente en entrada de datos
- Dictado (Speech-to-text) como alternativa a escritura manual

**Dependencias:** Ninguna

---

#### TAREA 2.14: Feedback Post-Cognitivo
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/components/exercises/*.tsx`

**Funcionalidad:**
- Ocultar recompensas durante entrenamiento activo
- Mostrar feedback acumulado después de completar ejercicio
- Transición fluida entre entrenamiento y feedback
- Reducir carga extraña durante procesamiento cognitivo

**Dependencias:** TAREA 1.2

---

### FASE 2.6: Integración de Stack de Diseño Visual

> **Objetivo:** Implementar herramientas Triple A para visualización neuronal y animaciones premium.

#### TAREA 2.15: Integración de Tipografía (Quicksand/Inter)
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/app/layout.tsx`, `src/styles/globals.css`

**Funcionalidad:**
- Integrar Google Fonts (Quicksand para títulos, Inter para UI)
- Configurar jerarquía tipográfica estricta
- Variables CSS para font-weights
- Optimización de carga (preload crítico)

**Dependencias:** Ninguna

---

#### TAREA 2.16: Integración de Rive para Músculo Cognitivo
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/components/dashboard/NeuralNetwork.tsx`

**Funcionalidad:**
- Dashboard de red neuronal con Rive
- Animación interactiva que reacciona al progreso
- Estados de red neuronal (latente, activa, densa)
- Rendimiento: hasta 120 fps, peso ligero

**Dependencias:** TAREA 2.15

---

#### TAREA 2.17: Integración de Framer Motion
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/components/**/*.tsx`

**Funcionalidad:**
- Transiciones de página con spring physics
- Animaciones de tarjetas y modales
- Gestos naturales y táctiles
- Optimización de rendimiento

**Dependencias:** Ninguna (Framer Motion ya puede estar instalado)

---

#### TAREA 2.18: Integración de Lordicon y LottieFiles
**Prioridad:** Baja  
**Estado:** Pendiente  
**Archivos:** `src/components/shared/AnimatedIcons.tsx`

**Funcionalidad:**
- Iconografía animada (Lordicon) para estados
- Celebraciones de hitos (LottieFiles)
- Micro-animaciones de éxito/error
- Formato JSON/Lottie optimizado

**Dependencias:** Ninguna

---

### FASE 2.7: Visualización del Músculo Cognitivo

> **Objetivo:** Transformar métricas abstractas en visualización orgánica de neuroplasticidad.

#### TAREA 2.19: Anillos de Input (Krashen Rings)
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/components/dashboard/KrashenRings.tsx`

**Funcionalidad:**
- Anillo exterior que se llena según minutos de input comprensible
- Estilo Apple Watch (satisfacción por completitud diaria)
- Visualización de tiempo real de inmersión efectiva
- No XP arbitrario, sino tiempo real de entrenamiento

**Dependencias:** TAREA 1.3, TAREA 2.16

---

#### TAREA 2.20: Visualización de Densidad Sináptica
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/components/dashboard/SynapticDensity.tsx`

**Funcionalidad:**
- Red neuronal interna que crece en complejidad
- Nuevos nodos se activan con el progreso
- Caminos existentes se iluminan con mayor intensidad
- Representa consolidación de memoria a largo plazo
- Integración con Rive para animación fluida

**Dependencias:** TAREA 2.16

---

#### TAREA 2.21: Zonas de Desbloqueo Cerebral
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/components/dashboard/BrainZones.tsx`

**Funcionalidad:**
- Cerebro dividido en regiones funcionales:
  - Lóbulo Temporal (comprensión auditiva)
  - Área de Broca (producción verbal)
  - Ganglios Basales (procesamiento procedimental)
- Sistema "ilumina" zonas al alcanzar hitos específicos
- Transforma aprendizaje en conquista de territorio biológico
- Narrativa de "desbloqueo" en lugar de "completitud"

**Dependencias:** TAREA 2.16, TAREA 1.3

---

#### TAREA 2.22: Dashboard Neural Principal
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/app/dashboard/page.tsx`, `src/components/dashboard/NeuralDashboard.tsx`

**Funcionalidad:**
- Dashboard central con visualización orgánica (no gráficas de barras)
- Integración de Krashen Rings, Densidad Sináptica, Zonas de Desbloqueo
- Estado de "hibernación" en lugar de retroceso (reduce filtro afectivo)
- Narrativa de "acumulación de energía" en lugar de pérdida
- Reactivación instantánea con siguiente sesión

**Dependencias:** TAREA 2.19, TAREA 2.20, TAREA 2.21

---

#### TAREA 2.23: Sistema de Paletas de Colores (Neural Nexus)
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/styles/theme.css`, `tailwind.config.ts`

**Funcionalidad:**
- Paleta Neural Nexus: `#1A237E` (índigo), `#00BCD4` (cian), `#FAFAFA` (blanco)
- Variables CSS para todas las temáticas (Neural Nexus, Bio-Lab, Janus Map)
- Sistema de tokens de color
- Modo oscuro/claro con paletas adaptadas

**Dependencias:** TAREA 2.15

---

### FASE 3: Contenido — ÁREA 0 (Base Absoluta)

#### TAREA 3.1: Schema para ÁREA 0
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Pendiente  
**Archivo:** `src/schemas/content.ts`

**Funcionalidad:**
- Estructura: inicio → desarrollo → resolución → cierre
- Campos: audioTags, culturalNotes, survivalStrategy, commonErrors

---

#### TAREA 3.2: NODO 0.1 — Saludos y Despedidas
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Pendiente  
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-1-saludos.json`

**Contenido:**
- 3 bloques conversacionales
- Audio sincronizado
- Ejercicios completos

---

#### TAREA 3.3: NODO 0.2 — Presentaciones Básicas
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Pendiente  
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-2-presentaciones.json`

---

#### TAREA 3.4: NODO 0.3 — Números 0-20
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Pendiente  
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-3-numeros.json`

---

#### TAREA 3.5: NODO 0.4 — Verbos Clave (être, avoir, aller)
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Pendiente  
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-4-verbos-clave.json`

---

#### TAREA 3.6: NODO 0.5 — Preguntas Básicas
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Pendiente  
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-5-preguntas.json`

---

#### TAREA 3.7: NODO 0.6 — Cortesía y Agradecimientos
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Pendiente  
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-6-cortesia.json`

---

#### TAREA 3.8: NODO 0.7 — Despedidas y Próximos Pasos
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Pendiente  
**Archivo:** `content/fr/A0/base-absoluta/nodo-0-7-despedidas.json`

---

### FASE 4: Backend y Persistencia

#### TAREA 4.1: Supabase Auth
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/app/api/auth/`, `src/lib/supabase.ts`

**Funcionalidad:**
- Magic link email
- Autenticación persistente
- Gestión de sesiones

---

#### TAREA 4.2: Sync Service
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivo:** `src/services/syncService.ts`

**Funcionalidad:**
- Sincronización de progreso con Supabase
- Resolución de conflictos
- Modo offline

---

#### TAREA 4.3: Service Worker / PWA
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `public/sw.js`, `next.config.mjs`

**Funcionalidad:**
- Cache de contenido
- Modo offline
- Instalación PWA

---

### FASE 5: Optimizaciones y Mejoras de Entrenamiento

#### TAREA 5.1: Lazy Loading de Ejercicios
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/components/exercises/*.tsx`

**Funcionalidad:**
- Carga bajo demanda de ejercicios de entrenamiento
- Mejor performance inicial
- Reducir carga cognitiva extraña durante inicio de sesión

---

#### TAREA 5.2: Cache de Traducciones
**Prioridad:** Baja  
**Estado:** Pendiente  
**Archivo:** `src/services/translationService.ts`

**Funcionalidad:**
- Cache local de traducciones
- Reducir llamadas API

---

#### TAREA 5.3: Mejoras en Generación de Ejercicios de Entrenamiento
**Prioridad:** Media  
**Estado:** En progreso  
**Archivo:** `src/services/generateExercisesFromPhrases.ts`

**Nota:** Mejoras recientes en Janus Composer. Continuar optimizando para reducir carga cognitiva y mejorar flujo de entrenamiento.

---

#### TAREA 5.4: Feedback Contextual de Entrenamiento
**Prioridad:** Baja  
**Estado:** Pendiente  
**Archivo:** `src/services/feedbackService.ts`

**Funcionalidad:**
- Mensajes específicos por error durante entrenamiento
- Feedback accionable que guía el siguiente paso
- Narrativa de "calibración" (Bio-Lab) en lugar de "error"
- Reducir filtro afectivo mediante lenguaje técnico

---

### FASE 6: Testing y Calidad

#### TAREA 6.1: Tests E2E para Flujos Principales
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `tests/e2e/`

**Cobertura:**
- Flujo INPUT completo
- Flujo SRS completo
- Flujo de ejercicios

---

#### TAREA 6.2: Tests Unitarios para Servicios
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `tests/unit/`

**Cobertura:**
- wordExtractor
- translationService
- generateExercisesFromPhrases
- sm2 algorithm

---

#### TAREA 6.3: Visual Regression Tests
**Prioridad:** Baja  
**Estado:** Pendiente  
**Archivos:** `tests/visual/`

---

### FASE 7: Contenido Adicional

#### TAREA 7.1: Expansión de Contenido A1
**Prioridad:** Media  
**Estado:** Pendiente  

**Áreas a expandir:**
- O (Clima)
- P (Cultura/Ocio)
- Q (Trabajo Avanzado)
- R (Digital Profundo)
- S (Tiempo Libre)

---

#### TAREA 7.2: Contenido A2 French
**Prioridad:** Baja  
**Estado:** Pendiente  

---

#### TAREA 7.3: Contenido German A1
**Prioridad:** Baja  
**Estado:** Pendiente  

---

### FASE 8: Monetización (ÚLTIMA FASE)

#### TAREA 8.1: Modelo de Negocio
**Prioridad:** Baja (última fase)  
**Estado:** Pendiente  

**Opciones a evaluar:**
- Freemium (modo guiado gratis, autónomo premium)
- Suscripción mensual/anual
- Pago único por contenido premium
- Modelo de marketplace (usuarios venden contenido)

---

#### TAREA 8.2: Sistema de Pagos
**Prioridad:** Baja (última fase)  
**Estado:** Pendiente  

**Integración:**
- Stripe / PayPal
- Gestión de suscripciones
- Facturación

---

#### TAREA 8.3: Analytics y Métricas de Negocio
**Prioridad:** Baja (última fase)  
**Estado:** Pendiente  

**Métricas:**
- Conversión free → premium
- Retención de usuarios pagos
- LTV (Lifetime Value)
- Churn rate

---

## 📊 Resumen de Tareas

| Fase | Tareas | Completadas | Pendientes | Prioridad |
|------|--------|-------------|------------|-----------|
| 1. Entrenamiento CLT | 8 | 0 | 8 | Alta |
| 2. Warm-ups | 9 | 7 | 2 | Alta |
| 2.5. Optimización UX (Low Click) | 5 | 0 | 5 | Alta |
| 2.6. Stack Diseño Visual | 4 | 0 | 4 | Alta |
| 2.7. Músculo Cognitivo | 5 | 0 | 5 | Alta |
| 3. ÁREA 0 | 8 | 0 | 8 | 🔴 CRÍTICA |
| 4. Backend | 3 | 0 | 3 | Alta |
| 5. Optimizaciones | 4 | 0 | 4 | Media |
| 6. Testing | 3 | 0 | 3 | Media |
| 7. Contenido | 3 | 0 | 3 | Media/Baja |
| 8. Monetización | 3 | 0 | 3 | Baja (última) |
| **TOTAL** | **55** | **7** | **48** | |

---

## 🎯 Priorización

### Crítico (Hacer Ahora)
1. TAREA 3.1 - Schema ÁREA 0
2. TAREA 3.2-3.8 - Nodos ÁREA 0 (Base Absoluta)
3. TAREA 1.1 - Store CLT
4. TAREA 1.2 - Modo Focus (Entrenamiento Inmersivo)
5. TAREA 2.8 - Integrar Warm-ups con MissionFeed
6. TAREA 2.15 - Integración Tipografía (Quicksand/Inter)
7. TAREA 2.19 - Anillos de Input (Krashen Rings)

### Alta Prioridad (Próximas 2 semanas)
- TAREA 1.4-1.6 - Sistema de Entrenamiento CLT
- TAREA 2.10-2.12 - Optimización UX (Hotkeys, Swipe, Janus Navigation)
- TAREA 2.16 - Integración Rive para Músculo Cognitivo
- TAREA 2.20-2.22 - Visualización Neuronal (Densidad Sináptica, Dashboard)
- TAREA 4.1-4.2 - Backend (Auth + Sync)

### Media Prioridad (Próximo mes)
- TAREA 2.11, 2.13, 2.14 - Micro-interacciones y Feedback Post-Cognitivo
- TAREA 2.17-2.18 - Framer Motion, Lordicon, LottieFiles
- TAREA 2.21, 2.23 - Zonas de Desbloqueo, Paletas de Colores
- TAREA 5.1-5.4 - Optimizaciones de Entrenamiento
- TAREA 6.1-6.2 - Testing
- TAREA 7.1 - Expansión contenido

### Baja Prioridad (Futuro)
- TAREA 7.2-7.3 - Contenido adicional
- TAREA 8.1-8.3 - Monetización

---

## 📝 Notas de Implementación

1. **ÁREA 0 es crítica:** Debe completarse antes de cualquier otro contenido
2. **Entrenamiento CLT es fundamental:** Transforma "estudio" en "entrenamiento cognitivo"
3. **Warm-ups ya implementados:** Solo falta integración con MissionFeed
4. **Diseño Visual es prioritario:** Neural Nexus debe implementarse en paralelo con funcionalidad
5. **Optimización UX (Low Click):** Crítica para retención y flujo de entrenamiento
6. **Visualización Neuronal:** Reemplaza métricas abstractas con representación orgánica del progreso
7. **Backend puede esperar:** El sistema funciona con persistencia local
8. **Monetización al final:** Primero producto funcional con diseño Triple A, luego monetización

## 🎨 Stack Tecnológico de Diseño

### Tipografía
- **Quicksand** (Google Fonts) - Títulos y encabezados
- **Inter** (Google Fonts) - UI y cuerpo de texto

### Animación y Visualización
- **Rive** - Dashboard del Músculo Cognitivo (red neuronal interactiva)
- **Framer Motion** - Transiciones de página y componentes React
- **Lordicon** - Iconografía animada (hover, click)
- **LottieFiles** - Celebraciones de hitos y rachas

### Paletas de Colores
- **Neural Nexus:** `#1A237E` (índigo), `#00BCD4` (cian), `#FAFAFA` (blanco)
- **Bio-Lab:** `#457B9D` (azul soft), `#A8DADC` (teal), `#F1FAEE` (verde menta)
- **Janus Map:** `#000000` (negro), `#ED1B34` (rojo), `#93A1AD` (gris técnico)

Ver `DISEÑO_STRATEGY.md` para especificaciones completas de diseño.

---

## 🚀 Próximos Pasos Inmediatos

### Funcionalidad Core
1. Crear schema para ÁREA 0
2. Implementar primeros 3 nodos de ÁREA 0
3. Crear `useCognitiveLoadStore.ts`
4. Implementar Modo Focus básico (entrenamiento inmersivo)
5. Integrar Warm-ups con MissionFeed

### Diseño Visual (Paralelo)
6. Integrar tipografía Quicksand/Inter
7. Crear componente Krashen Rings (Anillos de Input)
8. Integrar Rive para visualización neuronal básica
9. Implementar hotkeys para SRS (1-4)
10. Optimizar navegación Janus Matrix (teclado + hover-to-reveal)

