import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import HeartFilled from '@/assets/svgs/heart.svg';
import HeartOutlined from '@/assets/svgs/heart-outlined.svg';
import { useLikePulseOnCountChange } from '@/src/features/post-detail/useLikePulseOnCountChange';
import { colors, spacing, typography } from '@/src/theme/tokens';

type Props = {
  likesCount: number;
  isLiked: boolean;
  onPress: () => void;
  hitSlop?: { top: number; bottom: number; left: number; right: number };
};

function AnimatedCommentLikePillInner({
  likesCount,
  isLiked,
  onPress,
  hitSlop,
}: Props) {
  const { heartStyle, countStyle } = useLikePulseOnCountChange(likesCount);

  return (
    <Pressable
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? 'Убрать лайк с комментария' : 'Лайкнуть комментарий'}
      accessibilityState={{ selected: isLiked }}
    >
      <Animated.View style={heartStyle}>
        {isLiked ? (
          <HeartFilled width={17} height={15} color={colors.likePillActive} />
        ) : (
          <HeartOutlined width={17} height={15} color={colors.iconPill} />
        )}
      </Animated.View>
      <Animated.Text
        style={[styles.count, isLiked && styles.countActive, countStyle]}
      >
        {likesCount}
      </Animated.Text>
    </Pressable>
  );
}

export const AnimatedCommentLikePill = memo(AnimatedCommentLikePillInner);

const styles = StyleSheet.create({
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginVertical: -spacing.sm,
    marginRight: -spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
  count: {
    ...typography.meta,
    color: colors.iconPill,
    minWidth: 16,
  },
  countActive: {
    color: colors.likePillActive,
  },
});
