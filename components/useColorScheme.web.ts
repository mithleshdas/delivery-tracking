import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemeStore } from '@/store/themeStore';

/**
 * Web: support system preference + manual override.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const system = useRNColorScheme();
  const preference = useThemeStore((state) => state.preference);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return 'light';
  }

  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return system === 'dark' ? 'dark' : 'light';
}
