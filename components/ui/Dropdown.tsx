import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { useThemeColors } from '@/hooks/useThemeColors';

export type DropdownOption = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  compact?: boolean;
  error?: string;
};

export function Dropdown({
  label,
  value,
  options,
  onChange,
  compact = false,
  error,
}: Props) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.danger : colors.border,
            opacity: pressed ? 0.88 : 1,
          },
        ]}>
        <Text
          style={[styles.triggerText, { color: colors.text }]}
          numberOfLines={1}>
          {selected?.label ?? 'Select'}
        </Text>
        <Icon name="chevron-down" size={14} color={colors.muted} />
      </Pressable>
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandleWrap}>
              <View
                style={[styles.sheetHandle, { backgroundColor: colors.border }]}
              />
            </View>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: active
                          ? colors.tintSoft
                          : pressed
                            ? colors.inputBg
                            : 'transparent',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: active ? colors.tint : colors.text,
                          fontWeight: active ? '700' : '500',
                        },
                      ]}>
                      {item.label}
                    </Text>
                    {active ? (
                      <Icon name="checkmark" size={16} color={colors.tint} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 3,
    minWidth: 108,
  },
  wrapCompact: {
    minWidth: 96,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trigger: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  triggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    fontSize: 11,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '52%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingBottom: 20,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 99,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 14,
  },
});
