import type {
  Delivery,
  DeliveryListFilters,
  DeliverySortKey,
  SortDirection,
} from '@/types/delivery';

export function applyDeliveryFilters(
  deliveries: Delivery[],
  filters: DeliveryListFilters
): Delivery[] {
  const search = filters.search.trim().toLowerCase();

  let result = deliveries.filter((item) => {
    const matchesSearch =
      !search ||
      [item.id, item.customer, item.driver, item.status, item.notes, item.date]
        .join(' ')
        .toLowerCase()
        .includes(search);

    const matchesStatus =
      filters.status === 'All' || item.status === filters.status;

    const matchesDriver =
      filters.driver === 'All' || item.driver === filters.driver;

    return matchesSearch && matchesStatus && matchesDriver;
  });

  result = [...result].sort((a, b) =>
    compareValues(a[filters.sortKey], b[filters.sortKey], filters.sortDirection)
  );

  return result;
}

function compareValues(
  left: string,
  right: string,
  direction: SortDirection
): number {
  const cmp = left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  return direction === 'asc' ? cmp : -cmp;
}

export const DEFAULT_LIST_FILTERS: DeliveryListFilters = {
  search: '',
  status: 'All',
  driver: 'All',
  sortKey: 'date',
  sortDirection: 'desc',
};

export const SORT_OPTIONS: { key: DeliverySortKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'id', label: 'Delivery ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'driver', label: 'Driver' },
  { key: 'status', label: 'Status' },
];
