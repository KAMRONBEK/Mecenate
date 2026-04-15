import { useCallback, useEffect, useState } from 'react';
import { PixelRatio, type LayoutChangeEvent } from 'react-native';

/**
 * Height of the last feed post (above the pagination skeleton) is a better predictor than the
 * first post: the next page replaces the skeleton with rows that usually match the previous
 * segment more closely than the top of the feed.
 */
function roundLayoutLength(px: number): number {
  const scale = PixelRatio.get();
  return Math.round(px * scale) / scale;
}

export function useFeedSkeletonAnchorHeight(postCount: number) {
  const [anchorHeight, setAnchorHeight] = useState<number | null>(null);

  useEffect(() => {
    if (postCount === 0) {
      setAnchorHeight(null);
    }
  }, [postCount]);

  const onAnchorPostLayout = useCallback((e: LayoutChangeEvent) => {
    const h = roundLayoutLength(e.nativeEvent.layout.height);
    setAnchorHeight((prev) => (prev === h ? prev : h));
  }, []);

  const isAnchorIndex = useCallback(
    (index: number) => postCount > 0 && index === postCount - 1,
    [postCount]
  );

  return { anchorHeight, onAnchorPostLayout, isAnchorIndex };
}
