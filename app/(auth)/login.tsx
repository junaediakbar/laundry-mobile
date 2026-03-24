import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/use-auth';
import { loginRequest } from '@/services/auth.service';
import { ApiClientError } from '@/types/api';
import { theme, textVariants } from '@/theme';
import { loginSchema } from '@/validation/schemas';
import { z } from 'zod';

type FormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { token, isReady, signIn } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (!isReady) {
    return (
      <View style={[styles.flex, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.color.primary} />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const result = await loginRequest(values.email, values.password);
      await signIn(result);
      router.replace('/(app)/(tabs)');
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Login gagal';
      setApiError(msg);
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <Text style={styles.emoji}>🫧</Text>
          <Text style={textVariants.hero}>Laundry Ops</Text>
          <Text style={[textVariants.bodyMuted, styles.tagline]}>
            Operasional harian yang ringan dan cepat.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[textVariants.title, styles.cardTitle]}>Masuk</Text>
          {apiError ? <Text style={styles.apiErr}>{apiError}</Text> : null}

          <FormField label="Email" error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="nama@email.com"
                  placeholderTextColor={theme.color.textMuted}
                  style={styles.input}
                />
              )}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={theme.color.textMuted}
                  style={styles.input}
                />
              )}
            />
          </FormField>

          <PrimaryButton
            title="Masuk"
            onPress={() => void onSubmit()}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.xxxl,
    paddingBottom: theme.space.xl,
  },
  brand: { marginBottom: theme.space.xl },
  emoji: { fontSize: 40, marginBottom: theme.space.sm },
  tagline: { marginTop: theme.space.sm, maxWidth: 320 },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.xl,
    padding: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  cardTitle: { marginBottom: theme.space.md },
  apiErr: {
    color: theme.color.error,
    marginBottom: theme.space.md,
    fontSize: theme.font.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: theme.font.md,
    color: theme.color.text,
    backgroundColor: theme.color.bg,
  },
});
