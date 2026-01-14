# TODOs Pendientes

Este documento registra los TODOs/FIXMEs encontrados en el códigobase que necesitan ser atendidos.

## Formato de Referencia
- **ID**: TODO-YYYYMMDD-NNN (identificador único)
- **Estado**: `pending` | `in_progress` | `completed` | `won't_fix`
- **Prioridad**: `low` | `medium` | `high` | `critical`

---

## TODOs Registrados

| ID | Archivo | Línea | Descripción | Prioridad | Estado |
|----|--------|-------|-------------|-----------|--------|
| TODO-20250114-001 | `src/app/api/youtube/transcript/route.ts` | 74 | Add proper logging service for API errors | medium | pending |
| TODO-20250114-002 | `src/components/ui/ErrorBoundary.tsx` | 34 | Implementar integración con servicio de error tracking | high | pending |
| TODO-20250114-003 | `src/components/transcript/WordSelector.tsx` | 214 | Add proper logging service for card creation errors | medium | pending |
| TODO-20250114-004 | `src/components/transcript/PhraseSelectionPanel.tsx` | 237 | Add proper logging service for translation errors | medium | pending |
| TODO-20250114-005 | `src/components/transcript/PhraseSelectionPanel.tsx` | 318 | Add proper logging service for card creation errors | medium | pending |
| TODO-20250114-006 | `src/services/ttsService.ts` | 127 | Add proper logging service for TTS errors | low | pending |
| TODO-20250114-007 | `src/services/ttsService.ts` | 436 | Get language_code and level_code from card | low | pending |
| TODO-20250114-008 | `src/services/syncService.ts` | 334 | Add proper logging service for sync errors | medium | pending |

---

## Categorización por Tipo

### Logging Service (6 TODOs)
Muchos TODOs requieren un servicio de logging centralizado. Se recomienda crear un `loggingService` que pueda:

1. Registrar errores con contexto
2. Enviar a servicio de error tracking (Sentry, LogRocket, etc.)
3. Diferenciar entre ambientes (dev vs prod)
4. Incluir metadata relevante (userId, sessionId, etc.)

**Archivos afectados:**
- `src/app/api/youtube/transcript/route.ts`
- `src/components/ui/ErrorBoundary.tsx`
- `src/components/transcript/WordSelector.tsx`
- `src/components/transcript/PhraseSelectionPanel.tsx`
- `src/services/ttsService.ts`
- `src/services/syncService.ts`

### Data Extraction (1 TODO)
- `TODO-20250114-007`: Extraer `language_code` y `level_code` de la tarjeta SRS en `syncService.ts`

---

## Recomendaciones

1. **Crear Issue para Logging Service**: Crear un issue dedicado para implementar el servicio de logging que resuelva 6 de los 8 TODOs.

2. **Priorizar ErrorBoundary**: `ErrorBoundary` es crítico para capturar errores en producción.

3. **Documentar Decisiones**: Cada TODO resuelto debe documentar la decisión tomada y por qué.

---

## Actualización

Este documento debe actualizarse cuando:
- Se resuelva un TODO (cambiar estado a `completed`)
- Se decida no implementar (cambiar estado a `won't_fix` con justificación)
- Se agregue un nuevo TODO (registrar con ID único)
