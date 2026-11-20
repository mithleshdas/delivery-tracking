/**
 * Natural palette — moss, stone, clay accents.
 * Soft and calm, not neon / purple / glossy.
 */
export const Palette = {
  light: {
    text: '#2B2926',
    textSecondary: '#6F6A63',
    background: '#F2F1EE',
    surface: '#FFFFFF',
    border: '#DDD9D2',
    tint: '#4F6F52',
    tintSoft: '#E4EDE5',
    danger: '#A14A3B',
    dangerSoft: '#F3E6E3',
    success: '#4F6F52',
    warning: '#9A6B2F',
    info: '#4A6670',
    muted: '#9A948B',
    inputBg: '#F7F6F3',
    overlay: 'rgba(43, 41, 38, 0.4)',
    hairline: '#E8E5DF',
  },
  dark: {
    text: '#F0EDE7',
    textSecondary: '#A8A29A',
    background: '#161513',
    surface: '#1F1E1B',
    border: '#332F2A',
    tint: '#8FAE8B',
    tintSoft: '#243028',
    danger: '#D9897A',
    dangerSoft: '#3A2420',
    success: '#8FAE8B',
    warning: '#D4A65A',
    info: '#8AA4AE',
    muted: '#7A746C',
    inputBg: '#191816',
    overlay: 'rgba(0, 0, 0, 0.55)',
    hairline: '#2A2723',
  },
} as const;

export type ThemeColors = (typeof Palette)['light'] | (typeof Palette)['dark'];

export const StatusColors: Record<
  string,
  { light: string; dark: string; softLight: string; softDark: string }
> = {
  Pending: {
    light: '#9A6B2F',
    dark: '#D4A65A',
    softLight: '#F3EBDD',
    softDark: '#3A2E18',
  },
  'In Transit': {
    light: '#4A6670',
    dark: '#8AA4AE',
    softLight: '#E4EBEE',
    softDark: '#1F2A2E',
  },
  Delivered: {
    light: '#4F6F52',
    dark: '#8FAE8B',
    softLight: '#E4EDE5',
    softDark: '#243028',
  },
  Cancelled: {
    light: '#A14A3B',
    dark: '#D9897A',
    softLight: '#F3E6E3',
    softDark: '#3A2420',
  },
};
