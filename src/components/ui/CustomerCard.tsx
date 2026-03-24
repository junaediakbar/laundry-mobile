import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Customer } from '@/types/models';
import { cardShadow, theme, textVariants } from '@/theme';

type Props = {
  customer: Customer;
  onPress: () => void;
};

export function CustomerCard({ customer, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{customer.name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[textVariants.body, styles.name]} numberOfLines={1}>
          {customer.name}
        </Text>
        {customer.phone ? (
          <View style={styles.row}>
            <Ionicons name="call-outline" size={14} color={theme.color.textMuted} />
            <Text style={[textVariants.caption, styles.meta]}>{customer.phone}</Text>
          </View>
        ) : null}
        {customer.address ? (
          <Text style={[textVariants.caption, styles.address]} numberOfLines={2}>
            {customer.address}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.color.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...cardShadow(),
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.space.sm,
  },
  avatarText: {
    fontSize: theme.font.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.color.primaryDark,
  },
  body: { flex: 1, minWidth: 0 },
  name: { fontWeight: theme.fontWeight.semibold },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meta: { color: theme.color.textSecondary },
  address: { marginTop: 4, color: theme.color.textMuted },
});
