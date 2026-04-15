import { useEffect, useRef } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * Pulse heart + count when likesCount changes (optimistic update, double-tap, etc.).
 * Skips animation on first mount.
 */
export function useLikePulseOnCountChange(likesCount: number) {
  const heartScale = useSharedValue(1);
  const countScale = useSharedValue(1);
  const skipFirst = useRef(true);
  const prevCount = useRef(likesCount);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      prevCount.current = likesCount;
      return;
    }
    const prev = prevCount.current;
    prevCount.current = likesCount;
    if (likesCount === prev) return;

    countScale.value = withSequence(
      withTiming(1.12, { duration: 160 }),
      withTiming(1, { duration: 180 })
    );
    if (likesCount > prev) {
      heartScale.value = withSequence(
        withTiming(1.18, { duration: 90 }),
        withTiming(1, { duration: 120 })
      );
    } else {
      heartScale.value = withSequence(
        withTiming(0.95, { duration: 80 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [likesCount, heartScale, countScale]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  return { heartStyle, countStyle };
}
