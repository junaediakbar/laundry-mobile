import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { IconUser } from '@tabler/icons-react-native';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { qk } from '@/lib/query-keys';
import { deleteEmployee, fetchEmployees, updateEmployee } from '@/services/employees.service';
import { ApiClientError } from '@/types/api';
import type { Employee } from '@/types/models';
import { theme, textVariants } from '@/theme';

export default function EmployeesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: qk.employees,
    queryFn: () => fetchEmployees(true),
  });
  const refreshAll = () => void queryClient.invalidateQueries({ queryKey: qk.employees });
  const toggleMutation = useMutation({
    mutationFn: (item: Employee) => updateEmployee(item.id, { name: item.name, isActive: !item.isActive }),
    onSuccess: refreshAll,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: refreshAll,
  });

  return (
    <View style={styles.flex}>
      <AppHeader title="Karyawan" onBack={() => router.back()} />
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiClientError
              ? query.error.message
              : 'Gagal memuat karyawan'
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={query.data ?? []}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={() => void query.refetch()}
              tintColor={theme.color.primary}
            />
          }
          renderItem={({ item }: { item: Employee }) => (
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <IconUser size={22} color={theme.color.primary} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Pressable onPress={() => toggleMutation.mutate(item)}>
                  <Text style={[textVariants.caption, styles.meta]}>{item.isActive ? 'Aktif' : 'Nonaktif'}</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() =>
                  Alert.alert('Hapus karyawan', `Hapus ${item.name}?`, [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Hapus', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                  ])
                }>
                <Text style={styles.deleteText}>Hapus</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<EmptyState title="Belum ada karyawan" icon="people-outline" />}
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
  name: { fontSize: theme.font.md, fontWeight: theme.fontWeight.semibold, color: theme.color.text },
  meta: { marginTop: 4, color: theme.color.textSecondary },
  deleteText: { fontSize: theme.font.xs, color: theme.color.error, fontWeight: theme.fontWeight.semibold },
});
