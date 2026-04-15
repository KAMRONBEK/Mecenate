import { useCallback, useEffect, useRef } from 'react';

/**
 * Fires `onDoubleTap` when two presses occur within `windowMs` on the same handler instance.
 * Each component instance has its own timer — safe for list rows (no shared global ref).
 * Pass `resetKey` (e.g. comment id) so FlatList recycle does not carry over tap timing.
 */
export function useDoubleTapAction(
  windowMs: number,
  onDoubleTap: () => void,
  resetKey?: string
) {
  const lastPressAtRef = useRef(0);

  useEffect(() => {
    lastPressAtRef.current = 0;
  }, [resetKey]);

  return useCallback(() => {
    const now = Date.now();
    if (lastPressAtRef.current > 0 && now - lastPressAtRef.current < windowMs) {
      lastPressAtRef.current = 0;
      onDoubleTap();
      return;
    }
    lastPressAtRef.current = now;
  }, [windowMs, onDoubleTap]);
}
