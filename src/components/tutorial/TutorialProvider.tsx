'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// ============================================
// TIPOS
// ============================================

interface TutorialStep {
  id: string;
  text: string;
  attachTo?: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right';
  };
  highlightClass?: string;
}

interface TutorialContextValue {
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  hasCompletedTour: (tourId: string) => boolean;
  isAnyTourActive: boolean;
}

// ============================================
// TOURS DEFINIDOS
// ============================================

const TOURS: Record<string, TutorialStep[]> = {
  dashboard: [
    {
      id: 'welcome',
      text: `
        <div class="text-center">
          <div class="text-4xl mb-2">🧠</div>
          <h3 class="text-lg font-bold mb-2">¡Bienvenido a tu Centro de Mando!</h3>
          <p class="text-sm text-calm-text-tertiary">
            Aquí verás tu progreso neuronal y estadísticas de aprendizaje.
          </p>
        </div>
      `,
    },
    {
      id: 'stats-header',
      text: `
        <div>
          <h3 class="font-bold mb-2">📊 Tus Estadísticas</h3>
          <p class="text-sm text-calm-text-tertiary mb-2">
            En la barra superior verás:
          </p>
          <ul class="text-sm text-calm-text-tertiary space-y-1">
            <li>⚡ <strong>XP</strong> - Puntos de experiencia</li>
            <li>🪙 <strong>Coins</strong> - Monedas para desbloquear</li>
            <li>💎 <strong>Gems</strong> - Gemas premium</li>
            <li>🔥 <strong>Streak</strong> - Días consecutivos</li>
            <li>❤️ <strong>HP</strong> - Salud (necesitas HP para practicar)</li>
          </ul>
        </div>
      `,
      attachTo: { element: 'header', on: 'bottom' },
    },
    {
      id: 'navigation',
      text: `
        <div>
          <h3 class="font-bold mb-2">🧭 Navegación</h3>
          <p class="text-sm text-calm-text-tertiary mb-2">
            Usa la barra inferior para moverte:
          </p>
          <ul class="text-sm text-calm-text-tertiary space-y-1">
            <li>📊 <strong>Dashboard</strong> - Estadísticas generales</li>
            <li>🗺️ <strong>Mapa</strong> - Tu camino de aprendizaje</li>
            <li>🎯 <strong>Misiones</strong> - Objetivos diarios</li>
            <li>📚 <strong>Deck</strong> - Tarjetas de repaso</li>
          </ul>
        </div>
      `,
      attachTo: { element: 'nav', on: 'top' },
    },
    {
      id: 'tip-hotkeys',
      text: `
        <div class="text-center">
          <div class="text-4xl mb-2">⌨️</div>
          <h3 class="font-bold mb-2">Consejo Pro</h3>
          <p class="text-sm text-calm-text-tertiary mb-2">
            Presiona <kbd class="px-2 py-0.5 bg-calm-bg-tertiary rounded text-xs">?</kbd>
            en cualquier momento para ver los atajos de teclado.
          </p>
          <p class="text-xs text-calm-text-muted">
            ¡Usa 1-4 para responder ejercicios más rápido!
          </p>
        </div>
      `,
    },
  ],

  firstExercise: [
    {
      id: 'exercise-intro',
      text: `
        <div>
          <h3 class="font-bold mb-2">🎯 Tu Primer Ejercicio</h3>
          <p class="text-sm text-calm-text-tertiary">
            Completa el hueco con la palabra correcta.
            Lee la frase completa para entender el contexto.
          </p>
        </div>
      `,
      attachTo: { element: '.exercise-container', on: 'bottom' },
    },
    {
      id: 'exercise-options',
      text: `
        <div>
          <h3 class="font-bold mb-2">🔢 Opciones Rápidas</h3>
          <p class="text-sm text-calm-text-tertiary mb-2">
            Puedes hacer clic o usar atajos de teclado:
          </p>
          <div class="grid grid-cols-4 gap-2 text-center text-xs">
            <kbd class="px-2 py-1 bg-calm-bg-tertiary rounded">1</kbd>
            <kbd class="px-2 py-1 bg-calm-bg-tertiary rounded">2</kbd>
            <kbd class="px-2 py-1 bg-calm-bg-tertiary rounded">3</kbd>
            <kbd class="px-2 py-1 bg-calm-bg-tertiary rounded">4</kbd>
          </div>
        </div>
      `,
      attachTo: { element: '.options-container', on: 'top' },
    },
    {
      id: 'exercise-audio',
      text: `
        <div>
          <h3 class="font-bold mb-2">🔊 Escucha la Pronunciación</h3>
          <p class="text-sm text-calm-text-tertiary">
            Presiona <kbd class="px-2 py-0.5 bg-calm-bg-tertiary rounded text-xs">Espacio</kbd>
            para escuchar la frase completa.
          </p>
        </div>
      `,
    },
  ],

  srsReview: [
    {
      id: 'srs-intro',
      text: `
        <div>
          <h3 class="font-bold mb-2">🔄 Repaso Espaciado</h3>
          <p class="text-sm text-calm-text-tertiary">
            Las tarjetas aparecen en el momento óptimo para recordarlas.
            Este sistema científico maximiza tu retención con mínimo esfuerzo.
          </p>
        </div>
      `,
    },
    {
      id: 'srs-show',
      text: `
        <div>
          <h3 class="font-bold mb-2">👀 Ver Respuesta</h3>
          <p class="text-sm text-calm-text-tertiary">
            Primero intenta recordar la traducción.
            Cuando estés listo, haz clic para ver la respuesta o presiona
            <kbd class="px-2 py-0.5 bg-calm-bg-tertiary rounded text-xs">Espacio</kbd>.
          </p>
        </div>
      `,
      attachTo: { element: '.srs-card', on: 'bottom' },
    },
    {
      id: 'srs-buttons',
      text: `
        <div>
          <h3 class="font-bold mb-2">📝 Evalúa tu Memoria</h3>
          <p class="text-sm text-calm-text-tertiary mb-2">
            Sé honesto con tu evaluación:
          </p>
          <ul class="text-sm text-calm-text-tertiary space-y-1">
            <li><kbd class="px-1 bg-calm-bg-tertiary rounded text-xs">1</kbd> <strong>Otra vez</strong> - Olvidé completamente</li>
            <li><kbd class="px-1 bg-calm-bg-tertiary rounded text-xs">2</kbd> <strong>Difícil</strong> - Me costó recordar</li>
            <li><kbd class="px-1 bg-calm-bg-tertiary rounded text-xs">3</kbd> <strong>Bien</strong> - Recordé correctamente</li>
            <li><kbd class="px-1 bg-calm-bg-tertiary rounded text-xs">4</kbd> <strong>Fácil</strong> - Fue instantáneo</li>
          </ul>
        </div>
      `,
      attachTo: { element: '.srs-buttons', on: 'top' },
    },
  ],

  inputHub: [
    {
      id: 'input-intro',
      text: `
        <div class="text-center">
          <div class="text-4xl mb-2">📥</div>
          <h3 class="font-bold mb-2">Centro de Input</h3>
          <p class="text-sm text-calm-text-tertiary">
            Aquí puedes importar contenido real en francés:
            videos de YouTube, podcasts o textos.
          </p>
        </div>
      `,
    },
    {
      id: 'input-video',
      text: `
        <div>
          <h3 class="font-bold mb-2">🎬 Videos de YouTube</h3>
          <p class="text-sm text-calm-text-tertiary">
            Pega cualquier URL de YouTube con subtítulos en francés.
            Extraeremos las frases para que practiques.
          </p>
        </div>
      `,
    },
    {
      id: 'input-tip',
      text: `
        <div class="text-center">
          <div class="text-4xl mb-2">💡</div>
          <h3 class="font-bold mb-2">Consejo</h3>
          <p class="text-sm text-calm-text-tertiary">
            Elige contenido que te interese.
            Aprenderás más rápido con temas que te apasionan.
          </p>
        </div>
      `,
    },
  ],
};

// ============================================
// ESTILOS PERSONALIZADOS
// ============================================

const SHEPHERD_STYLES = `
  .shepherd-element {
    background: rgba(15, 23, 42, 0.95) !important;
    border: 1px solid var(--sky-500)/30 !important;
    border-radius: 16px !important;
    backdrop-filter: blur(12px) !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
  }

  .shepherd-content {
    padding: 0 !important;
  }

  .shepherd-text {
    padding: 20px !important;
    color: white !important;
    font-family: inherit !important;
  }

  .shepherd-footer {
    padding: 12px 20px 20px !important;
    border-top: 1px solid var(--sky-500)/10 !important;
  }

  .shepherd-button {
    background: var(--sky-500)/20 !important;
    color: white !important;
    border: 1px solid var(--sky-500)/30 !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
  }

  .shepherd-button:hover {
    background: var(--sky-500)/40 !important;
  }

  .shepherd-button-primary {
    background: var(--sky-500) !important;
    border-color: var(--sky-500) !important;
  }

  .shepherd-button-primary:hover {
    background: var(--sky-600) !important;
  }

  .shepherd-arrow:before {
    background: rgba(15, 23, 42, 0.95) !important;
    border: 1px solid var(--sky-500)/30 !important;
  }

  .shepherd-modal-overlay-container {
    background: rgba(0, 0, 0, 0.7) !important;
  }

  .shepherd-cancel-icon {
    color: rgba(255, 255, 255, 0.5) !important;
  }

  .shepherd-cancel-icon:hover {
    color: white !important;
  }
`;

// ============================================
// CONTEXT (exportado para uso en otros componentes)
// ============================================

export const TutorialContext = createContext<TutorialContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface TutorialProviderProps {
  children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  const [isAnyTourActive, setIsAnyTourActive] = useState(false);
  const [stylesInjected, setStylesInjected] = useState(false);

  // Cargar tours completados de localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('completed-tours');
    if (stored) {
      try {
        setCompletedTours(new Set(JSON.parse(stored)));
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, []);

  // Inyectar estilos personalizados
  useEffect(() => {
    if (typeof window === 'undefined' || stylesInjected) return;

    const styleElement = document.createElement('style');
    styleElement.textContent = SHEPHERD_STYLES;
    document.head.appendChild(styleElement);
    setStylesInjected(true);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [stylesInjected]);

  const completeTour = useCallback((tourId: string) => {
    const newCompleted = new Set(completedTours).add(tourId);
    setCompletedTours(newCompleted);
    localStorage.setItem('completed-tours', JSON.stringify(Array.from(newCompleted)));
  }, [completedTours]);

  const hasCompletedTour = useCallback((tourId: string) => {
    return completedTours.has(tourId);
  }, [completedTours]);

  const startTour = useCallback((tourId: string) => {
    const steps = TOURS[tourId];
    if (!steps || typeof window === 'undefined') return;

    setIsAnyTourActive(true);

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
      },
    });

    steps.forEach((step, index) => {
      const isLast = index === steps.length - 1;
      const isFirst = index === 0;

      tour.addStep({
        id: step.id,
        text: step.text,
        attachTo: step.attachTo,
        buttons: [
          ...(isFirst ? [] : [{
            text: 'Anterior',
            action: tour.back,
            classes: 'shepherd-button-secondary',
          }]),
          {
            text: isLast ? '¡Entendido!' : 'Siguiente',
            action: isLast
              ? () => {
                  completeTour(tourId);
                  tour.complete();
                }
              : tour.next,
            classes: 'shepherd-button-primary',
          },
        ],
      });
    });

    tour.on('complete', () => {
      setIsAnyTourActive(false);
    });

    tour.on('cancel', () => {
      setIsAnyTourActive(false);
    });

    tour.start();
  }, [completeTour]);

  return (
    <TutorialContext.Provider
      value={{
        startTour,
        completeTour,
        hasCompletedTour,
        isAnyTourActive,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return ctx;
}

// ============================================
// AUTO-START HOOK
// ============================================

/**
 * Hook para iniciar automáticamente un tour si no se ha completado
 */
export function useAutoTour(tourId: string, delay: number = 1000) {
  const { startTour, hasCompletedTour } = useTutorial();

  useEffect(() => {
    if (hasCompletedTour(tourId)) return;

    const timer = setTimeout(() => {
      startTour(tourId);
    }, delay);

    return () => clearTimeout(timer);
  }, [tourId, delay, startTour, hasCompletedTour]);
}
