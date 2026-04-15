import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme/tokens';

type Props = {
  onRetry: () => void;
};

export function FeedErrorState({ onRetry }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.message}>Не удалось загрузить публикации</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Повторить загрузку">
        <Text style={styles.buttonLabel}>Повторить</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    ...typography.meta,
    color: '#FFFFFF',
  },
});
