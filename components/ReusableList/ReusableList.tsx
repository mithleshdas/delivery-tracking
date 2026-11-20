import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import { Dropdown } from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/LoadingState';
import { useThemeColors } from '@/hooks/useThemeColors';

import type { ListColumn, ReusableListProps, SortDirection } from './types';

function DefaultRow<T>({
  item,
  columns,
  onPress,
}: {
  item: T;
  columns: ListColumn<T>[];
  onPress?: (item: T) => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      {columns.map((column) => {
        const content = column.render
          ? column.render(item)
          : String(column.getValue?.(item) ?? '');

        return (
          <View
            key={column.key}
            style={[styles.cell, { flex: column.flex ?? 1 }]}>
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>
              {column.label}
            </Text>
            {typeof content === 'string' || typeof content === 'number' ? (
              <Text
                style={[styles.cellValue, { color: colors.text }]}
                numberOfLines={1}>
                {content}
              </Text>
            ) : (
              content
            )}
          </View>
        );
      })}
    </Pressable>
  );
}

export function ReusableList<T>({
  data,
  keyExtractor,
  columns,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  sortOptions = [],
  sortKey,
  sortDirection = 'asc',
  onSortChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onResetFilters,
  loading = false,
  refreshing = false,
  onRefresh,
  emptyTitle = 'No results',
  emptyMessage = 'Try adjusting search or filters.',
  renderItem,
  onItemPress,
  headerSlot,
  style,
}: ReusableListProps<T>) {
  const colors = useThemeColors();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible !== false),
    [columns]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchValue.trim()) count += 1;
    Object.values(filterValues).forEach((value) => {
      if (value && value !== 'All') count += 1;
    });
    return count;
  }, [filterValues, searchValue]);

  const toggleSortDirection = () => {
    if (!onSortChange || !sortKey) return;
    const next: SortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(sortKey, next);
  };

  if (loading && data.length === 0) {
    return <LoadingState message="Loading…" />;
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.controls,
          { backgroundColor: colors.surface, borderColor: colors.hairline },
        ]}>
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchWrap,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
              },
            ]}>
            <Icon name="search-outline" size={16} color={colors.muted} />
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.muted}
              style={[styles.search, { color: colors.text }]}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          <Pressable
            onPress={() => setFiltersOpen((open) => !open)}
            style={({ pressed }) => [
              styles.filterToggle,
              {
                backgroundColor: filtersOpen ? colors.tintSoft : colors.inputBg,
                borderColor: activeFilterCount > 0 ? colors.tint : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Icon
              name="options-outline"
              size={16}
              color={activeFilterCount > 0 ? colors.tint : colors.text}
            />
            {activeFilterCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {filtersOpen ? (
          <Animated.View
            entering={FadeIn.duration(160)}
            exiting={FadeOut.duration(100)}
            layout={LinearTransition.springify()}
            style={styles.expanded}>
            <View style={styles.dropdownRow}>
              {sortOptions.length > 0 ? (
                <Dropdown
                  label="Sort"
                  value={sortKey ?? sortOptions[0]?.key ?? ''}
                  options={sortOptions.map((option) => ({
                    label: option.label,
                    value: option.key,
                  }))}
                  onChange={(key) => onSortChange?.(key, sortDirection)}
                />
              ) : null}
              {sortOptions.length > 0 ? (
                <View style={styles.directionWrap}>
                  <Text
                    style={[
                      styles.directionLabel,
                      { color: colors.textSecondary },
                    ]}>
                    Order
                  </Text>
                  <Pressable
                    onPress={toggleSortDirection}
                    style={({ pressed }) => [
                      styles.directionButton,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <Icon
                      name={
                        sortDirection === 'asc'
                          ? 'arrow-up-outline'
                          : 'arrow-down-outline'
                      }
                      size={14}
                      color={colors.text}
                    />
                    <Text
                      style={[styles.directionText, { color: colors.text }]}>
                      {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            {filters.length > 0 ? (
              <View style={styles.dropdownRow}>
                {filters.map((filter) => (
                  <Dropdown
                    key={filter.key}
                    label={filter.label}
                    value={filterValues[filter.key] ?? 'All'}
                    options={filter.options}
                    onChange={(value) => onFilterChange?.(filter.key, value)}
                    compact
                  />
                ))}
              </View>
            ) : null}

            {activeFilterCount > 0 && onResetFilters ? (
              <Pressable
                onPress={onResetFilters}
                hitSlop={6}
                style={styles.resetRow}>
                <Icon name="refresh-outline" size={14} color={colors.tint} />
                <Text style={[styles.resetLink, { color: colors.tint }]}>
                  Reset all
                </Text>
              </Pressable>
            ) : null}
          </Animated.View>
        ) : null}

        {headerSlot}
      </View>

      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        contentContainerStyle={
          data.length === 0 ? styles.emptyListContent : styles.listContent
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
              colors={[colors.tint]}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState title={emptyTitle} message={emptyMessage} />
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index * 28, 180)).springify()}>
            {renderItem ? (
              renderItem(item, visibleColumns)
            ) : (
              <DefaultRow
                item={item}
                columns={visibleColumns}
                onPress={onItemPress}
              />
            )}
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchWrap: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  search: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterToggle: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  expanded: {
    gap: 8,
  },
  dropdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  directionWrap: {
    width: 92,
    gap: 3,
  },
  directionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  directionButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  directionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 6,
  },
  cell: {
    gap: 1,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
