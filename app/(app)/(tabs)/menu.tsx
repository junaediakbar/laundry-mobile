import { useRouter, type Href } from 'expo-router';
import {
  IconChevronRight,
  IconFileSpreadsheet,
  IconTags,
  IconTruck,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { theme, textVariants } from '@/theme';

type Tile = {
  title: string;
  subtitle: string;
  href: Href;
  Icon: typeof IconTags;
};

const tiles: Tile[] = [
  {
    title: 'Jenis layanan',
    subtitle: 'Lihat harga & satuan layanan',
    href: '/(app)/service-types' as Href,
    Icon: IconTags,
  },
  {
    title: 'Perencanaan pengiriman',
    subtitle: 'Rute & jadwal antar-jemput',
    href: '/(app)/delivery-planning' as Href,
    Icon: IconTruck,
  },
  {
    title: 'Karyawan',
    subtitle: 'Tim operasional',
    href: '/(app)/employees' as Href,
    Icon: IconUser,
  },
  {
    title: 'Laporan',
    subtitle: 'Ringkasan & export data',
    href: '/(app)/reports' as Href,
    Icon: IconFileSpreadsheet,
  },
  {
    title: 'Pengguna',
    subtitle: 'Admin & kasir (butuh hak akses)',
    href: '/(app)/users' as Href,
    Icon: IconUsersGroup,
  },
];

export default function MenuTabScreen() {
  const router = useRouter();

  return (
    <View style={styles.flex}>
      <AppHeader title="Menu" subtitle="Pintasan seperti di aplikasi web" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[textVariants.bodyMuted, styles.intro]}>
          Pilih modul untuk membuka daftar. Alur bisnis mengikuti panel web (Trees Laundry).
        </Text>
        {tiles.map((tile) => {
          const I = tile.Icon;
          return (
            <Pressable
              key={tile.title}
              accessibilityRole="button"
              onPress={() => router.push(tile.href)}
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}>
              <View style={styles.iconWrap}>
                <I size={26} color={theme.color.primary} strokeWidth={1.75} />
              </View>
              <View style={styles.tileBody}>
                <Text style={styles.tileTitle}>{tile.title}</Text>
                <Text style={styles.tileSub}>{tile.subtitle}</Text>
              </View>
              <IconChevronRight size={22} color={theme.color.textMuted} strokeWidth={1.5} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  intro: { marginBottom: theme.space.md },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    gap: theme.space.md,
  },
  tilePressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBody: { flex: 1, minWidth: 0 },
  tileTitle: {
    fontSize: theme.font.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.color.text,
  },
  tileSub: {
    marginTop: 4,
    fontSize: theme.font.sm,
    color: theme.color.textSecondary,
  },
});
