import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  usePrevious,
  useMediaQuery,
  usePrefersReducedMotion,
  useIntersectionObserver,
  useStableCallback,
} from '@/hooks/usePerformance';

describe('Performance Hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounce', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));

      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated', delay: 500 });

      // Value should still be initial
      expect(result.current).toBe('initial');

      // Advance time past delay
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('should cancel pending debounce on new value', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 500 } }
      );

      // First update
      rerender({ value: 'second', delay: 500 });
      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Second update before timeout
      rerender({ value: 'third', delay: 500 });
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should be 'third', not 'second'
      expect(result.current).toBe('third');
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce callback execution', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      // Call multiple times
      result.current('a');
      result.current('b');
      result.current('c');

      // Should not have been called yet
      expect(callback).not.toHaveBeenCalled();

      // Advance time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should have been called once with last argument
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('c');
    });

    it('should cleanup on unmount', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300));

      result.current('test');
      unmount();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Callback should not be called after unmount
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('useThrottledCallback', () => {
    it('should execute immediately on first call', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 300));

      result.current('first');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');
    });

    it('should throttle subsequent calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 300));

      result.current('first');
      result.current('second');
      result.current('third');

      // Only first should have been called immediately
      expect(callback).toHaveBeenCalledTimes(1);

      // Advance time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Last call should now execute
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('third');
    });

    it('should cleanup on unmount', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() => useThrottledCallback(callback, 300));

      result.current('first');
      result.current('second');
      unmount();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Only the first call should have executed
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('usePrevious', () => {
    it('should return undefined on first render', () => {
      const { result } = renderHook(() => usePrevious('initial'));

      expect(result.current).toBeUndefined();
    });

    it('should return previous value after update', () => {
      const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: 'first' },
      });

      expect(result.current).toBeUndefined();

      rerender({ value: 'second' });
      expect(result.current).toBe('first');

      rerender({ value: 'third' });
      expect(result.current).toBe('second');
    });

    it('should work with different types', () => {
      const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: 1 },
      });

      rerender({ value: 2 });
      expect(result.current).toBe(1);

      rerender({ value: 3 });
      expect(result.current).toBe(2);
    });
  });

  describe('useStableCallback', () => {
    it('should return same reference across renders', () => {
      const callback1 = vi.fn(() => 'first');
      const callback2 = vi.fn(() => 'second');

      const { result, rerender } = renderHook(({ cb }) => useStableCallback(cb), {
        initialProps: { cb: callback1 },
      });

      const firstRef = result.current;

      rerender({ cb: callback2 });

      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
    });

    it('should call the latest callback version', () => {
      const callback1 = vi.fn(() => 'first');
      const callback2 = vi.fn(() => 'second');

      const { result, rerender } = renderHook(({ cb }) => useStableCallback(cb), {
        initialProps: { cb: callback1 },
      });

      rerender({ cb: callback2 });

      result.current();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('useMediaQuery', () => {
    it('should return false initially', () => {
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      expect(result.current).toBe(false);
    });

    it('should respond to media query changes', async () => {
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('768'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_, cb) => {
          setTimeout(() => cb({ matches: true }), 100);
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)');
    });
  });

  describe('usePrefersReducedMotion', () => {
    it('should return false by default', () => {
      const { result } = renderHook(() => usePrefersReducedMotion());

      expect(result.current).toBe(false);
    });
  });

  describe('useIntersectionObserver', () => {
    it('should return ref and initial visibility state', () => {
      const { result } = renderHook(() => useIntersectionObserver());

      const [ref, isVisible] = result.current;

      expect(ref).toBeDefined();
      expect(ref.current).toBeNull();
      expect(isVisible).toBe(false);
    });

    it('should accept options', () => {
      const { result } = renderHook(() =>
        useIntersectionObserver({
          threshold: 0.5,
          rootMargin: '10px',
          freezeOnceVisible: true,
        })
      );

      const [ref, isVisible] = result.current;

      expect(ref).toBeDefined();
      expect(isVisible).toBe(false);
    });
  });
});
