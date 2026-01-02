# Plan Maestro — LinguaForge

> Última actualización: 2025-01-XX  
> Versión: 1.0 Unificado

## Visión del Proyecto

**LinguaForge** es una plataforma de adquisición lingüística gamificada que combina:
- **Krashen** → Input comprensible medido (i+1)
- **Janulus** → Fluidez combinatoria (matrices 4 columnas)
- **Cognitive Load Theory** → Control de carga cognitiva
- **Ullman's DP Model** → Activación neuronal previa (warm-ups)
- **Octalysis** → Gamificación centrada en humanos

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

### FASE 1: Sistema de Misiones con Control de Carga Cognitiva (CLT)

#### TAREA 1.1: Store de Carga Cognitiva
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivo:** `src/store/useCognitiveLoadStore.ts`

**Funcionalidad:**
- Tracking de carga intrínseca, extraña y germana
- Modo Focus automático durante audio
- Métricas de sesión
- Algoritmo de reducción de carga

**Dependencias:** Ninguna

---

#### TAREA 1.2: Modo Focus
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivos:** `src/components/shared/FocusMode.tsx`

**Funcionalidad:**
- Ocultar HUD (XP, coins, gems) durante audio
- Desactivar animaciones durante input
- Bloquear notificaciones
- Modo Focus automático

**Dependencias:** TAREA 1.1

---

#### TAREA 1.3: Sistema de Métricas CLT
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivo:** `src/services/cognitiveLoadMetrics.ts`

**Funcionalidad:**
- Calcular carga intrínseca (duración, palabras, complejidad)
- Calcular carga extraña (CTAs, animaciones)
- Calcular carga germana (tipo de ejercicio)
- Tracking automático

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

#### TAREA 1.6: Componente MissionFeed
**Prioridad:** Alta  
**Estado:** Pendiente  
**Archivo:** `src/components/missions/MissionFeed.tsx`

**Funcionalidad:**
- Feed único: "Siguiente bloque recomendado"
- FSRS decide qué mostrar
- Modo Focus automático

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

#### TAREA 1.8: Resumen de Sesión
**Prioridad:** Baja  
**Estado:** Pendiente  
**Archivo:** `src/components/session/SessionSummary.tsx`

**Funcionalidad:**
- Métricas de input real
- Bloques completados
- Carga cognitiva promedio
- Recompensas acumuladas

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

### FASE 5: Optimizaciones y Mejoras

#### TAREA 5.1: Lazy Loading de Ejercicios
**Prioridad:** Media  
**Estado:** Pendiente  
**Archivos:** `src/components/exercises/*.tsx`

**Funcionalidad:**
- Carga bajo demanda
- Mejor performance inicial

---

#### TAREA 5.2: Cache de Traducciones
**Prioridad:** Baja  
**Estado:** Pendiente  
**Archivo:** `src/services/translationService.ts`

**Funcionalidad:**
- Cache local de traducciones
- Reducir llamadas API

---

#### TAREA 5.3: Mejoras en Generación de Ejercicios
**Prioridad:** Media  
**Estado:** En progreso  
**Archivo:** `src/services/generateExercisesFromPhrases.ts`

**Nota:** Mejoras recientes en Janus Composer

---

#### TAREA 5.4: Feedback Contextual
**Prioridad:** Baja  
**Estado:** Pendiente  
**Archivo:** `src/services/feedbackService.ts`

**Funcionalidad:**
- Mensajes específicos por error
- Feedback accionable

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
| 1. CLT | 8 | 0 | 8 | Alta |
| 2. Warm-ups | 9 | 7 | 2 | Alta |
| 3. ÁREA 0 | 8 | 0 | 8 | 🔴 CRÍTICA |
| 4. Backend | 3 | 0 | 3 | Alta |
| 5. Optimizaciones | 4 | 0 | 4 | Media |
| 6. Testing | 3 | 0 | 3 | Media |
| 7. Contenido | 3 | 0 | 3 | Media/Baja |
| 8. Monetización | 3 | 0 | 3 | Baja (última) |
| **TOTAL** | **41** | **7** | **34** | |

---

## 🎯 Priorización

### Crítico (Hacer Ahora)
1. TAREA 3.1 - Schema ÁREA 0
2. TAREA 3.2-3.8 - Nodos ÁREA 0 (Base Absoluta)
3. TAREA 1.1 - Store CLT
4. TAREA 1.2 - Modo Focus
5. TAREA 2.8 - Integrar Warm-ups con MissionFeed

### Alta Prioridad (Próximas 2 semanas)
- TAREA 1.4-1.6 - Sistema de Misiones CLT
- TAREA 4.1-4.2 - Backend (Auth + Sync)

### Media Prioridad (Próximo mes)
- TAREA 5.1-5.3 - Optimizaciones
- TAREA 6.1-6.2 - Testing
- TAREA 7.1 - Expansión contenido

### Baja Prioridad (Futuro)
- TAREA 7.2-7.3 - Contenido adicional
- TAREA 8.1-8.3 - Monetización

---

## 📝 Notas de Implementación

1. **ÁREA 0 es crítica:** Debe completarse antes de cualquier otro contenido
2. **CLT es fundamental:** Mejora significativamente la experiencia de aprendizaje
3. **Warm-ups ya implementados:** Solo falta integración con MissionFeed
4. **Backend puede esperar:** El sistema funciona con persistencia local
5. **Monetización al final:** Primero producto funcional, luego monetización

---

## 🚀 Próximos Pasos Inmediatos

1. Crear schema para ÁREA 0
2. Implementar primeros 3 nodos de ÁREA 0
3. Crear `useCognitiveLoadStore.ts`
4. Implementar Modo Focus básico
5. Integrar Warm-ups con MissionFeed

