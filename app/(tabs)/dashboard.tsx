import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, HeroCard, ScreenScroll, appStyles } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

const quickActions = [
  {
    title: 'Tutor Chat',
    subtitle: 'Ask questions and get clear answers with examples.',
    href: '/(tabs)',
    accent: Design.color.primary,
  },
  {
    title: 'Study Guide',
    subtitle: 'Use proven prompts, study flows, and setup tips.',
    href: '/(tabs)/explore',
    accent: '#7C3AED',
  },
  {
    title: 'Profile',
    subtitle: 'Manage sign-in, account state, and study identity.',
    href: '/(tabs)/profile',
    accent: Design.color.success,
  },
  {
    title: 'Study Plan',
    subtitle: 'Open a focused 30-minute revision sprint.',
    href: '/study-plan',
    accent: Design.color.danger,
  },
  {
    title: 'Features',
    subtitle: 'See tutor, quiz, planner, and weather capabilities.',
    href: '/features',
    accent: Design.color.warning,
  },
  {
    title: 'About App',
    subtitle: 'Learn how the companion supports students.',
    href: '/about',
    accent: '#0EA5E9',
  },
] as const;

const studyModes = ['Explain', 'Quiz', 'Plan', 'Weather'];

export default function DashboardScreen() {
  return (
    <ScreenScroll>
      <HeroCard
        kicker="AI Study Companion"
        title="A modern study dashboard for faster learning."
        body="Move from question to explanation, practice, and revision without losing focus.">
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <ThemedText style={styles.heroStatValue}>4</ThemedText>
            <ThemedText style={styles.heroStatLabel}>study modes</ThemedText>
          </View>
          <View style={styles.heroStat}>
            <ThemedText style={styles.heroStatValue}>30m</ThemedText>
            <ThemedText style={styles.heroStatLabel}>sprint ready</ThemedText>
          </View>
        </View>
      </HeroCard>

      <View style={styles.metricsRow}>
        <AppCard style={styles.metricCard}>
          <ThemedText style={styles.metricValue}>120s</ThemedText>
          <ThemedText style={styles.metricLabel}>short answers</ThemedText>
        </AppCard>
        <AppCard style={styles.metricCard}>
          <ThemedText style={styles.metricValue}>3x</ThemedText>
          <ThemedText style={styles.metricLabel}>quiz MCQs</ThemedText>
        </AppCard>
      </View>

      <ThemedText style={appStyles.sectionTitle}>Main navigation</ThemedText>
      <View style={styles.actionGrid}>
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${action.title}`}
              style={({ pressed }) => [
                styles.actionCard,
                { borderLeftColor: action.accent },
                pressed && styles.pressed,
              ]}>
              <View style={[styles.actionIcon, { backgroundColor: `${action.accent}18` }]}>
                <ThemedText style={[styles.actionIconText, { color: action.accent }]}>
                  {action.title[0]}
                </ThemedText>
              </View>
              <View style={styles.actionBody}>
                <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                  {action.title}
                </ThemedText>
                <ThemedText style={styles.actionSubtitle}>{action.subtitle}</ThemedText>
              </View>
              <ThemedText style={[styles.actionCta, { color: action.accent }]}>Open</ThemedText>
            </Pressable>
          </Link>
        ))}
      </View>

      <AppCard muted style={styles.modePanel}>
        <ThemedText type="subtitle">Today&apos;s study modes</ThemedText>
        <View style={styles.modeGrid}>
          {studyModes.map((mode) => (
            <View key={mode} style={styles.modePill}>
              <ThemedText style={styles.modeText}>{mode}</ThemedText>
            </View>
          ))}
        </View>
      </AppCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  heroStats: {
    flexDirection: 'row',
    gap: Design.space.sm,
    marginTop: Design.space.sm,
  },
  heroStat: {
    flex: 1,
    borderRadius: Design.radius.md,
    backgroundColor: Design.color.surfaceMuted,
    padding: Design.space.md,
  },
  heroStatValue: {
    color: Design.color.text,
    fontSize: 24,
    fontWeight: '900',
  },
  heroStatLabel: {
    color: Design.color.muted,
    fontSize: 12,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Design.space.md,
  },
  metricCard: {
    flex: 1,
    padding: Design.space.md,
  },
  metricValue: {
    color: Design.color.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  metricLabel: {
    color: Design.color.muted,
    marginTop: 4,
  },
  actionGrid: {
    gap: Design.space.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
    borderLeftWidth: 4,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Design.color.border,
    backgroundColor: Design.color.surface,
    padding: Design.space.md,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    fontSize: 18,
    fontWeight: '900',
  },
  actionBody: {
    flex: 1,
  },
  actionTitle: {
    color: Design.color.text,
    fontSize: 17,
  },
  actionSubtitle: {
    color: Design.color.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  actionCta: {
    fontSize: 12,
    fontWeight: '900',
  },
  modePanel: {
    gap: Design.space.md,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
  },
  modePill: {
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modeText: {
    color: Design.color.primary,
    fontWeight: '800',
  },
});
