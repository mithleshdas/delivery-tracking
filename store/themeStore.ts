import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/config';
import { storage } from '@/services/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
}

const ORDER: ThemePreference[] = ['system', 'light', 'dark'];

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await storage.getItem(STORAGE_KEYS.themePreference);
      if (raw === 'system' || raw === 'light' || raw === 'dark') {
        set({ preference: raw, hydrated: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ hydrated: true });
  },

  setPreference: (preference) => {
    set({ preference });
    void storage.setItem(STORAGE_KEYS.themePreference, preference);
  },

  cyclePreference: () => {
    const current = get().preference;
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    get().setPreference(next);
  },
}));
