import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme, textVariants } from '@/theme';

type Props = {
  label?: string;
};

export function LoadingState({ label = 'Memuat…' }: Props) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={theme.color.primary} />
      <Text style={[textVariants.bodyMuted, styles.label]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: theme.space.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginTop: theme.space.md },
});
