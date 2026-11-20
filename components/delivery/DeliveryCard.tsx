import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { Delivery } from '@/types/delivery';

type Props = {
  delivery: Delivery;
  onPress: (delivery: Delivery) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DeliveryCard({ delivery, onPress }: Props) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => onPress(delivery)}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      style={[
        styles.card,
        animatedStyle,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <View
        style={[
          styles.accent,
          { backgroundColor: statusAccent(delivery.status, colors.tint) },
        ]}
      />

      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.idRow}>
            <Icon name="cube-outline" size={14} color={colors.tint} />
            <Text style={[styles.id, { color: colors.text }]}>{delivery.id}</Text>
          </View>
          <StatusBadge status={delivery.status} />
        </View>

        <Text style={[styles.customer, { color: colors.text }]} numberOfLines={1}>
          {delivery.customer}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="person-outline" size={12} color={colors.muted} />
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
              {delivery.driver}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="calendar-outline" size={12} color={colors.muted} />
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {delivery.date}
            </Text>
          </View>
        </View>

        {delivery.notes?.trim() ? (
          <View style={styles.metaItem}>
            <Icon name="document-text-outline" size={12} color={colors.muted} />
            <Text style={[styles.notes, { color: colors.muted }]} numberOfLines={1}>
              {delivery.notes}
            </Text>
          </View>
        ) : null}
      </View>

      <Icon name="chevron-forward" size={16} color={colors.muted} />
    </AnimatedPressable>
  );
}

function statusAccent(status: string, fallback: string) {
  switch (status) {
    case 'Pending':
      return '#9A6B2F';
    case 'In Transit':
      return '#4A6670';
    case 'Delivered':
      return fallback;
    case 'Cancelled':
      return '#A14A3B';
    default:
      return fallback;
  }
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: 10,
    gap: 4,
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 3,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  id: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  customer: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
  },
  notes: {
    fontSize: 11,
    flex: 1,
  },
});
