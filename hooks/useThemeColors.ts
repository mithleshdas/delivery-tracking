import { useColorScheme } from '@/components/useColorScheme';
import { Palette, type ThemeColors } from '@/constants/theme';

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return Palette[scheme];
}
