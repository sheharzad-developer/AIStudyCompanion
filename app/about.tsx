import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppCard, ScreenScroll, appStyles } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const HERO_START = '#0F766E';
const HERO_END = '#2563EB';
const REPO_URL = 'https://github.com/sheharzad-developer/AIStudyCompanion';
const GITHUB_PROFILE_URL = 'https://github.com/sheharzad-developer';

type ComparisonMode = 'textbook' | 'companion';

const TEXTBOOK_SAMPLE =
  'Photosynthesis is the process by which autotrophic organisms convert electromagnetic radiation into chemical energy, synthesising carbohydrates from carbon dioxide and water via chlorophyll-mediated light-dependent and light-independent reactions in the thylakoid membranes and stroma of chloroplasts.';

const COMPANION_SAMPLE = {
  points: [
    'Plants make their own food using sunlight.',
    'Leaves catch light with a green pigment called chlorophyll.',
    'They mix water and air (CO₂) to make sugar, and give out oxygen.',
  ],
  example: 'A leaf is like a tiny kitchen: sunlight is the stove, sugar is the meal.',
  urdu: 'Urdu: Paudey dhoop se apna khana khud banatay hain.',
};

type Principle = {
  title: string;
  body: string;
  icon: MaterialIconName;
  accent: string;
  soft: string;
};

const PRINCIPLES: readonly Principle[] = [
  {
    title: 'Simple first',
    body: 'Short bullet points in plain English. No jargon unless it is explained.',
    icon: 'auto-fix-high',
    accent: Design.color.primary,
    soft: Design.color.primarySoft,
  },
  {
    title: 'One real example',
    body: 'Every explanation ends with a single example from everyday life.',
    icon: 'emoji-objects',
    accent: Design.color.warning,
    soft: Design.color.warningSoft,
  },
  {
    title: 'Practice right away',
    body: 'Turn any answer into a three-question quiz while it is still fresh.',
    icon: 'fact-check',
    accent: Design.color.success,
    soft: Design.color.successSoft,
  },
  {
    title: 'Urdu when it helps',
    body: 'A little Urdu where it makes an idea click, or a full translation on request.',
    icon: 'translate',
    accent: '#7C3AED',
    soft: '#EDE9FE',
  },
];

const AUDIENCES: readonly { label: string; icon: MaterialIconName }[] = [
  { label: 'School students', icon: 'school' },
  { label: 'Exam revision', icon: 'menu-book' },
  { label: 'Self-learners', icon: 'self-improvement' },
  { label: 'English learners', icon: 'record-voice-over' },
];

const PRIVACY_POINTS: readonly { title: string; body: string; icon: MaterialIconName }[] = [
  {
    title: 'Keys stay on the server',
    body: 'The AI key lives only in the backend. The app never sees it.',
    icon: 'vpn-key',
  },
  {
    title: 'Your profile stays on your device',
    body: 'Sign-in details and settings are saved locally, and Sign Out removes them.',
    icon: 'smartphone',
  },
  {
    title: 'You control the context',
    body: 'Turn off "Remember conversation" or clear your chat any time in Profile → Privacy.',
    icon: 'toggle-on',
  },
];

const ROADMAP: readonly { title: string; body: string; icon: MaterialIconName }[] = [
  {
    title: 'Study reminders',
    body: 'Daily revision nudges and quiz reminders as push notifications.',
    icon: 'notifications-active',
  },
  {
    title: 'Progress tracking',
    body: 'See topics covered and quiz scores over time.',
    icon: 'insights',
  },
  {
    title: 'Voice questions',
    body: 'Ask out loud and hear the answer, in English or Urdu.',
    icon: 'mic',
  },
];

export default function AboutScreen() {
  const [mode, setMode] = useState<ComparisonMode>('companion');
  const [fade] = useState(() => new Animated.Value(1));

  const switchMode = (next: ComparisonMode) => {
    if (next === mode) return;
    fade.setValue(0);
    setMode(next);
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenScroll>
      <View style={styles.shadowShell}>
        <LinearGradient
          colors={[HERO_START, HERO_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroBadge}>
            <MaterialIcons name="favorite-border" size={14} color="#FFFFFF" />
            <ThemedText style={styles.heroBadgeText}>About</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>
            Built for students who need clarity fast.
          </ThemedText>
          <ThemedText style={styles.heroBody}>
            Textbooks are written for experts. AI Study Companion rewrites big ideas in simple
            words, then helps you practise until they stick.
          </ThemedText>

          <View style={styles.missionCard}>
            <MaterialIcons name="format-quote" size={22} color="rgba(255,255,255,0.7)" />
            <ThemedText style={styles.missionText}>
              Our mission: make every student feel like they have a patient teacher in their
              pocket.
            </ThemedText>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>Why it exists</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            The same idea, two ways. Switch to see the difference.
          </ThemedText>
        </View>

        <AppCard style={styles.compareCard}>
          <View style={styles.segment} accessibilityRole="tablist">
            {(['textbook', 'companion'] as const).map((option) => {
              const isActive = mode === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => switchMode(option)}
                  style={[styles.segmentOption, isActive && styles.segmentOptionActive]}>
                  <MaterialIcons
                    name={option === 'textbook' ? 'menu-book' : 'auto-awesome'}
                    size={16}
                    color={isActive ? Design.color.text : Design.color.muted}
                  />
                  <ThemedText
                    style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {option === 'textbook' ? 'Textbook' : 'Study Companion'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText style={styles.compareTopic}>Topic: Photosynthesis</ThemedText>

          <Animated.View
            style={{
              opacity: fade,
              transform: [
                { translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
              ],
            }}>
            {mode === 'textbook' ? (
              <View style={[styles.sample, styles.sampleTextbook]}>
                <ThemedText style={styles.textbookText}>{TEXTBOOK_SAMPLE}</ThemedText>
                <View style={styles.verdictRow}>
                  <MaterialIcons name="sentiment-dissatisfied" size={16} color={Design.color.danger} />
                  <ThemedText style={[styles.verdictText, { color: Design.color.danger }]}>
                    One 35-word sentence packed with jargon
                  </ThemedText>
                </View>
              </View>
            ) : (
              <View style={[styles.sample, styles.sampleCompanion]}>
                {COMPANION_SAMPLE.points.map((point) => (
                  <View key={point} style={styles.pointRow}>
                    <View style={styles.pointDot} />
                    <ThemedText style={styles.companionText}>{point}</ThemedText>
                  </View>
                ))}
                <View style={styles.exampleBox}>
                  <ThemedText style={styles.exampleLabel}>Example</ThemedText>
                  <ThemedText style={styles.companionText}>{COMPANION_SAMPLE.example}</ThemedText>
                </View>
                <ThemedText style={styles.urduText}>{COMPANION_SAMPLE.urdu}</ThemedText>
                <View style={styles.verdictRow}>
                  <MaterialIcons name="sentiment-satisfied-alt" size={16} color={Design.color.success} />
                  <ThemedText style={[styles.verdictText, { color: Design.color.success }]}>
                    Short points, one example, ready to quiz
                  </ThemedText>
                </View>
              </View>
            )}
          </Animated.View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>How it teaches</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            Four principles behind every answer.
          </ThemedText>
        </View>
        <View style={styles.tileGrid}>
          {PRINCIPLES.map((principle, index) => (
            <View key={principle.title} style={styles.tile}>
              <View style={styles.tileTop}>
                <View style={[styles.tileIcon, { backgroundColor: principle.soft }]}>
                  <MaterialIcons name={principle.icon} size={20} color={principle.accent} />
                </View>
                <ThemedText style={[styles.tileIndex, { color: principle.accent }]}>
                  0{index + 1}
                </ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" style={styles.tileTitle}>
                {principle.title}
              </ThemedText>
              <ThemedText style={styles.tileBody}>{principle.body}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>Made for</ThemedText>
        </View>
        <View style={styles.audienceWrap}>
          {AUDIENCES.map((audience) => (
            <View key={audience.label} style={styles.audienceChip}>
              <MaterialIcons name={audience.icon} size={16} color={HERO_START} />
              <ThemedText style={styles.audienceText}>{audience.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <AppCard muted style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={[styles.panelIcon, { backgroundColor: Design.color.successSoft }]}>
            <MaterialIcons name="verified-user" size={20} color={Design.color.success} />
          </View>
          <View style={styles.panelHeaderText}>
            <ThemedText type="subtitle">Private by design</ThemedText>
            <ThemedText style={styles.sectionCaption}>What happens to your data.</ThemedText>
          </View>
        </View>
        {PRIVACY_POINTS.map((point) => (
          <View key={point.title} style={styles.listRow}>
            <MaterialIcons name={point.icon} size={18} color={Design.color.success} />
            <View style={styles.listBody}>
              <ThemedText type="defaultSemiBold" style={styles.listTitle}>
                {point.title}
              </ThemedText>
              <ThemedText style={styles.listText}>{point.body}</ThemedText>
            </View>
          </View>
        ))}
      </AppCard>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>What’s next</ThemedText>
          <ThemedText style={styles.sectionCaption}>On the roadmap for upcoming releases.</ThemedText>
        </View>
        <AppCard style={styles.roadmapCard}>
          {ROADMAP.map((item, index) => (
            <View
              key={item.title}
              style={[styles.roadmapRow, index > 0 && styles.roadmapDivider]}>
              <View style={styles.roadmapIcon}>
                <MaterialIcons name={item.icon} size={18} color={HERO_END} />
              </View>
              <View style={styles.listBody}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.listText}>{item.body}</ThemedText>
              </View>
              <View style={styles.plannedPill}>
                <ThemedText style={styles.plannedText}>Planned</ThemedText>
              </View>
            </View>
          ))}
        </AppCard>
      </View>

      <AppCard style={styles.creatorCard}>
        <LinearGradient
          colors={[HERO_START, HERO_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creatorAvatar}>
          <ThemedText style={styles.creatorInitial}>S</ThemedText>
        </LinearGradient>
        <View style={styles.creatorBody}>
          <ThemedText style={styles.creatorKicker}>Designed & built by</ThemedText>
          <ThemedText type="subtitle">Sheharzad</ThemedText>
          <ThemedText style={styles.listText}>
            Full-stack developer · React Native · AI products
          </ThemedText>
        </View>
        <View style={styles.creatorActions}>
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(REPO_URL)}
            style={({ pressed }) => [styles.darkButton, pressed && styles.pressed]}>
            <MaterialIcons name="code" size={16} color="#FFFFFF" />
            <ThemedText style={styles.darkButtonText}>View source</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(GITHUB_PROFILE_URL)}
            style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
            <MaterialIcons name="person-outline" size={16} color={Design.color.text} />
            <ThemedText style={styles.outlineButtonText}>GitHub profile</ThemedText>
          </Pressable>
        </View>
      </AppCard>

      <View style={styles.shadowShell}>
        <LinearGradient
          colors={[HERO_START, HERO_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cta}>
          <ThemedText style={styles.ctaTitle}>See the difference yourself.</ThemedText>
          <ThemedText style={styles.ctaBody}>
            Ask about any topic you are stuck on. It takes a few seconds.
          </ThemedText>
          <View style={styles.ctaActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/')}
              style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}>
              <ThemedText style={styles.ctaButtonText}>Ask the Tutor</ThemedText>
              <MaterialIcons name="arrow-forward" size={18} color={HERO_START} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/features')}
              style={({ pressed }) => [styles.ctaGhostButton, pressed && styles.pressed]}>
              <ThemedText style={styles.ctaGhostText}>Explore features</ThemedText>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <ThemedText style={styles.footer}>AI Study Companion · v{version}</ThemedText>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  shadowShell: {
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
    borderRadius: Design.radius.pill,
    paddingHorizontal: Design.space.sm + 2,
    paddingVertical: Design.space.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 22,
  },
  missionCard: {
    flexDirection: 'row',
    gap: Design.space.sm,
    borderRadius: Design.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: Design.space.md,
    marginTop: Design.space.xs,
  },
  missionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    fontStyle: 'italic',
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
  compareCard: {
    gap: Design.space.md,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.canvas,
    borderWidth: 1,
    borderColor: Design.color.border,
    padding: 4,
  },
  segmentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    paddingVertical: Design.space.sm,
  },
  segmentOptionActive: {
    backgroundColor: Design.color.surface,
    shadowColor: Design.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentText: {
    color: Design.color.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: Design.color.text,
  },
  compareTopic: {
    color: Design.color.subtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sample: {
    gap: Design.space.sm + 2,
    borderRadius: Design.radius.md,
    padding: Design.space.md,
    borderWidth: 1,
  },
  sampleTextbook: {
    backgroundColor: '#FAFAF9',
    borderColor: Design.color.border,
  },
  sampleCompanion: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  textbookText: {
    color: '#44403C',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'serif',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Design.space.sm,
  },
  pointDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
    backgroundColor: HERO_START,
  },
  companionText: {
    flex: 1,
    color: Design.color.text,
    fontSize: 15,
    lineHeight: 22,
  },
  exampleBox: {
    gap: 2,
    borderRadius: Design.radius.sm,
    backgroundColor: Design.color.surface,
    padding: Design.space.sm + 2,
  },
  exampleLabel: {
    color: Design.color.warning,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  urduText: {
    color: '#7C3AED',
    fontSize: 14,
    fontStyle: 'italic',
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
    marginTop: 2,
  },
  verdictText: {
    fontSize: 12,
    fontWeight: '800',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.md,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: Design.space.xs,
    borderRadius: Design.radius.lg,
    backgroundColor: Design.color.surface,
    borderWidth: 1,
    borderColor: Design.color.border,
    padding: Design.space.md,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Design.space.xs,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: Design.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIndex: {
    fontSize: 13,
    fontWeight: '900',
    opacity: 0.6,
  },
  tileTitle: {
    color: Design.color.text,
    fontSize: 15,
  },
  tileBody: {
    color: Design.color.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  audienceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.xs + 2,
  },
  audienceText: {
    color: Design.color.text,
    fontSize: 13,
    fontWeight: '700',
  },
  panel: {
    gap: Design.space.md,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
  },
  panelIcon: {
    width: 44,
    height: 44,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHeaderText: {
    flex: 1,
    gap: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Design.space.md,
  },
  listBody: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    color: Design.color.text,
    fontSize: 15,
  },
  listText: {
    color: Design.color.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  roadmapCard: {
    padding: 0,
  },
  roadmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
    padding: Design.space.md,
  },
  roadmapDivider: {
    borderTopWidth: 1,
    borderTopColor: Design.color.border,
  },
  roadmapIcon: {
    width: 40,
    height: 40,
    borderRadius: Design.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.primarySoft,
  },
  plannedPill: {
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.canvas,
    borderWidth: 1,
    borderColor: Design.color.border,
    paddingHorizontal: Design.space.sm,
    paddingVertical: 3,
  },
  plannedText: {
    color: Design.color.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  creatorCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Design.space.md,
  },
  creatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorInitial: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
  },
  creatorBody: {
    flex: 1,
    minWidth: 180,
    gap: 2,
  },
  creatorKicker: {
    color: Design.color.subtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  creatorActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
    flexBasis: '100%',
  },
  darkButton: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.text,
    paddingHorizontal: Design.space.lg,
    paddingVertical: Design.space.sm + 2,
  },
  darkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  outlineButton: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    borderWidth: 1,
    borderColor: Design.color.borderStrong,
    paddingHorizontal: Design.space.lg,
    paddingVertical: Design.space.sm + 2,
  },
  outlineButtonText: {
    color: Design.color.text,
    fontSize: 14,
    fontWeight: '700',
  },
  cta: {
    padding: Design.space.xl,
    gap: Design.space.sm,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  ctaBody: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 20,
  },
  ctaActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
    marginTop: Design.space.sm,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Design.space.lg,
    paddingVertical: Design.space.sm + 2,
  },
  ctaButtonText: {
    color: HERO_START,
    fontSize: 15,
    fontWeight: '800',
  },
  ctaGhostButton: {
    borderRadius: Design.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: Design.space.lg,
    paddingVertical: Design.space.sm + 2,
  },
  ctaGhostText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignSelf: 'center',
    color: Design.color.subtle,
    fontSize: 12,
    paddingVertical: Design.space.sm,
  },
});
