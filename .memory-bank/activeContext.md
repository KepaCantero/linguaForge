# Active Context — Sesión Actual

> Última actualización: 2025-12-28

## Estado Actual

**Versión del Plan:** v4.0
**Fase:** Pre-inicio
**Tarea activa:** Ninguna
**Próxima tarea:** TAREA 0.1 → Crear constants.ts

## Resumen de Sesión

### Lo que se hizo
1. Memory bank creado y actualizado a v4.0
2. Documentación completa de metodologías:
   - `janulus.md` - Método Janulus (matrices 4 columnas)
   - `octalysis.md` - Gamificación (XP, coins, gems, streak)
   - `krashenMethodology.md` - Input comprensible
3. 27 tareas definidas con especificaciones exactas
4. Schemas Zod completos con ejemplos JSON
5. Arquitectura de archivos documentada

### Archivos del Memory Bank
```
.memory-bank/
├── README.md              ✓ Actualizado
├── projectBrief.md        ✓ v4.0
├── taskProgress.md        ✓ 27 tareas atómicas
├── activeContext.md       ✓ Este archivo
├── techDecisions.md       ✓ Existente
├── fileStructure.md       ✓ Actualizado
├── schemas.md             ✓ Zod + Janulus
├── janulus.md             ✓ NUEVO
├── octalysis.md           ✓ NUEVO
└── krashenMethodology.md  ✓ Existente
```

## Próximos Pasos

### Inmediatos (Fase 0-1)
1. **TAREA 0.1:** Crear `src/lib/constants.ts`
2. **TAREA 1:** Crear proyecto Next.js 14
3. **TAREA 2:** Layout + Header + BottomNav

### Orden Recomendado
```
0.1 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
     ↓
    11 → 12 → 13 (Janulus - CORE)
     ↓
    14 → 15 → 16 → 17 (Ejercicios)
     ↓
    18 → 19 → 20 (Input)
     ↓
    21 → 22 (Dashboard + Gamificación)
     ↓
    23 → 24 → 25 (Backend + PWA)
     ↓
    26 → 27 (Extensibilidad)
```

## Decisiones Pendientes
- [ ] Nombre final de la app (actualmente: FrenchA1Airbnb)
- [ ] Colores de marca (sugerido: Indigo #4F46E5)
- [ ] Configuración de Supabase (proyecto, API keys)

## Bloqueadores
Ninguno

## Notas de Implementación

### Para comenzar:
```bash
# Desde /Users/kepa.cantero/Projects/frenchWebApp

# Tarea 1 - Crear proyecto
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --no-import-alias

# Instalar dependencias
npm install zustand zod framer-motion howler fuse.js
npm install -D @types/howler
```

### Verificación:
```bash
npm run dev   # Debe funcionar
npm run build # Sin errores
```

## Métricas del Plan

| Métrica | Valor |
|---------|-------|
| Tareas totales | 27 |
| Tareas completadas | 0 |
| Progreso | 0% |
| Archivos a crear | ~50 |
| Líneas de código estimadas | ~3000 |
