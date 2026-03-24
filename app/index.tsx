import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import { theme } from '@/theme';

export default function Index() {
  const { token, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.color.primary} />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(app)/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.bg,
  },
});
