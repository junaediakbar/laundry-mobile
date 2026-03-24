import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { IconUserCog } from '@tabler/icons-react-native';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { qk } from '@/lib/query-keys';
import { deleteUser, fetchUsers, updateUser } from '@/services/users.service';
import { ApiClientError } from '@/types/api';
import type { User } from '@/types/models';
import { theme, textVariants } from '@/theme';

export default function UsersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: qk.users,
    queryFn: fetchUsers,
    retry: false,
  });
  const refreshAll = () => void queryClient.invalidateQueries({ queryKey: qk.users });
  const toggleMutation = useMutation({
    mutationFn: (item: User) =>
      updateUser(item.id, {
        name: item.name ?? item.email,
        email: item.email,
        role: item.role,
        isActive: item.isActive !== false ? false : true,
      }),
    onSuccess: refreshAll,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: refreshAll,
  });

  return (
    <View style={styles.flex}>
      <AppHeader title="Pengguna" onBack={() => router.back()} />
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiClientError
              ? query.error.message
              : 'Gagal memuat pengguna'
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={query.data ?? []}
          keyExtractor={(u) => u.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={() => void query.refetch()}
              tintColor={theme.color.primary}
            />
          }
          renderItem={({ item }: { item: User }) => (
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <IconUserCog size={22} color={theme.color.primary} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name ?? item.email}</Text>
                <Text style={[textVariants.caption, styles.meta]}>
                  {item.email} · {item.role}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        item.isActive !== false ? theme.color.successMuted : theme.color.secondaryMuted,
                    },
                  ]}
                  onPress={() => toggleMutation.mutate(item)}>
                  <Text
                    style={[
                      textVariants.caption,
                      {
                        color:
                          item.isActive !== false ? theme.color.success : theme.color.textSecondary,
                      },
                    ]}>
                    {item.isActive !== false ? 'Aktif' : 'Nonaktif'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('Hapus pengguna', `Hapus ${item.email}?`, [
                      { text: 'Batal', style: 'cancel' },
                      { text: 'Hapus', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                    ])
                  }>
                  <Text style={styles.deleteText}>Hapus</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<EmptyState title="Tidak ada pengguna" icon="people-outline" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  list: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { alignItems: 'flex-end', gap: theme.space.xs },
  name: { fontSize: theme.font.md, fontWeight: theme.fontWeight.semibold, color: theme.color.text },
  meta: { marginTop: 4, color: theme.color.textSecondary },
  badge: { paddingHorizontal: theme.space.sm, paddingVertical: 4, borderRadius: theme.radius.full },
  deleteText: { fontSize: theme.font.xs, color: theme.color.error, fontWeight: theme.fontWeight.semibold },
});
