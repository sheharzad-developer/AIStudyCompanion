import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppCard, ScreenScroll, appStyles } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const GUIDE_ACCENT = '#7C3AED';
const GUIDE_ACCENT_DARK = '#5B21B6';

type Feature = {
  title: string;
  body: string;
  icon: MaterialIconName;
  accent: string;
};

const features: readonly Feature[] = [
  {
    title: 'Simple explanations',
    body: 'Short answers with one practical example.',
    icon: 'lightbulb-outline',
    accent: Design.color.warning,
  },
  {
    title: 'Quiz practice',
    body: 'Generate three beginner-friendly MCQs.',
    icon: 'help-outline',
    accent: Design.color.primary,
  },
  {
    title: 'Study planning',
    body: 'Turn a topic into a focused sprint.',
    icon: 'event-note',
    accent: Design.color.success,
  },
  {
    title: 'Weather checks',
    body: 'Plan around travel and class conditions.',
    icon: 'wb-sunny',
    accent: '#0EA5E9',
  },
];

const prompts = [
  'Explain cell division like I am in grade 8, then ask me one check question.',
  'Make a 30-minute revision plan for algebra with breaks.',
  'Create a quiz about World War II causes.',
];

type SetupTip = {
  text: string;
  icon: MaterialIconName;
};

const setupTips: readonly SetupTip[] = [
  { text: 'Start the backend from ai-study-backend.', icon: 'terminal' },
  { text: 'Use EXPO_PUBLIC_API_BASE_URL for physical phones.', icon: 'tune' },
  { text: 'Keep GEMINI_API_KEY only in the backend .env file.', icon: 'lock-outline' },
];

export default function StudyGuideScreen() {
  return (
    <ScreenScroll>
      <View style={styles.heroShell}>
        <LinearGradient
          colors={[GUIDE_ACCENT, GUIDE_ACCENT_DARK]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroBadge}>
            <MaterialIcons name="auto-stories" size={14} color="#FFFFFF" />
            <ThemedText style={styles.heroBadgeText}>Study Guide</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>Use better prompts.{'\n'}Get better answers.</ThemedText>
          <ThemedText style={styles.heroBody}>
            A clean guide for asking focused questions, turning answers into practice, and keeping
            setup healthy.
          </ThemedText>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>4</ThemedText>
              <ThemedText style={styles.heroStatLabel}>capabilities</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>{prompts.length}</ThemedText>
              <ThemedText style={styles.heroStatLabel}>ready prompts</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>{setupTips.length}</ThemedText>
              <ThemedText style={styles.heroStatLabel}>setup steps</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>What the companion does</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            Four focused capabilities, each tuned for short, beginner-friendly study.
          </ThemedText>
        </View>

        <View style={styles.tileGrid}>
          {features.map((feature) => (
            <View key={feature.title} style={styles.tile}>
              <View style={[styles.tileIcon, { backgroundColor: `${feature.accent}18` }]}>
                <MaterialIcons name={feature.icon} size={22} color={feature.accent} />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.tileTitle}>
                {feature.title}
              </ThemedText>
              <ThemedText style={styles.tileBody}>{feature.body}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <AppCard style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={[styles.panelIcon, { backgroundColor: `${GUIDE_ACCENT}18` }]}>
            <MaterialIcons name="format-quote" size={18} color={GUIDE_ACCENT} />
          </View>
          <View style={styles.panelHeaderText}>
            <ThemedText type="subtitle">Best prompts</ThemedText>
            <ThemedText style={styles.sectionCaption}>
              Copy these openings — they steer the tutor toward sharper answers.
            </ThemedText>
          </View>
        </View>

        <View style={styles.promptList}>
          {prompts.map((prompt) => (
            <View key={prompt} style={styles.promptRow}>
              <View style={styles.promptAccent} />
              <ThemedText style={styles.promptText}>{prompt}</ThemedText>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard muted style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={[styles.panelIcon, { backgroundColor: `${Design.color.success}18` }]}>
            <MaterialIcons name="check-circle-outline" size={18} color={Design.color.success} />
          </View>
          <View style={styles.panelHeaderText}>
            <ThemedText type="subtitle">Setup checklist</ThemedText>
            <ThemedText style={styles.sectionCaption}>
              Quick checks to keep the development environment healthy.
            </ThemedText>
          </View>
        </View>

        <View style={styles.checkList}>
          {setupTips.map((tip, index) => (
            <View key={tip.text} style={styles.checkRow}>
              <View style={styles.checkIconWrap}>
                <View style={styles.checkIcon}>
                  <MaterialIcons name={tip.icon} size={16} color={Design.color.primary} />
                </View>
                <View style={styles.checkBadge}>
                  <ThemedText style={styles.checkBadgeText}>{index + 1}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.checkText}>{tip.text}</ThemedText>
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
  heroBadge: {
    alignSelf: 'flex-start',
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
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.9,
    lineHeight: 36,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 22,
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
    minHeight: 148,
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
    fontSize: 15,
    lineHeight: 20,
  },
  tileBody: {
    color: Design.color.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  panel: {
    gap: Design.space.md,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Design.space.md,
  },
  panelIcon: {
    width: 38,
    height: 38,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHeaderText: {
    flex: 1,
    gap: Design.space.xs / 2,
  },
  promptList: {
    gap: Design.space.sm,
  },
  promptRow: {
    flexDirection: 'row',
    gap: Design.space.md,
    alignItems: 'stretch',
    borderRadius: Design.radius.md,
    backgroundColor: Design.color.surfaceMuted,
    padding: Design.space.md,
  },
  promptAccent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: GUIDE_ACCENT,
  },
  promptText: {
    flex: 1,
    color: Design.color.text,
    fontSize: 14,
    lineHeight: 21,
  },
  checkList: {
    gap: Design.space.sm,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
  },
  checkIconWrap: {
    width: 38,
    height: 38,
  },
  checkIcon: {
    width: 38,
    height: 38,
    borderRadius: Design.radius.md,
    backgroundColor: Design.color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Design.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Design.color.surfaceMuted,
  },
  checkBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  checkText: {
    flex: 1,
    color: Design.color.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
