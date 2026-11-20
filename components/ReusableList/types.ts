import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type SortDirection = 'asc' | 'desc';

export interface ListColumn<T> {
  key: string;
  label: string;
  visible?: boolean;
  flex?: number;
  render?: (item: T) => ReactNode;
  getValue?: (item: T) => string | number;
}

export interface ListFilterOption {
  label: string;
  value: string;
}

export interface ListFilterConfig {
  key: string;
  label: string;
  options: ListFilterOption[];
}

export interface ListSortOption {
  key: string;
  label: string;
}

export interface ReusableListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  columns: ListColumn<T>[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sortOptions?: ListSortOption[];
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, direction: SortDirection) => void;
  filters?: ListFilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onResetFilters?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  renderItem?: (item: T, visibleColumns: ListColumn<T>[]) => ReactNode;
  onItemPress?: (item: T) => void;
  headerSlot?: ReactNode;
  style?: StyleProp<ViewStyle>;
}
