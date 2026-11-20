import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin AsyncStorage wrapper. Falls back to in-memory if the native
 * module is unavailable (mismatched Expo Go / web edge cases).
 */
const memory = new Map<string, string>();

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    memory.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Keep memory fallback only
    }
  },

  async removeItem(key: string): Promise<void> {
    memory.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};
