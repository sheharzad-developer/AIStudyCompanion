/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Design = {
  color: {
    canvas: '#F7F9FC',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF4FF',
    surfaceWarm: '#FFF7ED',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    text: '#0F172A',
    muted: '#64748B',
    subtle: '#94A3B8',
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    primarySoft: '#DBEAFE',
    success: '#0F9F6E',
    successSoft: '#DCFCE7',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    danger: '#E11D48',
    dangerSoft: '#FFE4E6',
  },
  radius: {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 34,
    pill: 999,
  },
  space: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  shadow: {
    color: '#0F172A',
    opacity: 0.08,
    radius: 22,
    offset: { width: 0, height: 12 },
    elevation: 3,
  },
} as const;

const tintColorLight = Design.color.primary;
const tintColorDark = Design.color.primary;

export const Colors = {
  light: {
    text: Design.color.text,
    background: Design.color.canvas,
    tint: tintColorLight,
    icon: Design.color.muted,
    tabIconDefault: Design.color.subtle,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: Design.color.text,
    background: Design.color.canvas,
    tint: tintColorDark,
    icon: Design.color.muted,
    tabIconDefault: Design.color.subtle,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
