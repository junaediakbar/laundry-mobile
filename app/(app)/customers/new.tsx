import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { qk } from '@/lib/query-keys';
import { createCustomer } from '@/services/customers.service';
import { ApiClientError } from '@/types/api';
import { theme, textVariants } from '@/theme';

export default function NewCustomerScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      createCustomer({
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
      }),
    onSuccess: (c) => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.replace(`/(app)/customers/${c.id}`);
    },
    onError: (e) => {
      const msg =
        e instanceof ApiClientError ? e.message : 'Gagal menyimpan pelanggan';
      Alert.alert('Gagal', msg);
    },
  });

  const onSubmit = () => {
    const n = name.trim();
    if (!n) {
      Alert.alert('Periksa input', 'Nama wajib diisi.');
      return;
    }
    mutation.mutate();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="Tambah pelanggan" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nama *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nama pelanggan"
          placeholderTextColor={theme.color.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Telepon</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Opsional"
          keyboardType="phone-pad"
          placeholderTextColor={theme.color.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Opsional"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={theme.color.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Alamat</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Opsional"
          placeholderTextColor={theme.color.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Catatan</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Opsional"
          multiline
          placeholderTextColor={theme.color.textMuted}
          style={[styles.input, styles.multiline]}
        />
        <PrimaryButton
          title={mutation.isPending ? 'Menyimpan…' : 'Simpan'}
          onPress={onSubmit}
          loading={mutation.isPending}
        />
        <Text style={[textVariants.caption, styles.hint]}>
          Setelah disimpan Anda akan diarahkan ke detail pelanggan.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  label: { ...textVariants.label, marginBottom: theme.space.xs, marginTop: theme.space.sm },
  input: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    fontSize: theme.font.md,
    color: theme.color.text,
    backgroundColor: theme.color.surface,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  hint: { marginTop: theme.space.md, color: theme.color.textMuted },
});
