import * as Haptics from 'expo-haptics';
import { memo, useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import HeartFilled from '@/assets/svgs/heart.svg';
import HeartOutlined from '@/assets/svgs/heart-outlined.svg';
import { colors, radius, spacing, typography } from '@/src/theme/tokens';

type Props = {
  likesCount: number;
  isLiked: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function AnimatedLikeButtonInner({ likesCount, isLiked, disabled, onPress }: Props) {
  const scale = useSharedValue(1);
  const countScale = useSharedValue(1);
  const skipFirstCountAnim = useRef(true);

  useEffect(() => {
    if (skipFirstCountAnim.current) {
      skipFirstCountAnim.current = false;
      return;
    }
    countScale.value = withSequence(
      withTiming(1.12, { duration: 160 }),
      withTiming(1, { duration: 180 })
    );
  }, [likesCount, countScale]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withTiming(1.18, { duration: 90 }), withTiming(1, { duration: 120 }));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? 'Убрать лайк' : 'Лайкнуть'}
    >
      <Animated.View style={heartStyle}>
        {isLiked ? (
          <HeartFilled width={22} height={20} color={colors.likePillOnActive} />
        ) : (
          <HeartOutlined width={22} height={20} color={colors.iconPill} />
        )}
      </Animated.View>
      <Animated.Text style={[styles.count, isLiked && styles.countLiked, countStyle]}>{likesCount}</Animated.Text>
    </Pressable>
  );
}

export const AnimatedLikeButton = memo(AnimatedLikeButtonInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.pillBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
  count: {
    ...typography.title,
    fontSize: 18,
    color: colors.iconPill,
    minWidth: 28,
  },
  countLiked: {
    color: colors.likePillActive,
  },
});
