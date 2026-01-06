# Lessons Learned — Lecciones Aprendidas

> Última actualización: 2026-01-06
>
> Este documento documenta patrones, anti-patrones y errores comunes que NO deben repetirse.

---

## 🔴 CRÍTICO: Zustand Hydration Race Conditions

### Problema
Zustand con persist middleware carga datos **asincrónicamente** desde localStorage, pero los componentes renderizan **inmediatamente** con valores iniciales.

### Error Común
```typescript
// ❌ INCORRECTO - Race condition
export default function HomePage() {
  const { hasCompletedOnboarding } = useUserStore();

  // Primer render: hasCompletedOnboarding = false (initialState)
  // useEffect se ejecuta después, pero ya tomó la decisión incorrecta
  if (hasCompletedOnboarding) {
    router.push('/learn'); // NUNCA se ejecuta en el primer render
  }

  return <Onboarding />; // Se muestra aunque el usuario ya completó onboarding
}
```

### Solución Correcta
```typescript
// ✅ CORRECTO - Esperar hidratación
export default function HomePage() {
  const { hasCompletedOnboarding } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    return <LoadingSpinner />; // Esperar a que Zustand cargue
  }

  // Ahora es seguro usar datos del store
  if (hasCompletedOnboarding) {
    router.push('/learn');
  }

  return <Onboarding />;
}
```

### Regla de Oro
**SIEMPRE** agregar `isHydrated` state cuando un componente toma decisiones basadas en datos de Zustand persistidos.

### Archivos que deben seguir este patrón
- Cualquier página que redirija basada en estado del usuario
- Componentes que muestran/ocultan contenido basado en preferencias
- Páginas que verifican autenticación o onboarding

---

## 🔴 CRÍTICO: Zustand Selectors con Funciones

### Problema
Llamar funciones dentro de selectores de Zustand causa **infinite loops** porque cada llamada crea una nueva referencia.

### Error Común
```typescript
// ❌ INCORRECTO - Infinite loop
export function useCognitiveLoad() {
  return useCognitiveLoadStore((state) => ({
    load: state.currentLoad,
    status: state.getLoadStatus(), // ← Nueva función en cada render
  }));
}
```

### Solución Correcta
```typescript
// ✅ CORRECTO - Calcular fuera del selector
export function useCognitiveLoad() {
  const load = useCognitiveLoadStore((state) => state.currentLoad);

  // Calcular derivados FUERA del selector
  const status = useMemo(() => {
    if (load > 80) return 'overloaded';
    if (load > 50) return 'elevated';
    return 'normal';
  }, [load]);

  return { load, status };
}
```

### Regla de Oro
**NUNCA** llamar funciones dentro de selectores de Zustand. Calcular valores derivados afuera con `useMemo`.

---

## 🔴 CRÍTICO: useEffect con Funciones del Store

### Problema
Usar funciones de Zustand como dependencias de useEffect puede causar **múltiples ejecuciones no deseadas**.

### Error Común
```typescript
// ❌ INCORRECTO - Se ejecuta en cada render
useEffect(() => {
  generateDailyMissions();
}, [generateDailyMissions]); // ← Nueva referencia en cada render
```

### Solución Correcta
```typescript
// ✅ CORRECTO - Usar useRef para ejecutar una sola vez
const hasGenerated = useRef(false);

useEffect(() => {
  if (!hasGenerated.current) {
    generateDailyMissions();
    hasGenerated.current = true;
  }
}, []); // Sin dependencias del store
```

### Regla de Oro
Usar `useRef` para ejecutar efectos una sola vez cuando las funciones del store son dependencias.

---

## 🟡 IMPORTANTE: FocusMode No Debe Ocultar Contenido

### Problema
El componente FocusMode solo renderizaba children cuando `isActive=true`, ocultando todo el contenido cuando el focus mode estaba desactivado.

### Error Común
```typescript
// ❌ INCORRECTO - Children solo se muestran cuando isActive=true
{isActive && (
  <FocusModeOverlay>
    {children}
  </FocusModeOverlay>
)}
```

### Solución Correcta
```typescript
// ✅ CORRECTO - Renderizar children normalmente cuando está inactivo
<>
  {/* Contenido normal (cuando FocusMode NO está activo) */}
  {!isActive && children}

  {/* Focus Mode Overlay cuando está activo */}
  {isActive && (
    <FocusModeOverlay>
      {children}
    </FocusModeOverlay>
  )}
</>
```

### Regla de Oro
Los componentes de modo "focus" o "fullscreen" deben **siempre** renderizar el contenido normalmente cuando están inactivos.

---

## 🟡 IMPORTANTE: Estado Inicial de Ejercicios

### Problema
La página de ejercicios comenzaba con `pagePhase='warmup-choice'` en lugar de `'exercise-menu'`, obligando al usuario a ver warmup primero.

### Error Común
```typescript
// ❌ INCORRECTO - Fuerza warmup primero
const [pagePhase, setPagePhase] = useState<PagePhase>('warmup-choice');
```

### Solución Correcta
```typescript
// ✅ CORRECTO - Comienza con el menú de ejercicios
const [pagePhase, setPagePhase] = useState<PagePhase>('exercise-menu');
```

### Regla de Oro
Si un feature es **opcional**, el estado inicial debe permitir al usuario **acceder directamente** a la funcionalidad principal.

---

## 🟡 IMPORTANTE: Debug Logging Estratégico

### Problema
Sin logs adecuados, es imposible diagnosticar problemas de persistencia o hidratación.

### Patrón Correcto
```typescript
// ✅ Estrategia de logging para stores con persist
const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAppLanguage: (appLanguage) => {
        console.log('[UserStore] setAppLanguage:', appLanguage);
        set({ appLanguage });

        // Verificar que se guardó
        setTimeout(() => {
          const stored = localStorage.getItem('linguaforge-user');
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log('[UserStore] Después de setAppLanguage:', parsed.state?.appLanguage);
          }
        }, 100);
      },
    }),
    {
      name: 'linguaforge-user',
      onRehydrateStorage: () => (state) => {
        console.log('[UserStore] Rehidratando store...');
        console.log('[UserStore] Estado cargado:', state);
      },
    }
  )
);
```

### Regla de Oro
Para stores críticos (usuario, progreso), agregar:
1. Logs en cada setter
2. Verificación de localStorage después de set
3. `onRehydrateStorage` callback para depuración

---

## 🟢 BUENA PRÁCTICA: useMemo para Evitar Re-cálculos

### Problema
Calcular valores derivados en cada render causa problemas de rendimiento y puede causar infinite loops.

### Patrón Correcto
```typescript
// ✅ Usar useMemo para cálculos costosos o derivados
const subtopic = useMemo(() =>
  node?.subtopics.find((s) => s.id === subtopicId),
  [node, subtopicId]
);

const status = useMemo(() => {
  if (load > 80) return 'overloaded';
  if (load > 50) return 'elevated';
  return 'normal';
}, [load]);
```

### Regla de Oro
Usar `useMemo` para:
- Búsquedas en arrays/objetos
- Cálculos basados en múltiples valores
- Valores derivados que se usan en efectos o renders

---

## 🟢 BUENA PRÁCTICA: Tipos Explícitos en TypeScript

### Problema
Dejar TypeScript inferir tipos puede causar errores sutiles, especialmente con Zod.

### Patrón Correcto
```typescript
// ✅ Tipos explícitos everywhere
export function ClozeExercise({ phrase, block, onComplete }: ClozeExerciseProps) {
  // ...
}

const [pagePhase, setPagePhase] = useState<PagePhase>('exercise-menu');

type Step = 'language' | 'mode' | 'complete';
```

### Regla de Oro
**SIEMPRE** definir tipos explícitos para:
- Props de componentes
- Estados de useState
- Parámetros de funciones
- Retornos de funciones

---

## 🟢 BUENA PRÁCTICA: No Magic Numbers/Strings

### Problema
Usar valores literales "mágicos" hace el código difícil de mantener.

### Patrón Correcto
```typescript
// ❌ INCORRECTO
if (load > 80) { /* ... */ }

// ✅ CORRECTO
const COGNITIVE_LOAD_THRESHOLDS = {
  OVERLOADED: 80,
  ELEVATED: 50,
  NORMAL: 0,
} as const;

if (load > COGNITIVE_LOAD_THRESHOLDS.OVERLOADED) { /* ... */ }
```

### Regla de Oro
Extraer constantes con nombres descriptivos para cualquier valor que no sea trivialmente obvio (0, 1, -1).

---

## 🟢 BUENA PRÁCTICA: Validación Zod en Runtime

### Problema
Definir schemas Zod pero no usarlos en runtime pierde el beneficio de la validación.

### Patrón Correcto
```typescript
// ✅ Validar SIEMPRE datos de APIs externas
import { LessonContentSchema } from '@/schemas/content';

async function fetchLesson(leafId: string): Promise<LessonContent> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('leaf_id', leafId)
    .single();

  if (error) throw error;

  // Validar en runtime
  return LessonContentSchema.parse(data);
}
```

### Regla de Oro
**SIEMPRE** usar `.parse()` de Zod para validar datos que vienen de:
- APIs externas
- Supabase/DB
- localStorage
- Inputs de usuario

---

## 📋 Checklist Antes de Considerar Código "Completo"

- [ ] **Zustand:** ¿Tiene `isHydrated` state si toma decisiones basadas en datos persistidos?
- [ ] **Zustand:** ¿Los selectores solo acceden valores primitivos, no funciones?
- [ ] **useEffect:** ¿Las dependencias están correctas? ¿Usa useRef si hay funciones del store?
- [ ] **Tipos:** ¿Todos los props, estados, parámetros y retornos tienen tipos explícitos?
- [ ] **Magic values:** ¿Hay constantes con nombres en vez de números/strings literales?
- [ ] **Validation:** ¿Los datos de APIs/DB se validan con Zod en runtime?
- [ ] **Performance:** ¿Los cálculos costosos usan useMemo?
- [ ] **Logs:** ¿Los stores críticos tienen logging para depuración?

---

## 🔗 Referencias

- [Zustand Persist Documentation](https://github.com/pmndrs/zustand#persist-middleware)
- [React Hook Dependencies](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
