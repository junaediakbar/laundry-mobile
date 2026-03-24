import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { IconTag } from '@tabler/icons-react-native';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { qk } from '@/lib/query-keys';
import {
  deleteServiceType,
  fetchServiceTypes,
  updateServiceType,
} from '@/services/service-types.service';
import { ApiClientError } from '@/types/api';
import type { ServiceType } from '@/types/models';
import { theme, textVariants } from '@/theme';
import { formatCurrencyIdr } from '@/utils/currency';

export default function ServiceTypesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: qk.serviceTypes,
    queryFn: () => fetchServiceTypes(true),
  });
  const refreshAll = () => void queryClient.invalidateQueries({ queryKey: qk.serviceTypes });
  const toggleMutation = useMutation({
    mutationFn: (item: ServiceType) =>
      updateServiceType(item.id, {
        name: item.name,
        unit: item.unit,
        defaultPrice: Number(item.defaultPrice),
        isActive: !item.isActive,
      }),
    onSuccess: refreshAll,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteServiceType(id),
    onSuccess: refreshAll,
  });

  return (
    <View style={styles.flex}>
      <AppHeader title="Jenis layanan" onBack={() => router.back()} />
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiClientError
              ? query.error.message
              : 'Gagal memuat layanan'
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={query.data ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={() => void query.refetch()}
              tintColor={theme.color.primary}
            />
          }
          renderItem={({ item }: { item: ServiceType }) => (
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <IconTag size={22} color={theme.color.primary} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={[textVariants.caption, styles.meta]}>
                  Satuan: {item.unit} · Default {formatCurrencyIdr(item.defaultPrice)}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.badge, { backgroundColor: item.isActive ? theme.color.successMuted : theme.color.secondaryMuted }]}
                  onPress={() => toggleMutation.mutate(item)}>
                  <Text style={[textVariants.caption, { color: item.isActive ? theme.color.success : theme.color.textSecondary }]}>
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('Hapus jenis layanan', `Hapus ${item.name}?`, [
                      { text: 'Batal', style: 'cancel' },
                      { text: 'Hapus', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                    ])
                  }>
                  <Text style={styles.deleteText}>Hapus</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState title="Belum ada jenis layanan" icon="receipt-outline" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  list: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: theme.font.md, fontWeight: theme.fontWeight.semibold, color: theme.color.text },
  meta: { marginTop: 4, color: theme.color.textSecondary },
  actions: { alignItems: 'flex-end', gap: theme.space.xs },
  badge: { paddingHorizontal: theme.space.sm, paddingVertical: 4, borderRadius: theme.radius.full },
  deleteText: { fontSize: theme.font.xs, color: theme.color.error, fontWeight: theme.fontWeight.semibold },
});
