import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { OrderCard } from '@/components/ui/OrderCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { qk } from '@/lib/query-keys';
import { fetchOrders } from '@/services/orders.service';
import { ApiClientError } from '@/types/api';
import type { OrderListItem } from '@/types/models';
import { theme } from '@/theme';

export default function OrdersTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);

  const query = useQuery({
    queryKey: qk.orders({ q: debouncedQ, page: 1 }),
    queryFn: () =>
      fetchOrders({
        q: debouncedQ || undefined,
        page: 1,
        pageSize: 30,
        sort: 'created_at',
        dir: 'desc',
      }),
  });

  const fabBottom = tabBarHeight + theme.space.md;

  const renderItem = ({ item }: { item: OrderListItem }) => (
    <OrderCard
      order={item}
      onPress={() => router.push(`/(app)/orders/${item.id}`)}
    />
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Nota" subtitle="Pantau & perbarui status" />
      <View style={styles.searchWrap}>
        <SearchInput value={q} onChangeText={setQ} placeholder="Cari invoice / pelanggan" />
      </View>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiClientError
              ? query.error.message
              : 'Gagal memuat nota'
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={query.data?.items ?? []}
          keyExtractor={(o) => o.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + tabBarHeight + 80 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={() => void query.refetch()}
              tintColor={theme.color.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Belum ada nota"
              description="Buat nota pertama dengan tombol +"
              icon="receipt-outline"
            />
          }
        />
      )}

      <FloatingActionButton
        accessibilityLabel="Buat nota baru"
        bottom={fabBottom}
        onPress={() => router.push('/(app)/orders/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  searchWrap: { paddingHorizontal: theme.space.md, marginBottom: theme.space.sm },
  list: { paddingHorizontal: theme.space.md },
});
