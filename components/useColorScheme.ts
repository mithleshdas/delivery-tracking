import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useThemeStore } from '@/store/themeStore';

export const useColorScheme = () => {
  const system = useSystemColorScheme();
  const preference = useThemeStore((state) => state.preference);

  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return system === 'dark' ? 'dark' : 'light';
};
