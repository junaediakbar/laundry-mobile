import { StyleSheet, Text, View } from 'react-native';

import { theme, textVariants } from '@/theme';
import { paymentColor, paymentLabel } from '@/utils/order-status';

type Props = {
  status: string;
};

export function PaymentBadge({ status }: Props) {
  const c = paymentColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: `${c}18`, borderColor: `${c}40` }]}>
      <Text style={[textVariants.caption, { color: c, fontWeight: theme.fontWeight.semibold }]}>
        {paymentLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.xxs + 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
});
