import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { theme, textVariants } from '@/theme';

type Props = {
  label: string;
  error?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FormField({ label, error, children, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={[textVariants.label, styles.label]}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.space.md },
  label: { marginBottom: theme.space.xs },
  error: {
    marginTop: theme.space.xs,
    fontSize: theme.font.xs,
    color: theme.color.error,
  },
});
