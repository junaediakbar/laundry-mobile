import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { qk } from '@/lib/query-keys';
import { fetchDashboardSummary } from '@/services/dashboard.service';
import { ApiClientError } from '@/types/api';
import { theme, textVariants } from '@/theme';
import { formatCurrencyIdr } from '@/utils/currency';

export default function DashboardScreen() {
  const router = useRouter();
  const query = useQuery({
    queryKey: qk.dashboard,
    queryFn: fetchDashboardSummary,
  });

  return (
    <View style={styles.flex}>
      <AppHeader title="Beranda" subtitle="Ringkasan hari ini" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={() => void query.refetch()}
            tintColor={theme.color.primary}
          />
        }>
        {query.isLoading ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState
            message={
              query.error instanceof ApiClientError
                ? query.error.message
                : 'Gagal memuat ringkasan'
            }
            onRetry={() => void query.refetch()}
          />
        ) : query.data ? (
          <>
            <Text style={[textVariants.bodyMuted, styles.section]}>Statistik</Text>
            <View style={styles.grid}>
              <SummaryCard
                label="Total pelanggan"
                value={String(query.data.customerCount)}
                tone="default"
              />
              <SummaryCard
                label="Total nota"
                value={String(query.data.orderCount)}
                tone="primary"
              />
              <SummaryCard
                label="Belum lunas"
                value={String(query.data.unpaidCount)}
                tone="warning"
                hint="Perlu ditagih"
              />
              <SummaryCard
                label="Pendapatan"
                value={formatCurrencyIdr(query.data.totalRevenue)}
                tone="success"
              />
            </View>

            <Text style={[textVariants.bodyMuted, styles.section]}>Aksi cepat</Text>
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.action, pressed && { opacity: 0.9 }]}
                onPress={() => router.push('/(app)/orders/new')}>
                <Text style={styles.actionTitle}>Nota baru</Text>
                <Text style={styles.actionSub}>Input cepat di kasir</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.action, pressed && { opacity: 0.9 }]}
                onPress={() => router.push('/(app)/(tabs)/orders')}>
                <Text style={styles.actionTitle}>Lihat nota aktif</Text>
                <Text style={styles.actionSub}>Status & pembayaran</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  section: { marginBottom: theme.space.sm, marginTop: theme.space.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.sm,
  },
  actions: { gap: theme.space.sm },
  action: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  actionTitle: {
    fontSize: theme.font.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.color.text,
  },
  actionSub: {
    marginTop: 4,
    fontSize: theme.font.sm,
    color: theme.color.textSecondary,
  },
});
