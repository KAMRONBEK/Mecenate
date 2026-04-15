import { useCallback, useRef } from 'react';

/**
 * Second call with the same `id` within `windowMs` invokes `onDoubleTap` once.
 */
export function useDoubleTapInWindow(windowMs: number) {
  const lastRef = useRef<{ id: string; time: number } | null>(null);

  return useCallback(
    (id: string, onDoubleTap: () => void) => {
      const now = Date.now();
      const prev = lastRef.current;
      if (prev && prev.id === id && now - prev.time < windowMs) {
        lastRef.current = null;
        onDoubleTap();
        return;
      }
      lastRef.current = { id, time: now };
    },
    [windowMs]
  );
}
