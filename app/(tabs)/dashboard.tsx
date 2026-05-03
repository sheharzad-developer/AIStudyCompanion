import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, ScreenScroll, appStyles } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

type QuickAction = {
  title: string;
  subtitle: string;
  href: React.ComponentProps<typeof Link>['href'];
  accent: string;
  icon: MaterialIconName;
};

const quickActions: readonly QuickAction[] = [
  {
    title: 'Tutor Chat',
    subtitle: 'Ask questions and get clear answers with examples.',
    href: '/(tabs)',
    accent: Design.color.primary,
    icon: 'school',
  },
  {
    title: 'Study Guide',
    subtitle: 'Use proven prompts, study flows, and setup tips.',
    href: '/(tabs)/explore',
    accent: '#7C3AED',
    icon: 'menu-book',
  },
  {
    title: 'Profile',
    subtitle: 'Manage sign-in, account state, and study identity.',
    href: '/(tabs)/profile',
    accent: Design.color.success,
    icon: 'person',
  },
  {
    title: 'Study Plan',
    subtitle: 'Open a focused 30-minute revision sprint.',
    href: '/study-plan',
    accent: Design.color.danger,
    icon: 'schedule',
  },
  {
    title: 'Features',
    subtitle: 'See tutor, quiz, planner, and weather capabilities.',
    href: '/features',
    accent: Design.color.warning,
    icon: 'auto-awesome',
  },
  {
    title: 'About App',
    subtitle: 'Learn how the companion supports students.',
    href: '/about',
    accent: '#0EA5E9',
    icon: 'info-outline',
  },
] as const;

type StudyMode = {
  label: string;
  icon: MaterialIconName;
  accent: string;
};

const studyModes: readonly StudyMode[] = [
  { label: 'Explain', icon: 'lightbulb-outline', accent: Design.color.warning },
  { label: 'Quiz', icon: 'help-outline', accent: Design.color.primary },
  { label: 'Plan', icon: 'event-note', accent: Design.color.success },
  { label: 'Weather', icon: 'wb-sunny', accent: '#0EA5E9' },
];

export default function DashboardScreen() {
  return (
    <ScreenScroll>
      <View style={styles.heroShell}>
        <LinearGradient
          colors={[Design.color.primary, Design.color.primaryPressed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroEyebrowRow}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="auto-awesome" size={14} color="#FFFFFF" />
              <ThemedText style={styles.heroBadgeText}>AI Study Companion</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.heroTitle}>Ready to study?</ThemedText>
          <ThemedText style={styles.heroBody}>
            Move from question to explanation, practice, and revision without losing focus.
          </ThemedText>

          <Link href="/(tabs)" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start tutor session"
              style={({ pressed }) => [styles.heroCta, pressed && styles.pressed]}>
              <ThemedText style={styles.heroCtaText}>Start tutor session</ThemedText>
              <MaterialIcons name="arrow-forward" size={18} color={Design.color.primary} />
            </Pressable>
          </Link>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>4</ThemedText>
              <ThemedText style={styles.heroStatLabel}>study modes</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>30m</ThemedText>
              <ThemedText style={styles.heroStatLabel}>sprint ready</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>3×</ThemedText>
              <ThemedText style={styles.heroStatLabel}>quiz MCQs</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>Quick actions</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            Jump straight into the part of the app you need.
          </ThemedText>
        </View>

        <View style={styles.tileGrid}>
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${action.title}`}
                style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
                <View style={[styles.tileIcon, { backgroundColor: `${action.accent}18` }]}>
                  <MaterialIcons name={action.icon} size={22} color={action.accent} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.tileTitle}>
                  {action.title}
                </ThemedText>
                <ThemedText style={styles.tileSubtitle} numberOfLines={2}>
                  {action.subtitle}
                </ThemedText>
                <View style={styles.tileFooter}>
                  <ThemedText style={[styles.tileCta, { color: action.accent }]}>Open</ThemedText>
                  <MaterialIcons name="arrow-forward" size={14} color={action.accent} />
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      <AppCard muted style={styles.modesCard}>
        <View>
          <ThemedText type="subtitle">Today&apos;s study modes</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            Switch modes anytime to match how you want to learn.
          </ThemedText>
        </View>
        <View style={styles.modeGrid}>
          {studyModes.map((mode) => (
            <View key={mode.label} style={styles.modeChip}>
              <View style={[styles.modeIcon, { backgroundColor: `${mode.accent}18` }]}>
                <MaterialIcons name={mode.icon} size={18} color={mode.accent} />
              </View>
              <ThemedText style={styles.modeText}>{mode.label}</ThemedText>
            </View>
          ))}
        </View>
      </AppCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  heroShell: {
    borderRadius: Design.radius.xl,
    overflow: 'hidden',
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity,
    shadowRadius: Design.shadow.radius,
    elevation: Design.shadow.elevation,
  },
  hero: {
    padding: Design.space.xl,
    gap: Design.space.md,
  },
  heroEyebrowRow: {
    flexDirection: 'row',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Design.radius.pill,
    paddingHorizontal: Design.space.sm + 2,
    paddingVertical: Design.space.xs,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 38,
    marginTop: Design.space.xs,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 22,
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs + 2,
    backgroundColor: '#FFFFFF',
    borderRadius: Design.radius.pill,
    paddingHorizontal: Design.space.lg,
    paddingVertical: Design.space.sm + 2,
    marginTop: Design.space.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  heroCtaText: {
    color: Design.color.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Design.radius.lg,
    paddingVertical: Design.space.md,
    paddingHorizontal: Design.space.md,
    marginTop: Design.space.sm,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  section: {
    gap: Design.space.md,
  },
  sectionHeading: {
    gap: Design.space.xs / 2,
  },
  sectionCaption: {
    color: Design.color.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Design.space.md,
  },
  tile: {
    width: '48.5%',
    minHeight: 168,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Design.color.border,
    backgroundColor: Design.color.surface,
    padding: Design.space.md,
    gap: Design.space.xs,
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity / 1.5,
    shadowRadius: Design.shadow.radius,
    elevation: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Design.space.xs,
  },
  tileTitle: {
    color: Design.color.text,
    fontSize: 16,
    lineHeight: 21,
  },
  tileSubtitle: {
    color: Design.color.muted,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs / 2,
    marginTop: Design.space.xs,
  },
  tileCta: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  modesCard: {
    gap: Design.space.md,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs + 2,
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    paddingLeft: Design.space.xs,
    paddingRight: Design.space.md,
    paddingVertical: Design.space.xs,
  },
  modeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    color: Design.color.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
