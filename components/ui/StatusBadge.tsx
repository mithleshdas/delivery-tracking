import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { StatusColors } from '@/constants/theme';
import type { DeliveryStatus } from '@/types/delivery';

type Props = {
  status: DeliveryStatus | string;
};

export function StatusBadge({ status }: Props) {
  const scheme = useColorScheme();
  const colors = StatusColors[status] ?? StatusColors.Pending;
  const backgroundColor = scheme === 'dark' ? colors.softDark : colors.softLight;
  const textColor = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text style={[styles.text, { color: textColor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
