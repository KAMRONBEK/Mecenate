import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import HeartFilled from '@/assets/svgs/heart.svg';
import HeartOutlined from '@/assets/svgs/heart-outlined.svg';
import { useLikePulseOnCountChange } from '@/src/features/post-detail/useLikePulseOnCountChange';
import { colors, radius, spacing, typography } from '@/src/theme/tokens';
import Animated from 'react-native-reanimated';

export type AnimatedLikeButtonVariant = 'large' | 'compact';

type Props = {
  likesCount: number;
  isLiked: boolean;
  disabled?: boolean;
  onPress: () => void;
  variant?: AnimatedLikeButtonVariant;
  accessibilityLabel?: string;
};

function AnimatedLikeButtonInner({
  likesCount,
  isLiked,
  disabled,
  onPress,
  variant = 'large',
  accessibilityLabel,
}: Props) {
  const { heartStyle, countStyle } = useLikePulseOnCountChange(likesCount);
  const compact = variant === 'compact';

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const label =
    accessibilityLabel ?? (isLiked ? 'Убрать лайк' : 'Лайкнуть');

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        compact ? styles.rowCompact : styles.rowLarge,
        isLiked && compact && styles.rowCompactLiked,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isLiked }}
    >
      <Animated.View style={heartStyle}>
        {isLiked ? (
          <HeartFilled
            width={compact ? 17 : 22}
            height={compact ? 15 : 20}
            color={colors.likePillOnActive}
          />
        ) : (
          <HeartOutlined
            width={compact ? 17 : 22}
            height={compact ? 15 : 20}
            color={colors.iconPill}
          />
        )}
      </Animated.View>
      <Animated.Text
        style={[
          compact ? styles.countCompact : styles.countLarge,
          isLiked && compact && styles.countCompactLiked,
          isLiked && !compact && styles.countLargeLiked,
          countStyle,
        ]}
      >
        {likesCount}
      </Animated.Text>
    </Pressable>
  );
}

export const AnimatedLikeButton = memo(AnimatedLikeButtonInner);

const styles = StyleSheet.create({
  rowLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.pillBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  rowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.pillBackground,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  rowCompactLiked: {
    backgroundColor: colors.likePillActive,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
  countLarge: {
    ...typography.title,
    fontSize: 18,
    color: colors.iconPill,
    minWidth: 28,
  },
  countLargeLiked: {
    color: colors.likePillActive,
  },
  countCompact: {
    ...typography.meta,
    color: colors.iconPill,
    minWidth: 16,
  },
  countCompactLiked: {
    color: colors.likePillOnActive,
  },
});
