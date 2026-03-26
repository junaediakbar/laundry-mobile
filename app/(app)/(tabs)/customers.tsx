import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { CustomerCard } from '@/components/ui/CustomerCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SearchInput } from '@/components/ui/SearchInput';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { qk } from '@/lib/query-keys';
import { fetchCustomers } from '@/services/customers.service';
import { ApiClientError } from '@/types/api';
import type { Customer } from '@/types/models';
import { theme } from '@/theme';

export default function CustomersTabScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);

  const query = useQuery({
    queryKey: qk.customers({ q: debouncedQ, page: 1 }),
    queryFn: () => fetchCustomers(debouncedQ || undefined, 1, 40),
  });

  const renderItem = ({ item }: { item: Customer }) => (
    <CustomerCard
      customer={item}
      onPress={() => router.push(`/(app)/customers/${item.id}`)}
    />
  );

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Pelanggan"
        subtitle="Cari & kelola data"
        right={
          <Pressable
            onPress={() => router.push('/(app)/customers/new')}
            hitSlop={12}
            accessibilityLabel="Tambah pelanggan">
            <Ionicons name="add-circle-outline" size={28} color={theme.color.primary} />
          </Pressable>
        }
      />
      <View style={styles.searchWrap}>
        <SearchInput value={q} onChangeText={setQ} placeholder="Nama atau telepon" />
      </View>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiClientError
              ? query.error.message
              : 'Gagal memuat pelanggan'
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={query.data?.items ?? []}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={() => void query.refetch()}
              tintColor={theme.color.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Tidak ada pelanggan"
              description="Sesuaikan kata kunci atau tambah pelanggan baru"
              icon="people-outline"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  searchWrap: { paddingHorizontal: theme.space.md, marginBottom: theme.space.sm, paddingTop: theme.space.md },
  list: { paddingHorizontal: theme.space.md, paddingBottom: theme.space.xxxl },
});
