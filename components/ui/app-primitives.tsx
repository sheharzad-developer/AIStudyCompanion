import { PropsWithChildren } from 'react';
import {
  Pressable,
  PressableProps,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

export function ScreenScroll({
  children,
  contentContainerStyle,
  ...props
}: PropsWithChildren<ScrollViewProps>) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.screenContent,
        {
          paddingTop: Math.max(insets.top + Design.space.sm, Design.space.lg),
          paddingBottom: Math.max(insets.bottom + 96, 42),
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...props}>
      {children}
    </ScrollView>
  );
}

export function AppCard({
  children,
  style,
  muted = false,
  ...props
}: PropsWithChildren<ViewProps & { muted?: boolean }>) {
  return (
    <View style={[styles.card, muted && styles.mutedCard, style]} {...props}>
      {children}
    </View>
  );
}

export function HeroCard({
  kicker,
  title,
  body,
  accent = Design.color.primary,
  children,
}: PropsWithChildren<{
  kicker: string;
  title: string;
  body?: string;
  accent?: string;
}>) {
  return (
    <AppCard style={styles.hero}>
      <View style={[styles.kickerPill, { backgroundColor: `${accent}18` }]}>
        <ThemedText style={[styles.kicker, { color: accent }]}>{kicker}</ThemedText>
      </View>
      <ThemedText type="title" style={styles.heroTitle}>
        {title}
      </ThemedText>
      {body ? <ThemedText style={styles.heroBody}>{body}</ThemedText> : null}
      {children}
    </AppCard>
  );
}

export function AppButton({
  children,
  variant = 'primary',
  style,
  textStyle,
  ...props
}: PropsWithChildren<
  PressableProps & {
    variant?: 'primary' | 'secondary' | 'danger';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  }
>) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        pressed && styles.buttonPressed,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}>
      <ThemedText
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.secondaryButtonText,
          textStyle,
        ]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export const appStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutedText: {
    color: Design.color.muted,
  },
  sectionTitle: {
    color: Design.color.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Design.color.canvas,
  },
  screenContent: {
    gap: Design.space.lg,
    padding: Design.space.lg,
    paddingBottom: 42,
  },
  card: {
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    padding: Design.space.lg,
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity,
    shadowRadius: Design.shadow.radius,
    elevation: Design.shadow.elevation,
  },
  mutedCard: {
    backgroundColor: Design.color.surfaceMuted,
  },
  hero: {
    gap: Design.space.md,
    padding: Design.space.xl,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    borderRadius: Design.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: Design.color.text,
    fontSize: 34,
    letterSpacing: -1.2,
    lineHeight: 39,
  },
  heroBody: {
    color: Design.color.muted,
    lineHeight: 23,
  },
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.primary,
    paddingHorizontal: Design.space.lg,
  },
  secondaryButton: {
    backgroundColor: Design.color.primarySoft,
  },
  dangerButton: {
    backgroundColor: Design.color.danger,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  secondaryButtonText: {
    color: Design.color.primary,
  },
});
