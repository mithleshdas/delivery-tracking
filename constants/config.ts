import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolve the machine host Expo Go / Metro is already using.
 * Works for physical devices on the same Wi‑Fi / hotspot.
 */
function getDevHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    // Legacy manifests
    (Constants as { manifest?: { debuggerHost?: string } }).manifest
      ?.debuggerHost,
    (
      Constants as {
        manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
      }
    ).manifest2?.extra?.expoGo?.debuggerHost,
  ];

  for (const value of candidates) {
    if (!value) continue;
    const host = value.split(':')[0]?.trim();
    if (host) return host;
  }

  return null;
}

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const devHost = getDevHost();
  if (devHost && devHost !== '127.0.0.1') {
    // Physical device / LAN: same IP as Metro (e.g. 172.20.10.5)
    return `http://${devHost}:3001`;
  }

  // Emulator / simulator / web fallbacks
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://localhost:3001';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const STORAGE_KEYS = {
  listFilters: '@delivery_tracking/list_filters',
  deliveriesCache: '@delivery_tracking/deliveries_cache',
  metaCache: '@delivery_tracking/meta_cache',
  pendingMutations: '@delivery_tracking/pending_mutations',
  themePreference: '@delivery_tracking/theme_preference',
} as const;
