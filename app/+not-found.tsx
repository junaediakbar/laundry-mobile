import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { theme, textVariants } from '@/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tidak ditemukan' }} />
      <View style={styles.container}>
        <Text style={[textVariants.title, styles.title]}>Halaman tidak ada</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Kembali ke awal</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space.lg,
    backgroundColor: theme.color.bg,
  },
  title: { marginBottom: theme.space.md },
  link: { paddingVertical: theme.space.md },
  linkText: { fontSize: theme.font.md, color: theme.color.primary, fontWeight: theme.fontWeight.semibold },
});
