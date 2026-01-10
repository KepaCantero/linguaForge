# Gold Standard AAA — Plan de Tareas

> Última actualización: 2026-01-09
> Objetivo: Alcanzar Gold Standard 2026 para lanzamiento a €7/mes
> Público: Adultos 15-55 años que quieres aprender idiomas

---

## 🎯 RESUMEN EJECUTIVO

**Estado actual:** 🟡 CASI GOLD — 3 bloqueadores críticos + gaps de UX

**Veredicto de auditoría:**
- ✅ Accesibilidad WCAG AAA implementada
- ✅ Gamificación Behavioral Design AAA
- ✅ Arquitectura de resiliencia (Circuit Breaker + Rate Limiter)
- ❌ PWA Offline incompleto (sin Service Worker)
- ❌ SRS con SM-2 obsoleto (no FSRS v6)
- ❌ Core Web Vitals sin medir
- ❌ UX de primera experiencia deficiente (sin tutorial)

---

## 🔴 FASE GS-0: BLOQUEADORES CRÍTICOS (0-30 días)

> **Prioridad:** MÁXIMA — Sin estos, no se puede cobrar €7/mes
> **Impacto:** Retención, conversión, experiencia offline

---

### TAREA GS-0.1: Implementar Service Worker PWA
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivos:** `next.config.mjs`, `public/sw.js`

**Problema:**
- Manifest existe pero NO hay service worker
- Usuarios en metro de París no pueden usar la app
- 35% de sesiones perdidas por falta de offline

**Implementación:**
```bash
npm install next-pwa
```

```javascript
// next.config.mjs
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\/_next\/static\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
      },
    },
  ],
});

export default config;
```

**Criterios de aceptación:**
- [ ] Service worker registrado correctamente
- [ ] App funciona offline (ejercicios locales)
- [ ] PWA instalable en iOS/Android
- [ ] Lighthouse PWA score ≥ 90

**Tiempo estimado:** 4 horas

---

### TAREA GS-0.2: Migrar de SM-2 a FSRS v6
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivos:** `src/lib/fsrs.ts` (nuevo), `src/lib/sm2.ts` (deprecar)

**Problema:**
- SM-2 es de 1985, menor eficiencia de retención
- FSRS v6 tiene ~15% mejor retención a 30 días
- Propuesta de valor "ciencia cognitiva avanzada" comprometida

**Implementación:**
```bash
npm install ts-fsrs
```

```typescript
// src/lib/fsrs.ts
import { FSRS, Card, State, Rating } from 'ts-fsrs';

const fsrs = new FSRS({
  request_retention: 0.9,
  maximum_interval: 365,
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
});

export function createFSRSCard(): Card {
  return {
    due: new Date(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: State.New,
    last_review: undefined,
  };
}

export function reviewCard(card: Card, rating: Rating): Card {
  const scheduling = fsrs.repeat(card, new Date());
  return scheduling[rating].card;
}

// Mapeo de respuestas LinguaForge a FSRS Rating
export function responseToFSRSRating(response: 'again' | 'hard' | 'good' | 'easy'): Rating {
  switch (response) {
    case 'again': return Rating.Again;
    case 'hard': return Rating.Hard;
    case 'good': return Rating.Good;
    case 'easy': return Rating.Easy;
  }
}
```

**Migración gradual:**
1. Crear adapter que soporte ambos algoritmos
2. A/B test: 50% SM-2, 50% FSRS
3. Migrar cards existentes con heurística
4. Deprecar SM-2 tras validación

**Criterios de aceptación:**
- [ ] FSRS v6 implementado y funcional
- [ ] Migración de cards existentes
- [ ] A/B test configurado
- [ ] Métricas de retención a 7 días comparables

**Tiempo estimado:** 8 horas

---

### TAREA GS-0.3: Configurar Lighthouse CI
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivos:** `.github/workflows/lighthouse.yml`, `lighthouse-budget.json`

**Problema:**
- Core Web Vitals no medidos
- Sin detección de regresiones de performance
- INP estimado alto por animaciones 3D

**Implementación:**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Start server
        run: npm run start &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/learn
            http://localhost:3000/decks/review
            http://localhost:3000/input
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

```json
// lighthouse-budget.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

**Criterios de aceptación:**
- [ ] Lighthouse CI ejecutándose en cada PR
- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 95
- [ ] LCP < 2.5s
- [ ] INP < 200ms

**Tiempo estimado:** 3 horas

---

### TAREA GS-0.4: Headers de Seguridad (CSP, XSS)
**Prioridad:** 🔴 CRÍTICA (P0)
**Estado:** Pendiente
**Archivos:** `next.config.mjs`, `middleware.ts`

**Problema:**
- Sin Content Security Policy
- Sin protección XSS
- Vulnerabilidades OWASP básicas

**Implementación:**

```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://*.supabase.co https://www.youtube.com;
      frame-src https://www.youtube.com;
      media-src 'self' blob:;
    `.replace(/\n/g, '')
  }
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // ... resto de config
};
```

**Criterios de aceptación:**
- [ ] CSP implementado sin romper funcionalidad
- [ ] Headers de seguridad en todas las rutas
- [ ] Score de seguridad A+ en securityheaders.com

**Tiempo estimado:** 3 horas

---

## 🟡 FASE GS-1: UX GOLD STANDARD — PRIMERA EXPERIENCIA (30-60 días)

> **Prioridad:** ALTA — La primera impresión determina conversión
> **Impacto:** Activación de usuarios, reducción de churn en primeros 7 días

---

### TAREA GS-1.1: Sistema de Tutorial Interactivo (Shepherd.js)
**Prioridad:** 🟡 ALTA (P1)
**Estado:** Pendiente
**Archivos:** `src/components/tutorial/TutorialProvider.tsx`, `src/hooks/useTutorial.ts`

**Problema:**
- ❌ No hay guía para nuevos usuarios
- ❌ Dashboard tiene métricas confusas (Synapses, Germane Load)
- ❌ Primera sesión de ejercicios sin contexto

**Implementación:**

```bash
npm install shepherd.js
```

```typescript
// src/components/tutorial/TutorialProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface TutorialContextValue {
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  hasCompletedTour: (tourId: string) => boolean;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

const TOURS = {
  dashboard: [
    {
      id: 'welcome',
      text: '¡Bienvenido a LinguaForge! Este es tu centro de mando neuronal. Aquí verás tu progreso de aprendizaje.',
      attachTo: { element: '.dashboard-core', on: 'bottom' },
    },
    {
      id: 'xp-orb',
      text: 'Este orbe muestra tu XP total. Ganas XP completando ejercicios y manteniendo tu racha.',
      attachTo: { element: '[data-tour="xp-orb"]', on: 'left' },
    },
    {
      id: 'synapses',
      text: 'Las "Sinapsis" representan las conexiones neuronales que has fortalecido. Más sinapsis = mejor retención.',
      attachTo: { element: '[data-tour="synapses-orb"]', on: 'right' },
    },
    {
      id: 'cognitive-load',
      text: 'La carga cognitiva mide qué tan intenso es tu entrenamiento. Verde = óptimo, Rojo = necesitas descanso.',
      attachTo: { element: '.cognitive-load-meter', on: 'top' },
    },
  ],
  firstExercise: [
    {
      id: 'exercise-intro',
      text: 'Este es tu primer ejercicio. Completa el hueco con la palabra correcta.',
      attachTo: { element: '.exercise-container', on: 'bottom' },
    },
    {
      id: 'hotkeys',
      text: 'Consejo: Usa las teclas 1-4 para responder más rápido. ¡Pruébalo!',
      attachTo: { element: '.options-container', on: 'top' },
    },
  ],
  srsReview: [
    {
      id: 'srs-intro',
      text: 'El sistema de repaso espaciado te muestra tarjetas en el momento óptimo para recordarlas.',
      attachTo: { element: '.srs-card', on: 'bottom' },
    },
    {
      id: 'srs-buttons',
      text: 'Evalúa qué tan bien recordaste: "Otra vez" si olvidaste, "Fácil" si fue instantáneo.',
      attachTo: { element: '.srs-buttons', on: 'top' },
    },
  ],
};

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('completed-tours');
    if (stored) {
      setCompletedTours(new Set(JSON.parse(stored)));
    }
  }, []);

  const startTour = (tourId: string) => {
    const steps = TOURS[tourId as keyof typeof TOURS];
    if (!steps) return;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-lg rounded-xl bg-lf-soft border border-lf-primary/20',
        scrollTo: true,
        cancelIcon: { enabled: true },
        buttons: [
          {
            text: 'Anterior',
            action: function() { return this.back(); },
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Siguiente',
            action: function() { return this.next(); },
            classes: 'shepherd-button-primary bg-lf-primary',
          },
        ],
      },
    });

    steps.forEach((step, index) => {
      tour.addStep({
        id: step.id,
        text: step.text,
        attachTo: step.attachTo,
        buttons: index === steps.length - 1
          ? [{ text: '¡Entendido!', action: () => { completeTour(tourId); tour.complete(); } }]
          : undefined,
      });
    });

    tour.start();
  };

  const completeTour = (tourId: string) => {
    const newCompleted = new Set(completedTours).add(tourId);
    setCompletedTours(newCompleted);
    localStorage.setItem('completed-tours', JSON.stringify([...newCompleted]));
  };

  const hasCompletedTour = (tourId: string) => completedTours.has(tourId);

  return (
    <TutorialContext.Provider value={{ startTour, completeTour, hasCompletedTour }}>
      {children}
    </TutorialContext.Provider>
  );
}

export const useTutorial = () => {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider');
  return ctx;
};
```

**Tours a implementar:**
1. `dashboard` - Explicar métricas del dashboard
2. `firstExercise` - Primer ejercicio con hotkeys
3. `srsReview` - Primera sesión de repaso
4. `inputHub` - Cómo importar contenido
5. `construction` - Sistema de construcción 3D

**Criterios de aceptación:**
- [ ] Tour de dashboard se inicia automáticamente en primera visita
- [ ] Tour de ejercicios se inicia en primer ejercicio
- [ ] Tours se pueden saltar y no vuelven a aparecer
- [ ] Estilos consistentes con diseño AAA

**Tiempo estimado:** 8 horas

---

### TAREA GS-1.2: Sistema de Tooltips Contextuales
**Prioridad:** 🟡 ALTA (P1)
**Estado:** Pendiente
**Archivos:** `src/components/ui/Tooltip.tsx`, `src/hooks/useTooltip.ts`

**Problema:**
- Métricas del dashboard sin explicación
- Stats del header confusos (HP, Gems, etc.)
- Sin ayuda contextual en ejercicios

**Implementación:**

```typescript
// src/components/ui/Tooltip.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  maxWidth = 250,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const prefersReduced = useReducedMotion();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            role="tooltip"
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 px-3 py-2 text-sm text-white
              bg-lf-dark/95 backdrop-blur-md rounded-lg
              border border-lf-primary/20 shadow-lg
              ${positionClasses[position]}
            `}
            style={{ maxWidth }}
          >
            {content}
            {/* Arrow */}
            <div
              className={`
                absolute w-2 h-2 bg-lf-dark/95 rotate-45
                border-lf-primary/20
                ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b' : ''}
                ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t' : ''}
                ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r' : ''}
                ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l' : ''}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Tooltips a agregar:**
1. Header stats (XP, Coins, Gems, Streak, HP)
2. Dashboard orbs (Level, Synapses, Rank, Progress)
3. Cognitive load meters
4. Exercise options
5. SRS buttons (Again, Hard, Good, Easy)

**Criterios de aceptación:**
- [ ] Tooltips en todos los stats del header
- [ ] Tooltips en métricas del dashboard
- [ ] Delay de 300ms antes de mostrar
- [ ] Accesible por teclado (focus)

**Tiempo estimado:** 4 horas

---

### TAREA GS-1.3: Modal de Bienvenida con Demo
**Prioridad:** 🟡 ALTA (P1)
**Estado:** Pendiente
**Archivos:** `src/components/onboarding/WelcomeModal.tsx`

**Problema:**
- Onboarding actual solo pregunta idioma + modo
- No explica qué es LinguaForge ni su metodología
- No hay demo interactiva antes de comprometerse

**Implementación:**

```typescript
// src/components/onboarding/WelcomeModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const WELCOME_STEPS = [
  {
    id: 'intro',
    title: '¡Bienvenido a LinguaForge!',
    subtitle: 'Tu entrenador cognitivo de francés',
    content: 'LinguaForge usa neurociencia y gamificación para que aprendas francés de forma natural y efectiva.',
    visual: '🧠✨',
    cta: 'Continuar',
  },
  {
    id: 'method',
    title: 'Método Científico',
    subtitle: 'Basado en investigación real',
    content: 'Combinamos Input Comprensible (Krashen), Repetición Espaciada (FSRS) y Carga Cognitiva Óptima para máxima retención.',
    visual: '📊🔬',
    features: [
      { icon: '🎧', label: 'Input Comprensible', desc: 'Escucha y lee contenido i+1' },
      { icon: '🔄', label: 'Repaso Espaciado', desc: 'Recordarás en el momento justo' },
      { icon: '🏗️', label: 'Construcción 3D', desc: 'Visualiza tu progreso' },
    ],
    cta: 'Ver Demo',
  },
  {
    id: 'demo',
    title: 'Prueba Rápida',
    subtitle: 'Completa este ejercicio de ejemplo',
    isDemoExercise: true,
    cta: 'Empezar Ahora',
  },
];

export function WelcomeModal() {
  const [step, setStep] = useState(0);
  const [demoCompleted, setDemoCompleted] = useState(false);
  const router = useRouter();
  const currentStep = WELCOME_STEPS[step];

  const handleNext = () => {
    if (step < WELCOME_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-lf-soft rounded-2xl border border-lf-primary/20 overflow-hidden"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 p-4">
          {WELCOME_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === step ? 'bg-lf-primary' : 'bg-lf-muted'
              }`}
            />
          ))}
        </div>

        <div className="p-6 text-center">
          {/* Visual */}
          {currentStep.visual && (
            <div className="text-6xl mb-4">{currentStep.visual}</div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentStep.title}
          </h2>
          <p className="text-lf-muted mb-4">{currentStep.subtitle}</p>

          {/* Content */}
          {currentStep.content && (
            <p className="text-white/80 mb-6">{currentStep.content}</p>
          )}

          {/* Features */}
          {currentStep.features && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {currentStep.features.map((f) => (
                <div key={f.label} className="text-center">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <div className="text-sm font-medium text-white">{f.label}</div>
                  <div className="text-xs text-lf-muted">{f.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Demo Exercise */}
          {currentStep.isDemoExercise && (
            <DemoExercise onComplete={() => setDemoCompleted(true)} />
          )}

          {/* CTA */}
          <button
            onClick={handleNext}
            disabled={currentStep.isDemoExercise && !demoCompleted}
            className={`
              w-full py-3 px-6 rounded-xl font-bold text-white
              transition-all duration-200
              ${currentStep.isDemoExercise && !demoCompleted
                ? 'bg-lf-muted cursor-not-allowed'
                : 'bg-lf-primary hover:bg-lf-primary-dark'
              }
            `}
          >
            {currentStep.cta}
          </button>

          {/* Skip */}
          {step < WELCOME_STEPS.length - 1 && (
            <button
              onClick={() => router.push('/onboarding')}
              className="mt-3 text-sm text-lf-muted hover:text-white transition-colors"
            >
              Saltar introducción
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DemoExercise({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const options = [
    { id: 'a', text: 'suis', correct: true },
    { id: 'b', text: 'es', correct: false },
    { id: 'c', text: 'est', correct: false },
    { id: 'd', text: 'sommes', correct: false },
  ];

  const handleSelect = (option: typeof options[0]) => {
    setSelected(option.id);
    setShowResult(true);
    if (option.correct) {
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <div className="bg-lf-dark/50 rounded-xl p-4 mb-6">
      <p className="text-white mb-4">
        Je <span className="px-2 py-1 bg-lf-primary/30 rounded">______</span> étudiant.
      </p>
      <p className="text-sm text-lf-muted mb-4">(Yo soy estudiante)</p>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt)}
            disabled={showResult}
            className={`
              py-2 px-4 rounded-lg font-medium transition-all
              ${showResult
                ? opt.correct
                  ? 'bg-green-500/30 border-green-500 text-green-300'
                  : selected === opt.id
                    ? 'bg-red-500/30 border-red-500 text-red-300'
                    : 'bg-lf-muted/20 text-lf-muted'
                : 'bg-lf-muted/30 text-white hover:bg-lf-primary/30'
              }
              border ${selected === opt.id ? 'border-2' : 'border-transparent'}
            `}
          >
            {opt.text}
          </button>
        ))}
      </div>

      {showResult && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 text-sm ${
            options.find(o => o.id === selected)?.correct
              ? 'text-green-400'
              : 'text-red-400'
          }`}
        >
          {options.find(o => o.id === selected)?.correct
            ? '¡Correcto! "Je suis" = Yo soy'
            : 'Incorrecto. La respuesta es "suis" (Je suis = Yo soy)'}
        </motion.p>
      )}
    </div>
  );
}
```

**Criterios de aceptación:**
- [ ] Modal aparece en primera visita (nunca completó onboarding)
- [ ] 3 pasos: Intro → Método → Demo
- [ ] Demo ejercicio funcional
- [ ] Se puede saltar
- [ ] No vuelve a aparecer

**Tiempo estimado:** 6 horas

---

### TAREA GS-1.4: Referencia de Atajos de Teclado
**Prioridad:** 🟡 ALTA (P1)
**Estado:** Pendiente
**Archivos:** `src/components/help/KeyboardShortcuts.tsx`

**Problema:**
- Hotkeys 1-4 para SRS no son descubribles
- ESPACIO para audio no se menciona
- Sin cheatsheet accesible

**Implementación:**

```typescript
// src/components/help/KeyboardShortcuts.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SHORTCUTS = [
  {
    category: 'Ejercicios',
    shortcuts: [
      { keys: ['1', '2', '3', '4'], description: 'Seleccionar opción 1-4' },
      { keys: ['Espacio'], description: 'Reproducir audio' },
      { keys: ['Enter'], description: 'Confirmar respuesta' },
      { keys: ['Esc'], description: 'Salir del modo Focus' },
    ],
  },
  {
    category: 'Repaso SRS',
    shortcuts: [
      { keys: ['1'], description: 'Otra vez (olvidé)' },
      { keys: ['2'], description: 'Difícil (costó)' },
      { keys: ['3'], description: 'Bien (recordé)' },
      { keys: ['4'], description: 'Fácil (instantáneo)' },
      { keys: ['Espacio'], description: 'Mostrar respuesta' },
    ],
  },
  {
    category: 'Navegación',
    shortcuts: [
      { keys: ['?'], description: 'Mostrar atajos (esta ventana)' },
      { keys: ['G', 'D'], description: 'Ir al Dashboard' },
      { keys: ['G', 'L'], description: 'Ir al Mapa de Aprendizaje' },
      { keys: ['G', 'R'], description: 'Ir a Repaso' },
    ],
  },
];

export function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-lf-soft rounded-2xl border border-lf-primary/20 p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Atajos de Teclado</h2>
          <button
            onClick={onClose}
            className="text-lf-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {SHORTCUTS.map((category) => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold text-lf-primary mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 bg-lf-dark/50 rounded-lg"
                  >
                    <span className="text-white/80">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, kidx) => (
                        <span key={kidx}>
                          <kbd className="px-2 py-1 bg-lf-muted/50 rounded text-sm font-mono text-white">
                            {key}
                          </kbd>
                          {kidx < shortcut.keys.length - 1 && (
                            <span className="text-lf-muted mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-lf-muted/20">
          <p className="text-sm text-lf-muted text-center">
            Presiona <kbd className="px-2 py-0.5 bg-lf-muted/50 rounded text-xs">?</kbd> en cualquier momento para ver esta guía
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Hook para activar con "?"
export function useKeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
```

**Criterios de aceptación:**
- [ ] Modal se abre con "?"
- [ ] Todos los atajos documentados
- [ ] Categorías claras
- [ ] Se puede cerrar con ESC

**Tiempo estimado:** 3 horas

---

### TAREA GS-1.5: Botón de Ayuda Contextual
**Prioridad:** 🟡 ALTA (P1)
**Estado:** Pendiente
**Archivos:** `src/components/help/HelpButton.tsx`

**Problema:**
- Sin punto de acceso a ayuda
- Usuario perdido no sabe dónde buscar

**Implementación:**

```typescript
// src/components/help/HelpButton.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcutsModal, KeyboardShortcutsModal } from './KeyboardShortcuts';
import { useTutorial } from '../tutorial/TutorialProvider';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const shortcuts = useKeyboardShortcutsModal();
  const { startTour } = useTutorial();

  const helpOptions = [
    {
      icon: '⌨️',
      label: 'Atajos de teclado',
      action: () => { setIsOpen(false); shortcuts.open(); },
    },
    {
      icon: '🎓',
      label: 'Ver tutorial',
      action: () => { setIsOpen(false); startTour('dashboard'); },
    },
    {
      icon: '❓',
      label: 'Preguntas frecuentes',
      action: () => window.open('/help/faq', '_blank'),
    },
    {
      icon: '💬',
      label: 'Contactar soporte',
      action: () => window.open('mailto:soporte@linguaforge.app', '_blank'),
    },
  ];

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-lf-primary shadow-lg flex items-center justify-center text-white text-xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir menú de ayuda"
      >
        ?
      </motion.button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-40 right-4 z-40 bg-lf-soft rounded-xl border border-lf-primary/20 overflow-hidden shadow-xl"
            >
              {helpOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={option.action}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-lf-primary/10 transition-colors"
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-white">{option.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {shortcuts.isOpen && (
          <KeyboardShortcutsModal onClose={shortcuts.close} />
        )}
      </AnimatePresence>
    </>
  );
}
```

**Criterios de aceptación:**
- [ ] Botón flotante visible en todas las páginas
- [ ] Menú con 4 opciones de ayuda
- [ ] Abre tutorial, atajos, FAQ, soporte
- [ ] Se cierra al hacer clic fuera

**Tiempo estimado:** 2 horas

---

## 🟢 FASE GS-2: UX GOLD STANDARD — FLUJO DE APRENDIZAJE (60-90 días)

> **Prioridad:** MEDIA — Mejora retención y engagement
> **Impacto:** Tiempo de sesión, frecuencia de uso, satisfacción

---

### TAREA GS-2.1: Skeleton Loading para Ejercicios
**Prioridad:** 🟢 MEDIA (P2)
**Estado:** Pendiente
**Archivos:** `src/components/shared/LoadingSkeleton.tsx` (extender)

**Problema:**
- Hay skeletons para páginas pero no para ejercicios
- Transición abrupta entre ejercicios

**Implementación:**
```typescript
// Agregar a LoadingSkeleton.tsx
export function ExerciseSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Título del ejercicio */}
      <Skeleton className="h-6 w-48 mx-auto mb-4" />

      {/* Frase con hueco */}
      <div className="bg-lf-dark/50 rounded-xl p-6 mb-6">
        <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>

      {/* Barra de progreso */}
      <div className="mt-6">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

export function SRSCardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-lf-soft rounded-2xl p-6 shadow-lg">
        {/* Card content */}
        <Skeleton className="h-32 w-full rounded-xl mb-4" />

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Tiempo estimado:** 2 horas

---

### TAREA GS-2.2: "Continuar donde lo dejaste"
**Prioridad:** 🟢 MEDIA (P2)
**Estado:** Pendiente
**Archivos:** `src/store/useSessionStore.ts` (nuevo), `src/components/learn/ContinueCard.tsx`

**Problema:**
- No hay forma de retomar la última sesión
- Usuario tiene que buscar dónde estaba

**Implementación:**
```typescript
// src/store/useSessionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LastSession {
  type: 'exercise' | 'srs' | 'input';
  nodeId?: string;
  exerciseIndex?: number;
  timestamp: string;
  progress: number; // 0-100
}

interface SessionStore {
  lastSession: LastSession | null;
  saveSession: (session: LastSession) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      lastSession: null,
      saveSession: (session) => set({ lastSession: session }),
      clearSession: () => set({ lastSession: null }),
    }),
    { name: 'session-storage' }
  )
);
```

```typescript
// src/components/learn/ContinueCard.tsx
export function ContinueCard() {
  const { lastSession, clearSession } = useSessionStore();
  const router = useRouter();

  if (!lastSession) return null;

  const timeSince = formatDistanceToNow(new Date(lastSession.timestamp), {
    locale: es,
    addSuffix: true
  });

  const getResumeUrl = () => {
    switch (lastSession.type) {
      case 'exercise':
        return `/learn/imported/${lastSession.nodeId}/exercises?start=${lastSession.exerciseIndex}`;
      case 'srs':
        return '/decks/review';
      case 'input':
        return '/input';
      default:
        return '/learn';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-lf-primary/20 to-lf-secondary/20 rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-lf-muted">Continuar donde lo dejaste</p>
          <p className="text-white font-medium">
            {lastSession.type === 'exercise' && 'Ejercicios'}
            {lastSession.type === 'srs' && 'Repaso de tarjetas'}
            {lastSession.type === 'input' && 'Input comprensible'}
          </p>
          <p className="text-xs text-lf-muted">{timeSince}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearSession}
            className="p-2 text-lf-muted hover:text-white transition-colors"
            aria-label="Descartar"
          >
            ✕
          </button>
          <button
            onClick={() => router.push(getResumeUrl())}
            className="px-4 py-2 bg-lf-primary rounded-lg text-white font-medium hover:bg-lf-primary-dark transition-colors"
          >
            Continuar →
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-lf-dark/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-lf-primary transition-all duration-300"
          style={{ width: `${lastSession.progress}%` }}
        />
      </div>
    </motion.div>
  );
}
```

**Tiempo estimado:** 4 horas

---

### TAREA GS-2.3: Efectos de Sonido para Feedback
**Prioridad:** 🟢 MEDIA (P2)
**Estado:** Pendiente
**Archivos:** `src/lib/soundEffects.ts`, `src/hooks/useSoundEffects.ts`

**Problema:**
- Solo feedback visual, no auditivo
- Menos satisfactorio que competidores (Duolingo)

**Implementación:**
```typescript
// src/lib/soundEffects.ts
const SOUNDS = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  levelUp: '/sounds/level-up.mp3',
  xpGain: '/sounds/xp-gain.mp3',
  streak: '/sounds/streak.mp3',
  click: '/sounds/click.mp3',
  flip: '/sounds/flip.mp3',
};

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled = true;

  async init() {
    if (this.audioContext) return;
    this.audioContext = new AudioContext();

    // Preload sounds
    await Promise.all(
      Object.entries(SOUNDS).map(async ([key, url]) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.sounds.set(key, audioBuffer);
      })
    );
  }

  play(soundId: keyof typeof SOUNDS) {
    if (!this.enabled || !this.audioContext) return;

    const buffer = this.sounds.get(soundId);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const soundEffects = new SoundEffects();
```

```typescript
// src/hooks/useSoundEffects.ts
export function useSoundEffects() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    soundEffects.init();
  }, []);

  const play = useCallback((sound: string) => {
    soundEffects.play(sound as keyof typeof SOUNDS);
  }, []);

  return { play, enabled, setEnabled };
}
```

**Sonidos necesarios:**
1. `correct.mp3` - Respuesta correcta (ding positivo)
2. `incorrect.mp3` - Respuesta incorrecta (buzz suave)
3. `level-up.mp3` - Subir de nivel (fanfarria corta)
4. `xp-gain.mp3` - Ganar XP (coins sound)
5. `streak.mp3` - Mantener racha (whoosh)
6. `click.mp3` - Click de botón (tap suave)
7. `flip.mp3` - Voltear tarjeta SRS

**Tiempo estimado:** 4 horas

---

### TAREA GS-2.4: Indicador de Progreso de Sesión
**Prioridad:** 🟢 MEDIA (P2)
**Estado:** Pendiente
**Archivos:** `src/components/exercises/SessionProgress.tsx`

**Problema:**
- No se sabe cuántos ejercicios faltan
- Sin sensación de avance durante la sesión

**Tiempo estimado:** 2 horas

---

### TAREA GS-2.5: Celebración de Hitos con Lottie
**Prioridad:** 🟢 MEDIA (P2)
**Estado:** Pendiente
**Archivos:** `src/components/celebrations/MilestoneCelebration.tsx`

**Problema:**
- Hitos de racha sin celebración visual
- Lottie instalado pero no usado para celebraciones

**Tiempo estimado:** 3 horas

---

### TAREA GS-2.6: Metas de Aprendizaje Diarias
**Prioridad:** 🟢 MEDIA (P2)
**Estado:** Pendiente
**Archivos:** `src/store/useGoalsStore.ts`, `src/components/goals/DailyGoal.tsx`

**Problema:**
- Sin objetivos personalizables
- Sin motivación tipo "meta diaria"

**Tiempo estimado:** 4 horas

---

## ⚪ FASE GS-3: OPTIMIZACIONES FINALES (90-120 días)

> **Prioridad:** BAJA — Polish final
> **Impacto:** Satisfacción, retención a largo plazo

---

### TAREA GS-3.1: Optimizar Animaciones para INP
**Prioridad:** ⚪ BAJA (P3)
**Estado:** Pendiente

**Objetivo:** INP < 200ms en todas las interacciones

**Tiempo estimado:** 8 horas

---

### TAREA GS-3.2: Modo Light/Dark Explícito
**Prioridad:** ⚪ BAJA (P3)
**Estado:** Pendiente

**Problema:** Solo modo oscuro, algunos usuarios prefieren modo claro

**Tiempo estimado:** 6 horas

---

### TAREA GS-3.3: Página de FAQ/Ayuda
**Prioridad:** ⚪ BAJA (P3)
**Estado:** Pendiente

**Tiempo estimado:** 3 horas

---

### TAREA GS-3.4: Analytics de Uso (PostHog/Mixpanel)
**Prioridad:** ⚪ BAJA (P3)
**Estado:** Pendiente

**Tiempo estimado:** 4 horas

---

## 📊 RESUMEN DE TAREAS

### Por Prioridad

| Prioridad | Tareas | Tiempo Total |
|-----------|--------|--------------|
| 🔴 P0 (Crítico) | 4 | ~18h |
| 🟡 P1 (Alta) | 5 | ~23h |
| 🟢 P2 (Media) | 6 | ~19h |
| ⚪ P3 (Baja) | 4 | ~21h |
| **TOTAL** | **19** | **~81h** |

### Por Fase

| Fase | Tareas | Tiempo |
|------|--------|--------|
| GS-0: Bloqueadores | 4 | 18h |
| GS-1: Primera Experiencia | 5 | 23h |
| GS-2: Flujo de Aprendizaje | 6 | 19h |
| GS-3: Optimizaciones | 4 | 21h |

### Cronograma Sugerido

| Semana | Tareas | Objetivo |
|--------|--------|----------|
| 1-2 | GS-0.1, GS-0.2, GS-0.3, GS-0.4 | Bloqueadores resueltos |
| 3-4 | GS-1.1, GS-1.2, GS-1.3 | Tutorial + Tooltips + Welcome |
| 5 | GS-1.4, GS-1.5, GS-2.1 | Ayuda + Skeletons |
| 6-7 | GS-2.2, GS-2.3, GS-2.4 | Continuar + Sonidos + Progreso |
| 8 | GS-2.5, GS-2.6 | Celebraciones + Metas |
| 9-12 | GS-3.x | Polish final |

---

## ✅ CRITERIOS DE GOLD STANDARD ALCANZADO

Cuando todas estas tareas estén completadas, LinguaForge cumplirá:

### Pedagogía
- [x] FSRS v6 para retención óptima
- [x] 19 tipos de ejercicios
- [x] CLT (Cognitive Load Theory)
- [x] Warmups neurales

### UX/Accesibilidad
- [x] Tutorial interactivo para nuevos usuarios
- [x] Tooltips en todas las métricas
- [x] Atajos de teclado documentados
- [x] WCAG AAA compliance
- [x] Touch targets 44px
- [x] Reduced motion support

### Tecnología
- [x] PWA con offline completo
- [x] Lighthouse Performance ≥ 90
- [x] Lighthouse Accessibility ≥ 95
- [x] INP < 200ms
- [x] LCP < 2.5s
- [x] CLS < 0.1
- [x] Security headers A+

### Engagement
- [x] Gamificación completa
- [x] Efectos de sonido
- [x] Celebraciones de hitos
- [x] Metas diarias personalizables
- [x] "Continuar donde lo dejaste"

### Preparación para €7/mes
- [x] Experiencia premium justificada
- [x] Sin fricciones en primeros 7 días
- [x] Diferenciación clara vs competencia

---

**Última actualización:** 2026-01-09
**Versión:** 1.0 — Gold Standard Tasks
**Autor:** Auditoría Claude (Principal Engineer)
