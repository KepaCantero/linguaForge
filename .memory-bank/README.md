# Memory Bank — Banco de Memoria del Proyecto

> Este directorio contiene toda la documentación esencial del proyecto para mantener contexto entre sesiones.

## Estructura Simplificada

### Archivos Core (6 archivos - Leer al inicio)

1. **`projectBrief.md`** - Visión, objetivos y estructura del proyecto
2. **`productContext.md`** - Contexto del producto, problemas que resuelve, funcionalidades
3. **`systemPatterns.md`** - Arquitectura, patrones de diseño, convenciones de código, estructura de archivos
4. **`techContext.md`** - Stack tecnológico, configuración, servicios, integraciones, schemas
5. **`activeContext.md`** - Trabajo reciente, estado actual, próximos pasos
6. **`progress.md`** - Estado del proyecto, lo que funciona, lo pendiente (CONSOLIDADO)

### Planes y Tareas (2 archivos)

7. **`MASTER_PLAN.md`** - Plan maestro unificado con todas las tareas (74 tareas totales)
8. **`progress.md`** - Progress consolidado con estado de todas las fases

### Documentación Específica (2 archivos)

9. **`METHODOLOGIES.md`** - Todas las metodologías científicas consolidadas
10. **`DESIGN_DOCS.md`** - Todos los documentos de diseño consolidados

### Guía (1 archivo)

11. **`README.md`** - Este archivo (guía del memory bank)

**Total: 11 archivos** (reducido desde 23+ archivos)

---

## Cómo Usar el Memory Bank

### Al Inicio de Cada Sesión

1. **Leer archivos core** en este orden:
   - `projectBrief.md` - Entender la visión
   - `productContext.md` - Entender el producto
   - `systemPatterns.md` - Entender la arquitectura
   - `techContext.md` - Entender el stack técnico
   - `activeContext.md` - Entender trabajo reciente
   - `progress.md` - Entender estado actual

2. **Consultar según necesidad:**
   - Si necesitas ver todas las tareas → `MASTER_PLAN.md`
   - Si necesitas entender metodologías → `METHODOLOGIES.md`
   - Si necesitas entender diseños → `DESIGN_DOCS.md`

### Al Finalizar Trabajo Importante

1. **Actualizar `activeContext.md`** con:
   - Trabajo realizado
   - Archivos creados/modificados
   - Decisiones técnicas
   - Próximos pasos

2. **Actualizar `progress.md`** con:
   - Nuevas funcionalidades completadas
   - Problemas resueltos
   - Nuevos problemas identificados

### Cuando se Descubre un Nuevo Patrón

1. **Documentar en `systemPatterns.md`**:
   - Patrón identificado
   - Ejemplo de uso
   - Cuándo aplicarlo

2. **Actualizar `techContext.md`** si es relevante técnicamente

---

## Mantenimiento del Memory Bank

### Consolidación Realizada

**Archivos eliminados (consolidados):**
- ~~`CLT_MISSIONS_PLAN.md`~~ → `MASTER_PLAN.md`
- ~~`COGNITIVE_WARMUP_PLAN.md`~~ → `MASTER_PLAN.md`
- ~~`TAREAS_AREA_0_Y_EXPANSIONES.md`~~ → `MASTER_PLAN.md`
- ~~`executiveSummary.md`~~ → `projectBrief.md` + `productContext.md`
- ~~`contentTracking.md`~~ → `progress.md`
- ~~`fileStructure.md`~~ → `systemPatterns.md`
- ~~`techDecisions.md`~~ → `techContext.md`
- ~~`schemas.md`~~ → `techContext.md`
- ~~`architectureStrategy.md`~~ → `systemPatterns.md`
- ~~`contentStructure.md`~~ → `productContext.md`
- ~~`ANALISIS_PALETA_COLORES.md`~~ → `DESIGN_DOCS.md`
- ~~`janulus.md`~~ → `METHODOLOGIES.md`
- ~~`krashenMethodology.md`~~ → `METHODOLOGIES.md`
- ~~`octalysis.md`~~ → `METHODOLOGIES.md`
- ~~`INPUT_SYSTEM_REDESIGN.md`~~ → `DESIGN_DOCS.md`
- ~~`EXERCISES_REDESIGN.md`~~ → `DESIGN_DOCS.md`
- ~~`WARMUP_IMPLEMENTATION_SUMMARY.md`~~ → `DESIGN_DOCS.md`
- ~~`ux-analysis.md`~~ → `DESIGN_DOCS.md`

### Organización

- **Core files** deben estar siempre actualizados
- **Planes** consolidados en `MASTER_PLAN.md`
- **Metodologías** consolidadas en `METHODOLOGIES.md`
- **Diseños** consolidados en `DESIGN_DOCS.md`

---

## Convenciones

### Formato de Fechas
- Usar formato: `2025-01-XX` (año-mes-día)
- Actualizar fecha en "Última actualización" cuando se modifica

### Referencias Cruzadas
- Usar enlaces relativos cuando sea posible
- Mantener consistencia en nombres de archivos

### Lenguaje
- Español para documentación de producto
- Inglés para código y comentarios técnicos
- Mezcla aceptable según contexto

---

## Notas Importantes

- **Este memory bank es crítico** para mantener contexto entre sesiones
- **Actualizar regularmente** para que sea útil
- **No duplicar información** - consolidar en archivos apropiados
- **Mantener estructura simple** - máximo 11 archivos

---

## Estructura Final

```
.memory-bank/
├── README.md                    # Esta guía
├── projectBrief.md             # Visión y objetivos
├── productContext.md            # Contexto del producto
├── systemPatterns.md            # Arquitectura y patrones
├── techContext.md               # Stack técnico
├── activeContext.md             # Trabajo reciente
├── progress.md                  # Estado del proyecto
├── MASTER_PLAN.md               # Plan maestro unificado
├── METHODOLOGIES.md             # Metodologías científicas
└── DESIGN_DOCS.md              # Documentos de diseño
```

**Total: 11 archivos esenciales**
