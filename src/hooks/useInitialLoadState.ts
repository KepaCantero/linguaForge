import { useState, useEffect } from 'react';

/**
 * Custom hook for initial loading state
 * Waits for Zustand persist to hydrate data from localStorage
 */
export function useInitialLoadState(delay: number = 100) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoaded;
}
