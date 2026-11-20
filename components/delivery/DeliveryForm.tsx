import { useMemo, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { useThemeColors } from '@/hooks/useThemeColors';
import type {
  Customer,
  Delivery,
  DeliveryFormErrors,
  DeliveryFormValues,
  DeliveryStatus,
  Driver,
  StatusOption,
} from '@/types/delivery';
import { hasFormErrors, validateDeliveryForm } from '@/utils/validation';

type Props = {
  mode: 'create' | 'edit';
  initialValues: DeliveryFormValues;
  customers: Customer[];
  drivers: Driver[];
  statuses: StatusOption[];
  existingIds: string[];
  submitting?: boolean;
  onSubmit: (values: Delivery) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function DeliveryForm({
  mode,
  initialValues,
  customers,
  drivers,
  statuses,
  existingIds,
  submitting = false,
  onSubmit,
  onDelete,
}: Props) {
  const colors = useThemeColors();
  const [values, setValues] = useState<DeliveryFormValues>(initialValues);
  const [errors, setErrors] = useState<DeliveryFormErrors>({});
  const [deleting, setDeleting] = useState(false);

  const statusOptions = useMemo(
    () =>
      statuses.length > 0
        ? statuses.map((item) => item.name)
        : (['Pending', 'In Transit', 'Delivered', 'Cancelled'] as DeliveryStatus[]),
    [statuses]
  );

  const updateField = <K extends keyof DeliveryFormValues>(
    key: K,
    value: DeliveryFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateDeliveryForm(values, {
      existingIds,
      isEdit: mode === 'edit',
    });
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) return;

    const payload: Delivery = {
      id: values.id.trim(),
      customer: values.customer.trim(),
      driver: values.driver.trim(),
      date: values.date.trim(),
      status: values.status as DeliveryStatus,
      notes: values.notes.trim(),
    };

    await onSubmit(payload);
  };

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete delivery',
      `Are you sure you want to delete ${values.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await onDelete();
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Delete failed';
              Alert.alert('Error', message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Animated.View
        entering={FadeInUp.duration(280).springify()}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        <Field
          label="Delivery ID"
          error={errors.id}
          editable={mode === 'create'}
          value={values.id}
          onChangeText={(text) => updateField('id', text.toUpperCase())}
          placeholder="e.g. DLV007"
          autoCapitalize="characters"
        />

        <View style={styles.row}>
          <Dropdown
            label="Customer"
            value={values.customer}
            options={customers.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            onChange={(value) => updateField('customer', value)}
            error={errors.customer}
          />
          <Dropdown
            label="Driver"
            value={values.driver}
            options={drivers.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            onChange={(value) => updateField('driver', value)}
            error={errors.driver}
          />
        </View>

        <View style={styles.row}>
          <Field
            label="Date"
            error={errors.date}
            value={values.date}
            onChangeText={(text) => updateField('date', text)}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            half
          />
          <Dropdown
            label="Status"
            value={values.status}
            options={statusOptions.map((name) => ({
              label: name,
              value: name,
            }))}
            onChange={(value) => updateField('status', value as DeliveryStatus)}
            error={errors.status}
          />
        </View>

        <Field
          label="Notes"
          error={errors.notes}
          value={values.notes}
          onChangeText={(text) => updateField('notes', text)}
          placeholder="Optional notes"
          multiline
        />
      </Animated.View>

      <Pressable
        onPress={handleSubmit}
        disabled={submitting || deleting}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: colors.tint,
            opacity: pressed || submitting || deleting ? 0.75 : 1,
          },
        ]}>
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.btnInner}>
            <Icon
              name={mode === 'create' ? 'checkmark-circle-outline' : 'save-outline'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.primaryButtonText}>
              {mode === 'create' ? 'Create delivery' : 'Save changes'}
            </Text>
          </View>
        )}
      </Pressable>

      {mode === 'edit' && onDelete ? (
        <Pressable
          onPress={confirmDelete}
          disabled={submitting || deleting}
          style={({ pressed }) => [
            styles.dangerButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: pressed || deleting ? 0.75 : 1,
            },
          ]}>
          {deleting ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <View style={styles.btnInner}>
              <Icon name="trash-outline" size={15} color={colors.danger} />
              <Text style={[styles.dangerButtonText, { color: colors.danger }]}>
                Delete delivery
              </Text>
            </View>
          )}
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function Field({
  label,
  error,
  multiline,
  editable = true,
  half = false,
  ...inputProps
}: {
  label: string;
  error?: string;
  multiline?: boolean;
  editable?: boolean;
  half?: boolean;
} & ComponentProps<typeof TextInput>) {
  const colors = useThemeColors();

  return (
    <View style={[styles.field, half && styles.half]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        editable={editable}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          multiline && styles.textArea,
          {
            backgroundColor: editable ? colors.inputBg : colors.hairline,
            borderColor: error ? colors.danger : colors.border,
            color: colors.text,
          },
        ]}
        {...inputProps}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 12,
    gap: 10,
    paddingBottom: 36,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    gap: 3,
  },
  half: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 11,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dangerButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
