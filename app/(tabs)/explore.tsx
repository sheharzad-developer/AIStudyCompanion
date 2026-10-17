import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, ScreenScroll, appStyles } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const GUIDE_ACCENT = '#7C3AED';
const GUIDE_ACCENT_DARK = '#5B21B6';

type Feature = {
  title: string;
  body: string;
  /** Sent to the tutor when the tile is tapped. */
  prompt: string;
  icon: MaterialIconName;
  accent: string;
};

const features: readonly Feature[] = [
  {
    title: 'Simple explanations',
    prompt: 'Explain photosynthesis in simple words',
    body: 'Short answers with one practical example.',
    icon: 'lightbulb-outline',
    accent: Design.color.warning,
  },
  {
    title: 'Quiz practice',
    prompt: 'Quiz me on Newton laws',
    body: 'Generate three beginner-friendly MCQs.',
    icon: 'help-outline',
    accent: Design.color.primary,
  },
  {
    title: 'Study planning',
    prompt: 'Make a 20-minute study plan for fractions',
    body: 'Turn a topic into a focused sprint.',
    icon: 'event-note',
    accent: Design.color.success,
  },
  {
    title: 'Weather checks',
    prompt: 'What is the weather in Lahore?',
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

type StudyTip = {
  text: string;
  icon: MaterialIconName;
};

const studyTips: readonly StudyTip[] = [
  { text: 'Name the topic and your level, e.g. "grade 8" or "beginner".', icon: 'school' },
  { text: 'Ask a follow-up like "simpler please" or "give another example".', icon: 'forum' },
  { text: 'End each topic with a quiz to check what stuck.', icon: 'fact-check' },
];

function askTutor(prompt: string) {
  router.push({ pathname: '/', params: { prompt } });
}

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
            Tap any prompt or capability to send it straight to your tutor.
          </ThemedText>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>4</ThemedText>
              <ThemedText style={styles.heroStatLabel}>capabilities</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>{prompts.length}</ThemedText>
              <ThemedText style={styles.heroStatLabel}>prompts</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>{studyTips.length}</ThemedText>
              <ThemedText style={styles.heroStatLabel}>study tips</ThemedText>
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
            <Pressable
              key={feature.title}
              accessibilityRole="button"
              accessibilityHint={`Asks the tutor: ${feature.prompt}`}
              onPress={() => askTutor(feature.prompt)}
              style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
              <View style={[styles.tileIcon, { backgroundColor: `${feature.accent}18` }]}>
                <MaterialIcons name={feature.icon} size={22} color={feature.accent} />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.tileTitle}>
                {feature.title}
              </ThemedText>
              <ThemedText style={styles.tileBody}>{feature.body}</ThemedText>
            </Pressable>
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
              Tap one to ask the tutor — they steer it toward sharper answers.
            </ThemedText>
          </View>
        </View>

        <View style={styles.promptList}>
          {prompts.map((prompt) => (
            <Pressable
              key={prompt}
              accessibilityRole="button"
              onPress={() => askTutor(prompt)}
              style={({ pressed }) => [styles.promptRow, pressed && styles.pressed]}>
              <View style={styles.promptAccent} />
              <ThemedText style={styles.promptText}>{prompt}</ThemedText>
              <MaterialIcons name="send" size={16} color={GUIDE_ACCENT} style={styles.promptSend} />
            </Pressable>
          ))}
        </View>
      </AppCard>

      <AppCard muted style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={[styles.panelIcon, { backgroundColor: `${Design.color.success}18` }]}>
            <MaterialIcons name="tips-and-updates" size={18} color={Design.color.success} />
          </View>
          <View style={styles.panelHeaderText}>
            <ThemedText type="subtitle">Study tips</ThemedText>
            <ThemedText style={styles.sectionCaption}>
              Small habits that get you clearer answers and better recall.
            </ThemedText>
          </View>
        </View>

        <View style={styles.checkList}>
          {studyTips.map((tip, index) => (
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
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
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
  promptSend: {
    alignSelf: 'center',
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
