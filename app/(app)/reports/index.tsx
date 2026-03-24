import { useRouter } from 'expo-router';
import { IconFileSpreadsheet, IconInfoCircle } from '@tabler/icons-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { theme, textVariants } from '@/theme';

export default function ReportsScreen() {
  const router = useRouter();

  return (
    <View style={styles.flex}>
      <AppHeader title="Laporan" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.row}>
            <IconFileSpreadsheet size={28} color={theme.color.primary} strokeWidth={1.75} />
            <Text style={styles.cardTitle}>Export CSV</Text>
          </View>
          <Text style={[textVariants.bodyMuted, styles.p]}>
            Di aplikasi web, laporan dapat diunduh dari menu Laporan (CSV). Endpoint backend:{' '}
            <Text style={{ fontFamily: 'monospace' }}>GET /api/v1/reports/orders.csv</Text>
          </Text>
        </View>
        <View style={styles.hint}>
          <IconInfoCircle size={20} color={theme.color.info} strokeWidth={1.75} />
          <Text style={[textVariants.caption, styles.hintText]}>
            Untuk filter tanggal & unduh file lengkap, gunakan dashboard web di desktop atau browser
            di tablet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm, marginBottom: theme.space.sm },
  cardTitle: { fontSize: theme.font.lg, fontWeight: theme.fontWeight.bold, color: theme.color.text },
  p: { lineHeight: 22 },
  hint: {
    flexDirection: 'row',
    gap: theme.space.sm,
    marginTop: theme.space.lg,
    padding: theme.space.md,
    backgroundColor: theme.color.infoMuted,
    borderRadius: theme.radius.md,
  },
  hintText: { flex: 1, color: theme.color.textSecondary },
});
