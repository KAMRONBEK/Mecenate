import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';

import { FEED_CARD_OPEN_DELAY_MS } from '@/src/constants/gestures';

type Options = {
  onPressContent?: () => void;
  onPressLike?: () => void;
  likeDisabled: boolean;
};

/**
 * Single-tap opens post after a short delay when like is available; two taps in the
 * delay window cancel navigation and toggle like (avoids stacked detail routes).
 */
export function useFeedCardMainPress({ onPressContent, onPressLike, likeDisabled }: Options) {
  const lastMainTapAtRef = useRef(0);
  const openDetailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (openDetailTimerRef.current) clearTimeout(openDetailTimerRef.current);
    };
  }, []);

  return useCallback(() => {
    if (!onPressContent) return;
    if (!onPressLike) {
      onPressContent();
      return;
    }

    const now = Date.now();
    const prevAt = lastMainTapAtRef.current;
    if (prevAt > 0 && now - prevAt < FEED_CARD_OPEN_DELAY_MS) {
      if (openDetailTimerRef.current) {
        clearTimeout(openDetailTimerRef.current);
        openDetailTimerRef.current = null;
      }
      lastMainTapAtRef.current = 0;
      if (!likeDisabled) {
        onPressLike();
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      return;
    }

    lastMainTapAtRef.current = now;
    if (openDetailTimerRef.current) clearTimeout(openDetailTimerRef.current);
    openDetailTimerRef.current = setTimeout(() => {
      lastMainTapAtRef.current = 0;
      openDetailTimerRef.current = null;
      onPressContent();
    }, FEED_CARD_OPEN_DELAY_MS);
  }, [onPressContent, onPressLike, likeDisabled]);
}
