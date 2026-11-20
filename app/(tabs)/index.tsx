import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { ReusableList } from '@/components/ReusableList';
import type { ListColumn, ListFilterConfig } from '@/components/ReusableList';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useNetworkSync } from '@/hooks/useNetworkSync';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useDeliveryStore } from '@/store/deliveryStore';
import { useThemeStore } from '@/store/themeStore';
import type { Delivery, DeliveryStatus } from '@/types/delivery';
import { applyDeliveryFilters, SORT_OPTIONS } from '@/utils/listHelpers';

export default function DeliveriesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);
  const cyclePreference = useThemeStore((state) => state.cyclePreference);

  useNetworkSync();

  const {
    deliveries,
    drivers,
    statuses,
    filters,
    loading,
    refreshing,
    syncing,
    error,
    offline,
    pendingMutations,
    hydrated,
    hydrate,
    fetchAll,
    refresh,
    setFilters,
    resetFilters,
  } = useDeliveryStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!hydrated) {
        await hydrate();
      }
      if (mounted) {
        await fetchAll();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hydrated, hydrate, fetchAll]);

  const filtered = useMemo(
    () => applyDeliveryFilters(deliveries, filters),
    [deliveries, filters]
  );

  const columns: ListColumn<Delivery>[] = useMemo(
    () => [
      { key: 'id', label: 'ID', getValue: (item) => item.id },
      { key: 'customer', label: 'Customer', getValue: (item) => item.customer },
      { key: 'driver', label: 'Driver', getValue: (item) => item.driver },
      { key: 'date', label: 'Date', getValue: (item) => item.date },
      { key: 'status', label: 'Status', getValue: (item) => item.status },
      {
        key: 'notes',
        label: 'Notes',
        visible: false,
        getValue: (item) => item.notes,
      },
    ],
    []
  );

  const filterConfigs: ListFilterConfig[] = useMemo(() => {
    const statusOptions = [
      { label: 'All', value: 'All' },
      ...(statuses.length
        ? statuses.map((item) => ({ label: item.name, value: item.name }))
        : (
            ['Pending', 'In Transit', 'Delivered', 'Cancelled'] as DeliveryStatus[]
          ).map((name) => ({ label: name, value: name }))),
    ];

    const driverOptions = [
      { label: 'All', value: 'All' },
      ...drivers.map((item) => ({ label: item.name, value: item.name })),
    ];

    return [
      { key: 'status', label: 'Status', options: statusOptions },
      { key: 'driver', label: 'Driver', options: driverOptions },
    ];
  }, [drivers, statuses]);

  const themeIcon =
    preference === 'system'
      ? 'phone-portrait-outline'
      : scheme === 'dark'
        ? 'moon-outline'
        : 'sunny-outline';

  const showBanner = Boolean(error || offline || syncing || pendingMutations.length);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Deliveries"
        subtitle={`${filtered.length} of ${deliveries.length} shown`}
        icon="cube-outline"
        secondaryAction={{
          icon: themeIcon,
          onPress: cyclePreference,
        }}
        rightAction={{
          icon: 'add',
          label: 'New',
          onPress: () => router.push('/delivery/new'),
        }}
      />

      {showBanner ? (
        <Animated.View entering={FadeInDown.duration(220)}>
          <Pressable
            onPress={() => void refresh()}
            style={[
              styles.banner,
              {
                backgroundColor: offline ? colors.tintSoft : colors.dangerSoft,
                borderColor: offline ? colors.tint : colors.danger,
              },
            ]}>
            <Icon
              name={
                syncing
                  ? 'sync-outline'
                  : offline
                    ? 'cloud-offline-outline'
                    : 'alert-circle-outline'
              }
              size={14}
              color={offline || syncing ? colors.tint : colors.danger}
            />
            <Text
              style={{
                color: offline || syncing ? colors.tint : colors.danger,
                fontWeight: '600',
                fontSize: 12,
                flex: 1,
              }}>
              {syncing
                ? 'Syncing offline changes…'
                : error ?? 'You are offline'}
            </Text>
            <Text
              style={{
                color: offline || syncing ? colors.tint : colors.danger,
                fontSize: 11,
                fontWeight: '700',
              }}>
              Retry
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <ReusableList
        data={filtered}
        keyExtractor={(item) => item.id}
        columns={columns}
        searchValue={filters.search}
        onSearchChange={(search) => setFilters({ search })}
        searchPlaceholder="Search deliveries…"
        sortOptions={SORT_OPTIONS}
        sortKey={filters.sortKey}
        sortDirection={filters.sortDirection}
        onSortChange={(sortKey, sortDirection) =>
          setFilters({
            sortKey: sortKey as typeof filters.sortKey,
            sortDirection,
          })
        }
        filters={filterConfigs}
        filterValues={{
          status: filters.status,
          driver: filters.driver,
        }}
        onFilterChange={(key, value) => {
          if (key === 'status') {
            setFilters({ status: value as typeof filters.status });
          }
          if (key === 'driver') {
            setFilters({ driver: value });
          }
        }}
        onResetFilters={resetFilters}
        loading={loading}
        refreshing={refreshing}
        onRefresh={refresh}
        emptyTitle="No deliveries found"
        emptyMessage="Create a delivery or reset your filters."
        renderItem={(item) => (
          <DeliveryCard
            delivery={item}
            onPress={(delivery) =>
              router.push(`/delivery/${encodeURIComponent(delivery.id)}`)
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    marginHorizontal: 14,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
