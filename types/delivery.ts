export type DeliveryStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface Delivery {
  id: string;
  customer: string;
  driver: string;
  date: string;
  status: DeliveryStatus;
  notes: string;
}

export interface Customer {
  id: number;
  name: string;
}

export interface Driver {
  id: number;
  name: string;
}

export interface StatusOption {
  id: number;
  name: DeliveryStatus;
}

export type DeliveryFormValues = {
  id: string;
  customer: string;
  driver: string;
  date: string;
  status: DeliveryStatus | '';
  notes: string;
};

export type DeliveryFormErrors = Partial<Record<keyof DeliveryFormValues, string>>;

export type SortDirection = 'asc' | 'desc';

export type DeliverySortKey = 'id' | 'customer' | 'driver' | 'date' | 'status';

export interface DeliveryListFilters {
  search: string;
  status: DeliveryStatus | 'All';
  driver: string | 'All';
  sortKey: DeliverySortKey;
  sortDirection: SortDirection;
}
