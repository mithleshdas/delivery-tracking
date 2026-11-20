import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/config';
import { api } from '@/services/api';
import { storage } from '@/services/storage';
import type {
  Customer,
  Delivery,
  DeliveryListFilters,
  Driver,
  StatusOption,
} from '@/types/delivery';
import type { PendingMutation } from '@/types/offline';
import { DEFAULT_LIST_FILTERS } from '@/utils/listHelpers';

interface MetaCache {
  customers: Customer[];
  drivers: Driver[];
  statuses: StatusOption[];
}

interface DeliveryState {
  deliveries: Delivery[];
  customers: Customer[];
  drivers: Driver[];
  statuses: StatusOption[];
  filters: DeliveryListFilters;
  pendingMutations: PendingMutation[];
  loading: boolean;
  refreshing: boolean;
  syncing: boolean;
  error: string | null;
  offline: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  fetchAll: (opts?: { silent?: boolean }) => Promise<void>;
  refresh: () => Promise<void>;
  flushPending: () => Promise<void>;
  setFilters: (patch: Partial<DeliveryListFilters>) => void;
  resetFilters: () => void;
  createDelivery: (payload: Delivery) => Promise<void>;
  updateDelivery: (id: string, payload: Delivery) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
  getDeliveryById: (id: string) => Delivery | undefined;
}

function makeMutationId() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function persistFilters(filters: DeliveryListFilters) {
  await storage.setItem(STORAGE_KEYS.listFilters, JSON.stringify(filters));
}

async function persistDeliveries(deliveries: Delivery[]) {
  await storage.setItem(
    STORAGE_KEYS.deliveriesCache,
    JSON.stringify(deliveries)
  );
}

async function persistMeta(meta: MetaCache) {
  await storage.setItem(STORAGE_KEYS.metaCache, JSON.stringify(meta));
}

async function persistPending(pending: PendingMutation[]) {
  await storage.setItem(STORAGE_KEYS.pendingMutations, JSON.stringify(pending));
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  customers: [],
  drivers: [],
  statuses: [],
  filters: DEFAULT_LIST_FILTERS,
  pendingMutations: [],
  loading: false,
  refreshing: false,
  syncing: false,
  error: null,
  offline: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const [filtersRaw, deliveriesRaw, metaRaw, pendingRaw] = await Promise.all([
        storage.getItem(STORAGE_KEYS.listFilters),
        storage.getItem(STORAGE_KEYS.deliveriesCache),
        storage.getItem(STORAGE_KEYS.metaCache),
        storage.getItem(STORAGE_KEYS.pendingMutations),
      ]);

      const filters = filtersRaw
        ? ({ ...DEFAULT_LIST_FILTERS, ...JSON.parse(filtersRaw) } as DeliveryListFilters)
        : DEFAULT_LIST_FILTERS;

      const deliveries = deliveriesRaw
        ? (JSON.parse(deliveriesRaw) as Delivery[])
        : [];

      const meta = metaRaw ? (JSON.parse(metaRaw) as MetaCache) : null;
      const pendingMutations = pendingRaw
        ? (JSON.parse(pendingRaw) as PendingMutation[])
        : [];

      set({
        filters,
        deliveries,
        customers: meta?.customers ?? [],
        drivers: meta?.drivers ?? [],
        statuses: meta?.statuses ?? [],
        pendingMutations,
        hydrated: true,
        offline: deliveries.length > 0 && pendingMutations.length > 0,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  flushPending: async () => {
    const queue = [...get().pendingMutations];
    if (queue.length === 0) return;

    set({ syncing: true });
    const remaining: PendingMutation[] = [];

    for (const mutation of queue) {
      try {
        if (mutation.type === 'create') {
          await api.createDelivery(mutation.payload);
        } else if (mutation.type === 'update') {
          await api.updateDelivery(mutation.deliveryId, mutation.payload);
        } else {
          await api.deleteDelivery(mutation.deliveryId);
        }
      } catch {
        remaining.push(mutation);
      }
    }

    set({
      pendingMutations: remaining,
      syncing: false,
      offline: remaining.length > 0,
      error:
        remaining.length > 0
          ? `${remaining.length} change(s) waiting to sync`
          : null,
    });
    await persistPending(remaining);
  },

  fetchAll: async (opts) => {
    const silent = opts?.silent ?? false;
    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      await get().flushPending();

      const [deliveries, customers, drivers, statuses] = await Promise.all([
        api.getDeliveries(),
        api.getCustomers(),
        api.getDrivers(),
        api.getStatuses(),
      ]);

      await Promise.all([
        persistDeliveries(deliveries),
        persistMeta({ customers, drivers, statuses }),
      ]);

      const pendingCount = get().pendingMutations.length;

      set({
        deliveries,
        customers,
        drivers,
        statuses,
        loading: false,
        refreshing: false,
        offline: pendingCount > 0,
        error:
          pendingCount > 0
            ? `${pendingCount} change(s) waiting to sync`
            : null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load deliveries';
      const { deliveries, pendingMutations } = get();

      set({
        loading: false,
        refreshing: false,
        offline: true,
        error:
          deliveries.length > 0
            ? pendingMutations.length > 0
              ? `Offline · ${pendingMutations.length} pending sync`
              : 'Showing offline data. Could not reach the API.'
            : message,
      });
    }
  },

  refresh: async () => {
    set({ refreshing: true, error: null });
    await get().fetchAll({ silent: true });
  },

  setFilters: (patch) => {
    const filters = { ...get().filters, ...patch };
    set({ filters });
    void persistFilters(filters);
  },

  resetFilters: () => {
    set({ filters: DEFAULT_LIST_FILTERS });
    void persistFilters(DEFAULT_LIST_FILTERS);
  },

  createDelivery: async (payload) => {
    try {
      const created = await api.createDelivery(payload);
      const deliveries = [...get().deliveries, created];
      set({ deliveries, offline: false, error: null });
      await persistDeliveries(deliveries);
    } catch {
      const deliveries = [...get().deliveries, payload];
      const pendingMutations: PendingMutation[] = [
        ...get().pendingMutations,
        { id: makeMutationId(), type: 'create', payload },
      ];
      set({
        deliveries,
        pendingMutations,
        offline: true,
        error: 'Saved offline · will sync when online',
      });
      await Promise.all([
        persistDeliveries(deliveries),
        persistPending(pendingMutations),
      ]);
    }
  },

  updateDelivery: async (id, payload) => {
    try {
      const updated = await api.updateDelivery(id, payload);
      const deliveries = get().deliveries.map((item) =>
        item.id === id ? updated : item
      );
      set({ deliveries, offline: false, error: null });
      await persistDeliveries(deliveries);
    } catch {
      const deliveries = get().deliveries.map((item) =>
        item.id === id ? payload : item
      );
      const pendingMutations: PendingMutation[] = [
        ...get().pendingMutations.filter(
          (item) =>
            !(
              (item.type === 'update' || item.type === 'delete') &&
              item.deliveryId === id
            )
        ),
        { id: makeMutationId(), type: 'update', deliveryId: id, payload },
      ];
      set({
        deliveries,
        pendingMutations,
        offline: true,
        error: 'Saved offline · will sync when online',
      });
      await Promise.all([
        persistDeliveries(deliveries),
        persistPending(pendingMutations),
      ]);
    }
  },

  deleteDelivery: async (id) => {
    try {
      await api.deleteDelivery(id);
      const deliveries = get().deliveries.filter((item) => item.id !== id);
      const pendingMutations = get().pendingMutations.filter((item) => {
        if (item.type === 'create' && item.payload.id === id) return false;
        if (
          (item.type === 'update' || item.type === 'delete') &&
          item.deliveryId === id
        ) {
          return false;
        }
        return true;
      });
      set({ deliveries, pendingMutations, offline: false, error: null });
      await Promise.all([
        persistDeliveries(deliveries),
        persistPending(pendingMutations),
      ]);
    } catch {
      const existingCreate = get().pendingMutations.find(
        (item) => item.type === 'create' && item.payload.id === id
      );

      // If it only existed offline, drop it from cache + queue.
      if (existingCreate) {
        const deliveries = get().deliveries.filter((item) => item.id !== id);
        const pendingMutations = get().pendingMutations.filter(
          (item) => !(item.type === 'create' && item.payload.id === id)
        );
        set({
          deliveries,
          pendingMutations,
          offline: pendingMutations.length > 0,
          error:
            pendingMutations.length > 0
              ? `${pendingMutations.length} change(s) waiting to sync`
              : null,
        });
        await Promise.all([
          persistDeliveries(deliveries),
          persistPending(pendingMutations),
        ]);
        return;
      }

      const deliveries = get().deliveries.filter((item) => item.id !== id);
      const pendingMutations: PendingMutation[] = [
        ...get().pendingMutations.filter(
          (item) =>
            !(
              (item.type === 'update' || item.type === 'delete') &&
              item.deliveryId === id
            )
        ),
        { id: makeMutationId(), type: 'delete', deliveryId: id },
      ];
      set({
        deliveries,
        pendingMutations,
        offline: true,
        error: 'Deleted offline · will sync when online',
      });
      await Promise.all([
        persistDeliveries(deliveries),
        persistPending(pendingMutations),
      ]);
    }
  },

  getDeliveryById: (id) => get().deliveries.find((item) => item.id === id),
}));
