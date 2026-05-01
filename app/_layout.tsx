import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Design } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Design.color.canvas,
      border: Design.color.border,
      card: Design.color.surface,
      primary: Design.color.primary,
      text: Design.color.text,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: Design.color.canvas },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Design.color.canvas },
          headerTintColor: Design.color.text,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '800',
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="features" options={{ title: 'Features' }} />
        <Stack.Screen name="study-plan" options={{ title: 'Study Plan' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Study Session' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
