import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { OrderListItem } from '@/types/models';
import { cardShadow, theme, textVariants } from '@/theme';
import { formatCurrencyIdr } from '@/utils/currency';
import { formatDateShort } from '@/utils/format-date';

import { PaymentBadge } from './PaymentBadge';
import { StatusBadge } from './StatusBadge';

type Props = {
  order: OrderListItem;
  onPress: () => void;
};

export function OrderCard({ order, onPress }: Props) {
  const serviceHint = order.firstItem?.serviceType.name;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <View style={styles.top}>
        <View style={styles.invoiceBlock}>
          <Text style={styles.invoice}>{order.invoiceNumber}</Text>
          <Text style={[textVariants.caption, styles.date]}>
            {formatDateShort(order.createdAt)}
          </Text>
        </View>
        <Text style={styles.total}>{formatCurrencyIdr(order.total)}</Text>
      </View>
      <Text style={[textVariants.body, styles.customer]} numberOfLines={1}>
        {order.customer.name}
      </Text>
      {serviceHint ? (
        <Text style={[textVariants.caption, styles.service]} numberOfLines={1}>
          {serviceHint}
          {order.itemCount > 1 ? ` · +${order.itemCount - 1} lainnya` : ''}
        </Text>
      ) : null}
      <View style={styles.badges}>
        <StatusBadge status={order.workflowStatus} />
        <PaymentBadge status={order.paymentStatus} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...cardShadow(),
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceBlock: { flex: 1 },
  invoice: {
    fontSize: theme.font.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.color.text,
  },
  date: { marginTop: 2, color: theme.color.textMuted },
  total: {
    fontSize: theme.font.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.color.primaryDark,
  },
  customer: { marginTop: theme.space.sm },
  service: { marginTop: 4, color: theme.color.textSecondary },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.xs,
    marginTop: theme.space.sm,
  },
});
