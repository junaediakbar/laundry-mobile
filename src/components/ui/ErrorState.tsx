import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme, textVariants } from '@/theme';

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="cloud-offline-outline" size={44} color={theme.color.error} />
      <Text style={[textVariants.title, styles.title]}>Terjadi kesalahan</Text>
      <Text style={[textVariants.bodyMuted, styles.msg]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.btnText}>Coba lagi</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.space.xxxl,
    paddingHorizontal: theme.space.xl,
  },
  title: { marginTop: theme.space.md, color: theme.color.text },
  msg: { marginTop: theme.space.sm, textAlign: 'center' },
  btn: {
    marginTop: theme.space.lg,
    backgroundColor: theme.color.primary,
    paddingHorizontal: theme.space.xl,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.md,
  },
  btnText: {
    color: theme.color.inverse,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.font.md,
  },
});
