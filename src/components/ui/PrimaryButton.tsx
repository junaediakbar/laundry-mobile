import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: Props) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && { opacity: 0.9 },
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.color.inverse : theme.color.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.textPrimary,
            variant === 'secondary' && styles.textSecondary,
            isGhost && styles.textGhost,
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space.lg,
  },
  primary: { backgroundColor: theme.color.primary },
  secondary: {
    backgroundColor: theme.color.secondaryMuted,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.55 },
  text: { fontSize: theme.font.md, fontWeight: theme.fontWeight.semibold },
  textPrimary: { color: theme.color.inverse },
  textSecondary: { color: theme.color.text },
  textGhost: { color: theme.color.primary },
});
