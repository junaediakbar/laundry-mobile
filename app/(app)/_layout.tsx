import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { theme } from '@/theme';

export default function AppGroupLayout() {
  const { token, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.color.bg },
      }}
    />
  );
}
