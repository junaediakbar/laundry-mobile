import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { IconMapPin } from '@tabler/icons-react-native';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { qk } from '@/lib/query-keys';
import { deleteDeliveryPlan, fetchDeliveryPlans } from '@/services/delivery.service';
import { ApiClientError } from '@/types/api';
import type { DeliveryPlanListItem } from '@/types/models';
import { theme, textVariants } from '@/theme';
import { formatDateShort } from '@/utils/format-date';

export default function DeliveryPlanningScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: qk.deliveryPlans,
    queryFn: () => fetchDeliveryPlans(50),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDeliveryPlan(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: qk.deliveryPlans }),
  });

  return (
    <View style={styles.flex}>
      <AppHeader title="Perencanaan pengiriman" onBack={() => router.back()} />
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiClientError
              ? query.error.message
              : 'Gagal memuat rencana'
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={query.data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={() => void query.refetch()}
              tintColor={theme.color.primary}
            />
          }
          renderItem={({ item }: { item: DeliveryPlanListItem }) => (
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <IconMapPin size={22} color={theme.color.primary} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={[textVariants.caption, styles.meta]}>
                  {formatDateShort(item.plannedDate)} · {item.stopCount} stop
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  Alert.alert('Hapus rencana', `Hapus ${item.name}?`, [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Hapus', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                  ])
                }>
                <Text style={styles.deleteText}>Hapus</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState title="Belum ada rencana pengiriman" icon="car-outline" />
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
  deleteText: { fontSize: theme.font.xs, color: theme.color.error, fontWeight: theme.fontWeight.semibold },
});
