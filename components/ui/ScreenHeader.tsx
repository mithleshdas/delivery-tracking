import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/Icon';
import { useThemeColors } from '@/hooks/useThemeColors';

type HeaderAction = {
  icon: IconName;
  label?: string;
  onPress: () => void;
  primary?: boolean;
};

type Props = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  rightAction?: HeaderAction;
  secondaryAction?: HeaderAction;
  leftAction?: {
    icon: IconName;
    onPress: () => void;
  };
  children?: ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  icon = 'cube-outline',
  rightAction,
  secondaryAction,
  leftAction,
  children,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 16 : Math.max(insets.top, 12);

  return (
    <Animated.View
      entering={FadeInDown.duration(280).springify()}
      style={[
        styles.wrap,
        {
          paddingTop: topPad,
          backgroundColor: colors.surface,
          borderBottomColor: colors.hairline,
        },
      ]}>
      <View style={styles.row}>
        {leftAction ? (
          <Pressable
            onPress={leftAction.onPress}
            hitSlop={10}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Icon name={leftAction.icon} size={18} color={colors.text} />
          </Pressable>
        ) : (
          <View
            style={[
              styles.brandMark,
              { backgroundColor: colors.tintSoft, borderColor: colors.border },
            ]}>
            <Icon name={icon} size={18} color={colors.tint} />
          </View>
        )}

        <View style={styles.titles}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
              numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          {secondaryAction ? (
            <Pressable
              onPress={secondaryAction.onPress}
              style={({ pressed }) => [
                styles.iconBtn,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Icon
                name={secondaryAction.icon}
                size={18}
                color={colors.text}
              />
            </Pressable>
          ) : null}

          {rightAction ? (
            <Pressable
              onPress={rightAction.onPress}
              style={({ pressed }) => [
                rightAction.primary === false ? styles.iconBtn : styles.cta,
                rightAction.primary === false
                  ? {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    }
                  : {
                      backgroundColor: colors.tint,
                      opacity: pressed ? 0.85 : 1,
                    },
              ]}>
              <Icon
                name={rightAction.icon}
                size={16}
                color={rightAction.primary === false ? colors.text : '#FFFFFF'}
              />
              {rightAction.label ? (
                <Text style={styles.ctaText}>{rightAction.label}</Text>
              ) : null}
            </Pressable>
          ) : null}
        </View>
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  titles: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
