import { View, type ViewProps } from 'react-native';

import { Design } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor ?? Design.color.surface, dark: darkColor ?? Design.color.surface },
    'background',
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
