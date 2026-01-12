# Tareas Pendientes - SonarQube Issues

> Fecha: 2025-01-12
> Total de Issues identificados: ~300+
> Issues corregidos en último commit: 15

## Resumen Ejecutivo

| Categoría | Count | Prioridad | Esfuerzo Estimado |
|-----------|-------|-----------|-------------------|
| Accesibilidad (React/AAA) | ~15 | Alta | 4-8 horas |
| Variables Globales (`window`) | ~170 | Media | 2-3 horas |
| Formato Numérico | ~97 | Baja | 1 hora |
| Unknown Properties (3D) | ~30 | Baja (falsos positivos) | 0 min |
| Array/Replace (falsos positivos) | ~27 | Baja (falsos positivos) | 0 min |
| Otros | ~20 | Variable | 2-4 horas |

---

## 1. ACCESIBILIDAD - ALTA PRIORIDAD ⚠️

### 1.1 Non-Native Interactive Elements (5 issues)
**Problema:** Elementos `div` con `onClick` sin soporte de teclado

**Archivos afectados:**
- `src/components/help/KeyboardShortcuts.tsx` (L121)
- `src/components/transcript/TranscriptSelector.tsx` (L214)
- `src/components/ui/RankBadge.tsx` (L61)
- `src/components/ui/Tooltip.tsx` (L77)
- `src/hooks/useMicroInteractions.tsx` (L194)

**Solución:**
```typescript
// ANTES
<div onClick={handleClick} className="cursor-pointer">

// DESPUÉS
<button
  onClick={handleClick}
  className="cursor-pointer"
  // Añadir soporte de teclado
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  role="button"
>
```

**Esfuerzo:** 30 min por archivo = **2.5 horas**

---

### 1.2 Visible Elements with Click Handlers (2 issues)
**Problema:** Elementos no interactivos con `onClick` necesitan listeners de teclado

**Archivos:**
- `src/components/help/KeyboardShortcuts.tsx` (L121)
- `src/hooks/useMicroInteractions.tsx` (L194)

**Solución:** Mismo que 1.1

**Esfuerzo:** 30 min = **0.5 horas**

---

### 1.3 Missing Captions for Media Elements (3 issues)
**Problema:** Elementos `<audio>` y `<video>` sin `<track>` para subtítulos

**Archivos:**
- `src/components/exercises/ConversationalEchoExercise.tsx` (L157)
- `src/components/exercises/DialogueIntonationExercise.tsx` (L185)
- `src/components/exercises/InteractiveSpeechExercise.tsx` (L217)

**Solución:**
```typescript
// Añadir track para captions
<audio>
  <source src={audioUrl} type="audio/webm" />
  <track kind="captions" src={captionsUrl} srclang="fr" label="Français" />
</audio>
```

**Nota:** Requiere generar archivos de subtítulos o URLs

**Esfuerzo:** **4-6 horas** (requiere infraestructura de captions)

---

### 1.4 Use Semantic HTML Instead of Roles (3 issues)
**Problema:** Usar elementos nativos en lugar de roles ARIA

**Archivos:**
- `src/app/profile/page.tsx` (2 issues)
- `src/app/dashboard/page.tsx` (1 issue)

**Solución:**
```typescript
// ANTES
<div role="progressbar" aria-valuenow={value} />

// DESPUÉS
<progress value={value} max={100} />
```

**Esfuerzo:** 15 min por archivo = **0.5 horas**

---

## 2. VARIABLES GLOBALES - MEDIA PRIORIDAD 🔧

### 2.1 Replace `window` with `globalThis` (109 issues)
**Problema:** Usar `globalThis` en lugar de `window` para mejor compatibilidad

**Archivos:** Múltiples archivos de componentes

**Solución:**
```typescript
// ANTES
if (typeof window !== 'undefined') {
  window.localStorage.setItem(...)
}

// DESPUÉS
if (typeof globalThis !== 'undefined') {
  globalThis.localStorage.setItem(...)
}
```

**Nota:** Para Next.js (SSR), esto es importante pero no crítico

**Esfuerzo:** 1 min por archivo × 109 = **2 horas**

---

### 2.2 Use `globalThis.window` (49 issues)
**Problema:** Usar `globalThis.window` en lugar de `window`

**Solución:** Similar a 2.1

**Esfuerzo:** **1 hora**

---

## 3. FORMATO Y CONSISTENCIA - BAJA PRIORIDAD 📝

### 3.1 Zero Fraction in Numbers (97 issues)
**Problema:** Usar `.0` en lugar de `.5` o eliminar fracción cero

**Ejemplo:**
```typescript
// ANTES
const value = 1.0;

// DESPUÉS
const value = 1;
```

**Archivos:** Principalmente archivos de test

**Esfuerzo:** **1 hora** (batch find-replace)

---

### 3.2 Character Class Syntax (9 issues)
**Problema:** Usar `\d` en lugar de `[0-9]`, `\w` en lugar de `[a-zA-Z0-9_]`

**Solución:**
```typescript
// ANTES
const regex = /[0-9]+/;

// DESPUÉS
const regex = /\d+/;
```

**Esfuerzo:** **30 min**

---

### 3.3 Array.at() Instead of Length-Index (12 issues)
**Problema:** Usar `.at(-1)` en lugar de `[arr.length - 1]`

**Solución:**
```typescript
// ANTES
const last = array[array.length - 1];

// DESPUÉS
const last = array.at(-1);
```

**Esfuerzo:** **30 min**

---

### 3.4 Node Protocol Imports (9 issues)
**Problema:** Usar `node:path` y `node:fs` en lugar de `path` y `fs`

**Solución:**
```typescript
// ANTES
import path from 'path';

// DESPUÉS
import path from 'node:path';
```

**Esfuerzo:** **30 min**

---

## 4. FALSE POSITIVOS - IGNORAR ✅

### 4.1 Three.js / React-Three-Fiber Properties (~30 issues)
**Problema:** SonarQube no reconoce propiedades válidas de R3F

**Propiedades:** `args`, `position`, `rotation`, `castShadow`, `receiveShadow`, `intensity`, `roughness`, `metalness`, `emissive`, `transparent`, `shadow-mapSize`, etc.

**Solución:** **No requiere acción** - son propiedades válidas de `@react-three/fiber`

**Workaround:** Añadir comment `// eslint-disable-next-line` o configurar SonarQube para ignorar

---

### 4.2 Styled Components / Emotion Properties (4 issues)
**Problema:** SonarQube no reconoce `jsx` y `global`

**Solución:** **No requiere acción** - son propiedades válidas

---

### 4.3 String.replace() with /global flag (18 issues)
**Problema:** SonarQube sugiere `replaceAll()` pero `.replace(/regex/g)` ya reemplaza todo

**Solución:** **No requiere acción** - uso correcto de `.replace()`

---

## 5. OTROS ISSUES - PRIORIDAD VARIABLE

### 5.1 Ambiguous Spacing After Span (~11 issues)
**Problema:** Espaciado ambiguo después de `<span>`

**Archivos:**
- `src/app/profile/page.tsx` (L140, L214, L269, L380)
- `src/components/construction/ConstructionHeader.tsx` (L39)
- `src/components/construction/WelcomeModal.tsx` (L35, L39, L43)

**Solución:** Revisar espaciado en JSX

**Esfuerzo:** **1 hora**

---

### 5.2 Optional Chain Instead of Logical OR (9 issues)
**Problema:** Usar `??` en lugar de `||` para casos de nullish coalescing

**Solución:**
```typescript
// ANTES
const value = fallback || compute();

// DESPUÉS (si solo quieres null/undefined)
const value = fallback ?? compute();
```

**Esfuerzo:** **30 min**

---

## 6. PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Accesibilidad Crítica (4-8 horas)
1. ✅ Form labels - **COMPLETADO**
2. ⏳ Non-native interactive elements (2.5h)
3. ⏳ Missing captions (4-6h) - requiere infraestructura
4. ⏳ Semantic HTML (0.5h)

### Fase 2: Calidad de Código (3-4 horas)
1. ✅ parseInt/parseFloat - **COMPLETADO**
2. ✅ Math.trunc - **COMPLETADO**
3. ✅ Array() - **COMPLETADO**
4. ⏳ globalThis (3h)
5. ⏳ Node protocol imports (0.5h)
6. ⏳ Array.at() (0.5h)

### Fase 3: Limpieza (2-3 horas)
1. ⏳ Zero fraction numbers (1h)
2. ⏳ Character class syntax (0.5h)
3. ⏳ Ambiguous spacing (1h)
4. ⏳ Optional chain (0.5h)

### Fase 4: Configuración (0.5h)
1. Configurar SonarQube para ignorar falsos positivos de Three.js/R3F
2. Configurar para ignorar props de styled-components

---

## 7. CONFIGURACIÓN SONARQUBE - FALSE POSITIVOS

Para ignorar los falsos positivos, añadir a `sonar-project.properties`:

```properties
# Ignorar propiedades de React Three Fiber
sonar.tsx.ignore.unknown-prop-regex=^(args|position|rotation|castShadow|receiveShadow|intensity|roughness|metalness|emissive|emissiveIntensity|transparent|shadow-.*|geometry|material|attach|object|args|map)$

# Ignorar propiedades de styled-components/emotion
sonar.tsx.ignore.unknown-prop-regex=^(jsx|global|css|theme|as|forwardedAs)$

# Ignorar archivos de test
sonar.exclusions=**/*.test.ts,**/*.test.tsx,**/__tests__/**
```

---

## 8. MÉTRICAS FINALES

| Métrica | Antes | Después (Fases 1-3) |
|---------|-------|---------------------|
| Issues Totales | ~300+ | ~50 |
| Issues Críticos | ~15 | ~0 |
| Falsos Positivos | ~60 | Ignorados |
| Coverage | - | - |

---

## 9. NOTAS IMPORTANTES

1. **Captions para audio/video**: Requiere implementación de infraestructura para generar/albergar archivos WebVTT (.vtt)

2. **Three.js properties**: Son falsos positivos, configurar SonarQube para ignorar

3. **globalThis vs window**: Para Next.js SSR, `globalThis` es mejor pero no crítico

4. **Test files**: Considerar excluir archivos de test del análisis SonarQube

5. **Presupuesto total**: **12-18 horas** de desarrollo
