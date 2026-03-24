import Constants from 'expo-constants';

function readExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const v = extra?.[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/**
 * Base URL for the Go API (no trailing slash).
 * Override via app.json `extra.apiBaseUrl` or EXPO_PUBLIC_API_BASE_URL at build time.
 */
export const API_BASE_URL =
  readExtra('apiBaseUrl') ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://10.0.2.2:8080';
