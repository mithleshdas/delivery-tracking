import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { DeliveryForm } from '@/components/delivery/DeliveryForm';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useDeliveryStore } from '@/store/deliveryStore';
import type { Delivery, DeliveryFormValues } from '@/types/delivery';

export default function EditDeliveryScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const decodedId = id ? decodeURIComponent(id) : '';

  const [submitting, setSubmitting] = useState(false);

  const {
    customers,
    drivers,
    statuses,
    deliveries,
    getDeliveryById,
    updateDelivery,
    deleteDelivery,
  } = useDeliveryStore();

  const delivery = getDeliveryById(decodedId);

  const initialValues: DeliveryFormValues | null = useMemo(() => {
    if (!delivery) return null;
    return {
      id: delivery.id,
      customer: delivery.customer,
      driver: delivery.driver,
      date: delivery.date,
      status: delivery.status,
      notes: delivery.notes ?? '',
    };
  }, [delivery]);

  const handleSubmit = async (payload: Delivery) => {
    try {
      setSubmitting(true);
      await updateDelivery(decodedId, payload);
      Alert.alert('Saved', 'Delivery updated successfully.');
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update delivery';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await deleteDelivery(decodedId);
    router.replace('/');
  };

  if (!initialValues) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Delivery"
          leftAction={{ icon: 'chevron-back', onPress: () => router.back() }}
        />
        {deliveries.length === 0 ? (
          <LoadingState message="Loading delivery…" />
        ) : (
          <View style={styles.missing}>
            <Icon name="alert-circle-outline" size={28} color={colors.muted} />
            <Text style={[styles.missingTitle, { color: colors.text }]}>
              Delivery not found
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              No delivery matches “{decodedId}”.
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title={decodedId}
        subtitle="Edit delivery details"
        icon="create-outline"
        leftAction={{
          icon: 'chevron-back',
          onPress: () => router.back(),
        }}
      />
      <DeliveryForm
        mode="edit"
        initialValues={initialValues}
        customers={customers}
        drivers={drivers}
        statuses={statuses}
        existingIds={deliveries.map((item) => item.id)}
        submitting={submitting}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  missingTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
});
