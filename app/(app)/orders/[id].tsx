import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PaymentBadge } from '@/components/ui/PaymentBadge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { qk } from '@/lib/query-keys';
import {
  createPayment,
  fetchOrderDetail,
  updateWorkflow,
} from '@/services/orders.service';
import { ApiClientError } from '@/types/api';
import { theme, textVariants } from '@/theme';
import { formatCurrencyIdr, sumMoney } from '@/utils/currency';
import { formatDateShort } from '@/utils/format-date';
import { workflowLabel } from '@/utils/order-status';

const WORKFLOWS = [
  'received',
  'washing',
  'drying',
  'ironing',
  'finished',
  'picked_up',
] as const;

const PAY_METHODS = ['cash', 'transfer', 'qris', 'lainnya'] as const;

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = id ?? '';
  const queryClient = useQueryClient();
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<string>('cash');
  const [payNote, setPayNote] = useState('');

  const query = useQuery({
    queryKey: qk.order(orderId),
    queryFn: () => fetchOrderDetail(orderId),
    enabled: !!orderId,
  });

  const paidTotal = useMemo(() => {
    if (!query.data) return 0;
    return sumMoney(query.data.payments.map((p) => p.amount));
  }, [query.data]);

  const orderTotal = query.data ? Number(query.data.total) : 0;
  const remaining = Math.max(orderTotal - paidTotal, 0);

  const wfMutation = useMutation({
    mutationFn: (status: string) => updateWorkflow(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.order(orderId) });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const payMutation = useMutation({
    mutationFn: () =>
      createPayment(orderId, {
        amount: Number(payAmount.replace(/\./g, '').replace(',', '.')),
        method: payMethod,
        note: payNote.trim() || undefined,
      }),
    onSuccess: () => {
      setPayAmount('');
      setPayNote('');
      void queryClient.invalidateQueries({ queryKey: qk.order(orderId) });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const onPay = () => {
    const raw = payAmount.replace(/\./g, '').replace(',', '.');
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert('Nominal tidak valid', 'Isi jumlah pembayaran.');
      return;
    }
    payMutation.mutate();
  };

  if (!orderId) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Nota" onBack={() => router.back()} />
        <ErrorState message="ID tidak valid" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title="Detail nota" onBack={() => router.back()} />
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
      ) : query.data ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={() => void query.refetch()}
              tintColor={theme.color.primary}
            />
          }>
          <View style={styles.hero}>
            <Text style={styles.invoice}>{query.data.invoiceNumber}</Text>
            <View style={styles.badges}>
              <StatusBadge status={query.data.workflowStatus} />
              <PaymentBadge status={query.data.paymentStatus} />
            </View>
            <Text style={[textVariants.body, styles.customer]}>
              {query.data.customer.name}
            </Text>
            {query.data.customer.phone ? (
              <Text style={[textVariants.caption, styles.phone]}>
                {query.data.customer.phone}
              </Text>
            ) : null}
            <Text style={[textVariants.caption, styles.meta]}>
              Terima: {formatDateShort(query.data.receivedDate)}
            </Text>
          </View>

          <Text style={styles.section}>Status proses</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wfRow}>
            {WORKFLOWS.map((s) => {
              const active = query.data!.workflowStatus === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => wfMutation.mutate(s)}
                  disabled={wfMutation.isPending}
                  style={[
                    styles.wfChip,
                    active && styles.wfChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.wfChipText,
                      active && styles.wfChipTextActive,
                    ]}>
                    {workflowLabel(s)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.section}>Item</Text>
          {query.data.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={[textVariants.body, styles.itemName]}>
                  {it.serviceType.name}
                </Text>
                <Text style={[textVariants.caption, styles.itemMeta]}>
                  {it.quantity} {it.serviceType.unit} × {formatCurrencyIdr(it.unitPrice)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatCurrencyIdr(it.total)}</Text>
            </View>
          ))}

          <View style={styles.totalBar}>
            <Text style={textVariants.title}>Total</Text>
            <Text style={styles.totalVal}>{formatCurrencyIdr(query.data.total)}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={[textVariants.bodyMuted, { flex: 1 }]}>Sudah dibayar</Text>
            <Text style={textVariants.body}>{formatCurrencyIdr(String(paidTotal))}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={[textVariants.bodyMuted, { flex: 1 }]}>Sisa</Text>
            <Text style={[textVariants.body, { fontWeight: '700' }]}>
              {formatCurrencyIdr(String(remaining))}
            </Text>
          </View>

          {query.data.paymentStatus !== 'paid' ? (
            <>
              <Text style={styles.section}>Catat pembayaran</Text>
              <View style={styles.methodRow}>
                {PAY_METHODS.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setPayMethod(m)}
                    style={[
                      styles.methodChip,
                      payMethod === m && styles.methodChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.methodText,
                        payMethod === m && styles.methodTextActive,
                      ]}>
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={payAmount}
                onChangeText={setPayAmount}
                placeholder="Jumlah (angka)"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.color.textMuted}
                style={styles.input}
              />
              <TextInput
                value={payNote}
                onChangeText={setPayNote}
                placeholder="Catatan (opsional)"
                placeholderTextColor={theme.color.textMuted}
                style={styles.input}
              />
              <PrimaryButton
                title={payMutation.isPending ? 'Menyimpan…' : 'Simpan pembayaran'}
                onPress={onPay}
                loading={payMutation.isPending}
              />
            </>
          ) : null}

          {query.data.note ? (
            <>
              <Text style={styles.section}>Catatan</Text>
              <Text style={[textVariants.bodyMuted, styles.note]}>{query.data.note}</Text>
            </>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  hero: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    marginBottom: theme.space.md,
  },
  invoice: {
    fontSize: theme.font.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.color.text,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: theme.space.sm },
  customer: { marginTop: theme.space.sm, fontWeight: theme.fontWeight.semibold },
  phone: { marginTop: 4, color: theme.color.textSecondary },
  meta: { marginTop: theme.space.xs, color: theme.color.textMuted },
  section: {
    ...textVariants.label,
    marginTop: theme.space.md,
    marginBottom: theme.space.sm,
    color: theme.color.textSecondary,
  },
  wfRow: { flexGrow: 0, marginBottom: theme.space.sm },
  wfChip: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    marginRight: theme.space.xs,
  },
  wfChipActive: {
    backgroundColor: theme.color.primaryMuted,
    borderColor: theme.color.primary,
  },
  wfChipText: { fontSize: theme.font.sm, color: theme.color.textSecondary },
  wfChipTextActive: { color: theme.color.primaryDark, fontWeight: theme.fontWeight.semibold },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border,
  },
  itemName: { fontWeight: theme.fontWeight.medium },
  itemMeta: { marginTop: 2, color: theme.color.textMuted },
  itemTotal: { fontWeight: theme.fontWeight.semibold, color: theme.color.primaryDark },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.space.md,
    paddingTop: theme.space.md,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
  },
  totalVal: { fontSize: theme.font.lg, fontWeight: theme.fontWeight.bold, color: theme.color.text },
  payRow: { flexDirection: 'row', marginTop: theme.space.xs },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.space.sm },
  methodChip: {
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  methodChipActive: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.primaryMuted,
  },
  methodText: { fontSize: theme.font.sm, color: theme.color.textSecondary, textTransform: 'capitalize' },
  methodTextActive: { color: theme.color.primaryDark, fontWeight: theme.fontWeight.semibold },
  input: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    fontSize: theme.font.md,
    color: theme.color.text,
    backgroundColor: theme.color.surface,
    marginBottom: theme.space.sm,
  },
  note: { backgroundColor: theme.color.surface, padding: theme.space.md, borderRadius: theme.radius.md },
});
