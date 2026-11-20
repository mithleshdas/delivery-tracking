import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { DeliveryForm } from '@/components/delivery/DeliveryForm';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useDeliveryStore } from '@/store/deliveryStore';
import type { Delivery, DeliveryFormValues } from '@/types/delivery';

const EMPTY_FORM: DeliveryFormValues = {
  id: '',
  customer: '',
  driver: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'Pending',
  notes: '',
};

export default function NewDeliveryScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [submitting, setSubmitting] = useState(false);

  const { customers, drivers, statuses, deliveries, createDelivery } =
    useDeliveryStore();

  const handleSubmit = async (payload: Delivery) => {
    try {
      setSubmitting(true);
      await createDelivery(payload);
      router.replace(`/delivery/${encodeURIComponent(payload.id)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create delivery';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="New delivery"
        subtitle="Create a shipment record"
        icon="add-circle-outline"
        leftAction={{
          icon: 'chevron-back',
          onPress: () => router.back(),
        }}
      />
      <DeliveryForm
        mode="create"
        initialValues={EMPTY_FORM}
        customers={customers}
        drivers={drivers}
        statuses={statuses}
        existingIds={deliveries.map((item) => item.id)}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
