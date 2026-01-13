/**
 * Performance Hooks
 *
 * Hooks optimizados para mejorar el rendimiento de la aplicación.
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

// ============================================================
// DEBOUNCE HOOK
// ============================================================

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para debounce de callbacks
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// ============================================================
// THROTTLE HOOK
// ============================================================

/**
 * Hook para throttle de callbacks
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            lastRunRef.current = Date.now();
            callback(...args);
          },
          delay - (now - lastRunRef.current)
        );
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// ============================================================
// INTERSECTION OBSERVER HOOK
// ============================================================

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
}

/**
 * Hook para detectar si un elemento está visible en el viewport
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const { root = null, rootMargin = '0px', threshold = 0, freezeOnceVisible = false } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, freezeOnceVisible, isVisible]);

  return [elementRef, isVisible];
}

// ============================================================
// PREVIOUS VALUE HOOK
// ============================================================

/**
 * Hook para obtener el valor anterior de una variable
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================================
// MEMOIZED SELECTOR HOOK
// ============================================================

/**
 * Hook para crear selectores memoizados de stores
 */
export function useMemoizedSelector<TStore, TResult>(
  useStore: () => TStore,
  selector: (state: TStore) => TResult,
  deps: React.DependencyList = []
): TResult {
  const state = useStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => selector(state), [state, ...deps]);
}

// ============================================================
// STABLE CALLBACK HOOK
// ============================================================

/**
 * Hook para crear callbacks estables que no cambian de referencia
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

// ============================================================
// RENDER COUNT HOOK (Development Only)
// ============================================================

/**
 * Hook para contar renders (solo desarrollo)
 */
export function useRenderCount(_componentName: string): number {
  const countRef = useRef(0);
  countRef.current++;

  if (process.env.NODE_ENV === 'development') {
  }

  return countRef.current;
}

// ============================================================
// MEDIA QUERY HOOK
// ============================================================

/**
 * Hook para detectar media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

// ============================================================
// PREFERS REDUCED MOTION HOOK
// ============================================================

/**
 * Hook para detectar si el usuario prefiere menos animaciones
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// ============================================================
// IDLE CALLBACK HOOK
// ============================================================

/**
 * Hook para ejecutar tareas en tiempo idle
 */
export function useIdleCallback(
  callback: () => void,
  options: { timeout?: number } = {}
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handle = window.requestIdleCallback
      ? window.requestIdleCallback(callback, options)
      : window.setTimeout(callback, 0);

    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle as number);
      } else {
        window.clearTimeout(handle as number);
      }
    };
  }, [callback, options]);
}
