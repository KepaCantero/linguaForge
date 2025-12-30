# Technical Decisions Log

> Registro de decisiones técnicas tomadas durante el desarrollo

## Decisiones del Stack (FIJAS)

### DEC-001: Framework Frontend
- **Decisión:** Next.js 14 con App Router
- **Razón:** SSR, routing built-in, optimizado para React
- **Fecha:** Pre-definido
- **Estado:** Confirmado

### DEC-002: Estado Global
- **Decisión:** Zustand
- **Razón:** Simplicidad, sin boilerplate, persistencia fácil
- **Alternativas descartadas:** Redux, Context API
- **Fecha:** Pre-definido
- **Estado:** Confirmado

### DEC-003: Animaciones
- **Decisión:** Framer Motion
- **Razón:** API declarativa, integración React, gestos
- **Fecha:** Pre-definido
- **Estado:** Confirmado

### DEC-004: Backend/Auth
- **Decisión:** Supabase
- **Razón:** Auth + DB + Storage en uno, tier gratuito generoso
- **Fecha:** Pre-definido
- **Estado:** Confirmado

### DEC-005: Validación
- **Decisión:** Zod
- **Razón:** TypeScript-first, inference de tipos
- **Fecha:** Pre-definido
- **Estado:** Confirmado

---

## Decisiones de Arquitectura

### DEC-010: Estructura de Contenido
- **Decisión:** JSON estáticos en `/content/{lang}/{level}/{world}.json`
- **Razón:** Simplicidad, versionable en git, carga determinista
- **Implicaciones:** Sin CMS, contenido en código
- **Fecha:** 2025-12-28
- **Estado:** Propuesto

### DEC-011: Estructura de Componentes
- **Decisión:** Por definir
- **Opciones:**
  - `/components/exercises/` para ejercicios
  - `/components/ui/` para componentes base
  - `/components/layout/` para layout
- **Fecha:** Pendiente
- **Estado:** Pendiente

---

## Decisiones de Implementación

(Se irán agregando conforme avance el desarrollo)

---

## Template para Nuevas Decisiones

```markdown
### DEC-XXX: [Título]
- **Decisión:**
- **Razón:**
- **Alternativas descartadas:**
- **Implicaciones:**
- **Fecha:**
- **Estado:** Propuesto | Confirmado | Revertido
```
