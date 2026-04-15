import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FeedTierFilter } from '@/src/api/types';
import { colors, radius, spacing, typography } from '@/src/theme/tokens';

const TABS: { key: FeedTierFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'free', label: 'Бесплатные' },
  { key: 'paid', label: 'Платные' },
];

type Props = {
  value: FeedTierFilter;
  onChange: (tier: FeedTierFilter) => void;
};

function FeedTierTabsInner({ value, onChange }: Props) {
  return (
    <View style={styles.segmentTrack}>
      {TABS.map((tab) => {
        const active = value === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const FeedTierTabs = memo(FeedTierTabsInner);

const styles = StyleSheet.create({
  segmentTrack: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 3,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  segmentActive: {
    backgroundColor: colors.feedTabActive,
  },
  segmentText: {
    ...typography.meta,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
