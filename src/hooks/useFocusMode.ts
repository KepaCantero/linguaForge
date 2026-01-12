import { useState, useEffect } from 'react';

export interface FocusModeState {
  focusModeActive: boolean;
  focusModeStartTime: number | null;
}

export interface FocusModeActions {
  setFocusModeActive: (active: boolean) => void;
  setShowSessionSummary: (show: boolean) => void;
}

/**
 * Custom hook for focus mode state management
 * Tracks focus mode duration and manages state
 */
export function useFocusMode(): FocusModeState & FocusModeActions {
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [, setShowSessionSummary] = useState(false);
  const [focusModeStartTime, setFocusModeStartTime] = useState<number | null>(null);

  // Track focus mode duration
  useEffect(() => {
    if (focusModeActive && !focusModeStartTime) {
      setFocusModeStartTime(Date.now());
    } else if (!focusModeActive && focusModeStartTime) {
      setFocusModeStartTime(null);
    }
  }, [focusModeActive, focusModeStartTime]);

  return {
    focusModeActive,
    focusModeStartTime,
    setFocusModeActive,
    setShowSessionSummary,
  };
}
