import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { API_BASE_URL } from '@/constants/config';
import { useAuth } from '@/hooks/use-auth';
import { theme, textVariants } from '@/theme';

function roleLabel(role: string) {
  switch (role) {
    case 'owner':
      return 'Pemilik';
    case 'admin':
      return 'Admin';
    case 'cashier':
      return 'Kasir';
    default:
      return role;
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const onLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => router.replace('/(auth)/login'));
        },
      },
    ]);
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Profil" subtitle="Akun & pengaturan" />
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={[textVariants.body, styles.value]}>{user?.email ?? '—'}</Text>
        <Text style={[styles.label, { marginTop: theme.space.md }]}>Peran</Text>
        <Text style={[textVariants.body, styles.value]}>
          {user?.role ? roleLabel(user.role) : '—'}
        </Text>
        <Text style={[styles.label, { marginTop: theme.space.md }]}>Server API</Text>
        <Text selectable style={[textVariants.caption, styles.mono]}>
          {API_BASE_URL}
        </Text>
        <Text style={[textVariants.caption, styles.hint]}>
          Ubah di app.json → extra.apiBaseUrl atau EXPO_PUBLIC_API_BASE_URL.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Keluar" variant="secondary" onPress={onLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  card: {
    margin: theme.space.md,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  label: { ...textVariants.caption, color: theme.color.textMuted, marginBottom: 4 },
  value: { fontWeight: theme.fontWeight.semibold },
  mono: { color: theme.color.textSecondary },
  hint: { marginTop: theme.space.xs, color: theme.color.textMuted },
  actions: { paddingHorizontal: theme.space.md },
});
