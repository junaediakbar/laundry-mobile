import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { qk } from '@/lib/query-keys';
import { fetchCustomer, fetchCustomerRecentOrders } from '@/services/customers.service';
import { ApiClientError } from '@/types/api';
import { theme, textVariants } from '@/theme';
import { formatCurrencyIdr } from '@/utils/currency';

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = id ?? '';

  const customerQuery = useQuery({
    queryKey: qk.customer(customerId),
    queryFn: () => fetchCustomer(customerId),
    enabled: !!customerId,
  });

  const ordersQuery = useQuery({
    queryKey: qk.customerOrders(customerId),
    queryFn: () => fetchCustomerRecentOrders(customerId, 15),
    enabled: !!customerId,
  });

  if (!customerId) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Pelanggan" onBack={() => router.back()} />
        <ErrorState message="ID tidak valid" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title="Detail pelanggan" onBack={() => router.back()} />
      {customerQuery.isLoading ? (
        <LoadingState />
      ) : customerQuery.isError ? (
        <ErrorState
          message={
            customerQuery.error instanceof ApiClientError
              ? customerQuery.error.message
              : 'Gagal memuat pelanggan'
          }
          onRetry={() => void customerQuery.refetch()}
        />
      ) : customerQuery.data ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={
                customerQuery.isFetching &&
                !customerQuery.isLoading
              }
              onRefresh={() => {
                void customerQuery.refetch();
                void ordersQuery.refetch();
              }}
              tintColor={theme.color.primary}
            />
          }>
          <View style={styles.card}>
            <Text style={styles.name}>{customerQuery.data.name}</Text>
            {customerQuery.data.phone ? (
              <Text style={[textVariants.bodyMuted, styles.line]}>📞 {customerQuery.data.phone}</Text>
            ) : null}
            {customerQuery.data.email ? (
              <Text style={[textVariants.bodyMuted, styles.line]}>✉️ {customerQuery.data.email}</Text>
            ) : null}
            {customerQuery.data.address ? (
              <Text style={[textVariants.bodyMuted, styles.line]}>{customerQuery.data.address}</Text>
            ) : null}
            {customerQuery.data.notes ? (
              <Text style={[textVariants.caption, styles.notes]}>Catatan: {customerQuery.data.notes}</Text>
            ) : null}
          </View>

          <Text style={styles.section}>Nota terbaru</Text>
          {ordersQuery.isLoading ? (
            <LoadingState label="Memuat nota…" />
          ) : ordersQuery.data?.length === 0 ? (
            <Text style={[textVariants.bodyMuted, styles.empty]}>Belum ada riwayat nota.</Text>
          ) : (
            ordersQuery.data?.map((o) => (
              <Pressable
                key={o.id}
                style={({ pressed }) => [styles.orderRow, pressed && { opacity: 0.9 }]}
                onPress={() => router.push(`/(app)/orders/${o.id}`)}>
                <View style={{ flex: 1 }}>
                  <Text style={[textVariants.body, { fontWeight: '600' }]}>{o.invoiceNumber}</Text>
                  <View style={styles.badgeRow}>
                    <StatusBadge status={o.workflowStatus} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.total}>{formatCurrencyIdr(o.total)}</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  name: {
    fontSize: theme.font.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.color.text,
  },
  line: { marginTop: theme.space.xs },
  notes: { marginTop: theme.space.md, color: theme.color.textMuted },
  section: {
    ...textVariants.label,
    marginTop: theme.space.lg,
    marginBottom: theme.space.sm,
  },
  empty: { marginBottom: theme.space.md },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  badgeRow: { marginTop: theme.space.xs },
  total: {
    fontWeight: theme.fontWeight.semibold,
    color: theme.color.primaryDark,
    marginBottom: 4,
  },
});
