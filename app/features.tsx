import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios, { isAxiosError } from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';

import { AppCard, ScreenScroll, appStyles } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { getApiBaseUrl } from '@/constants/api';
import { Design } from '@/constants/theme';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const HERO_START = '#4338CA';
const HERO_END = '#7C3AED';
const TYPEWRITER_CHARS_PER_TICK = 7;
const TYPEWRITER_TICK_MS = 16;

type FeatureKey = 'tutor' | 'quiz' | 'plan' | 'weather';

type Feature = {
  key: FeatureKey;
  name: string;
  tagline: string;
  icon: MaterialIconName;
  accent: string;
  soft: string;
  highlights: readonly string[];
  /** Sent to the live API for the demo, and to the Tutor via "Open in Tutor". */
  prompt: string;
};

const FEATURES: readonly Feature[] = [
  {
    key: 'tutor',
    name: 'AI Tutor',
    tagline: 'Clear explanations in simple English, with a touch of Urdu where it helps.',
    icon: 'lightbulb-outline',
    accent: Design.color.warning,
    soft: Design.color.warningSoft,
    highlights: [
      'Bullet-point explanations in about 100 words',
      'Exactly one real-life example',
      'Follow-ups: simpler, quiz, or Urdu translation',
    ],
    prompt: 'Explain photosynthesis in simple words',
  },
  {
    key: 'quiz',
    name: 'Quiz Builder',
    tagline: 'Turn any topic into three multiple-choice questions to test recall.',
    icon: 'quiz',
    accent: Design.color.primary,
    soft: Design.color.primarySoft,
    highlights: [
      'Three beginner-friendly MCQs',
      'Options A, B and C with the answer marked',
      'Works on any topic, or on what you just studied',
    ],
    prompt: 'Quiz me on the solar system',
  },
  {
    key: 'plan',
    name: 'Study Planner',
    tagline: 'Shape a topic into a short, focused revision sprint.',
    icon: 'event-note',
    accent: Design.color.success,
    soft: Design.color.successSoft,
    highlights: [
      'Time-boxed steps you can start right away',
      'Built around how long you have',
      'Ends with a check of what you learned',
    ],
    prompt: 'Make a 20-minute study plan for fractions',
  },
  {
    key: 'weather',
    name: 'Weather Helper',
    tagline: 'Live conditions for any city, to plan class, travel and study breaks.',
    icon: 'wb-sunny',
    accent: '#0EA5E9',
    soft: '#E0F2FE',
    highlights: [
      'Live temperature and “feels like”',
      'Sky conditions and wind speed',
      'Real data from Open-Meteo, no AI guessing',
    ],
    prompt: 'What is the weather in Lahore?',
  },
];

type Step = {
  title: string;
  body: string;
  icon: MaterialIconName;
};

const HOW_IT_WORKS: readonly Step[] = [
  {
    title: 'You ask',
    body: 'Type a question or tap a prompt on web, iOS or Android.',
    icon: 'chat-bubble-outline',
  },
  {
    title: 'Secure backend',
    body: 'An Express API on Vercel adds recent context and keeps the AI key off your device.',
    icon: 'shield',
  },
  {
    title: 'AI + live data',
    body: 'Groq runs the gpt-oss-120b model; weather questions use live Open-Meteo data.',
    icon: 'bolt',
  },
  {
    title: 'Clear answer',
    body: 'Explanation, one example and next steps, formatted for quick study.',
    icon: 'check-circle-outline',
  },
];

const TECH_STACK = [
  'React Native',
  'Expo Router',
  'TypeScript',
  'Express',
  'Groq',
  'Open-Meteo',
  'Vercel',
] as const;

type ApiStatus = 'checking' | 'online' | 'offline';

type DemoResult =
  | { state: 'loading' }
  | { state: 'done'; text: string; seconds: number; typed: boolean }
  | { state: 'error'; message: string };

function cleanAnswer(text: string) {
  return text.replace(/\*\*/g, '').trim();
}

function StatusPill({ status }: { status: ApiStatus }) {
  const label =
    status === 'online' ? 'Tutor online' : status === 'offline' ? 'Tutor offline' : 'Checking…';
  const dotColor =
    status === 'online' ? '#4ADE80' : status === 'offline' ? '#FB7185' : 'rgba(255,255,255,0.6)';

  return (
    <View style={styles.statusPill} accessibilityLabel={label}>
      <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
      <ThemedText style={styles.statusText}>{label}</ThemedText>
    </View>
  );
}

function Typewriter({ text, style, onDone }: { text: string; style: object; onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setInterval(() => {
      setShown((current) => Math.min(current + TYPEWRITER_CHARS_PER_TICK, text.length));
    }, TYPEWRITER_TICK_MS);
    return () => clearInterval(timer);
  }, [text]);

  useEffect(() => {
    if (shown >= text.length) onDoneRef.current();
  }, [shown, text.length]);

  return <ThemedText style={style}>{text.slice(0, shown)}</ThemedText>;
}

export default function FeaturesScreen() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [selectedKey, setSelectedKey] = useState<FeatureKey>('tutor');
  const [results, setResults] = useState<Partial<Record<FeatureKey, DemoResult>>>({});
  const showcaseAnim = useRef(new Animated.Value(1)).current;

  const selected = FEATURES.find((feature) => feature.key === selectedKey) ?? FEATURES[0];
  const result = results[selected.key];

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${getApiBaseUrl()}/`, { timeout: 10000 })
      .then(() => !cancelled && setApiStatus('online'))
      .catch(() => !cancelled && setApiStatus('offline'));
    return () => {
      cancelled = true;
    };
  }, []);

  const selectFeature = (key: FeatureKey) => {
    if (key === selectedKey) return;
    // Leaving mid-animation: show the full answer when the user comes back.
    markTyped(selectedKey);
    showcaseAnim.setValue(0);
    setSelectedKey(key);
    Animated.timing(showcaseAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const runDemo = async (feature: Feature) => {
    setResults((current) => ({ ...current, [feature.key]: { state: 'loading' } }));
    const startedAt = Date.now();

    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/ask`,
        { question: feature.prompt },
        { timeout: 120000 },
      );
      const seconds = (Date.now() - startedAt) / 1000;
      setResults((current) => ({
        ...current,
        [feature.key]: {
          state: 'done',
          text: cleanAnswer(response.data.answer ?? ''),
          seconds,
          typed: false,
        },
      }));
      setApiStatus('online');
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.error || 'Could not reach the tutor. Check your connection.'
        : 'Something went wrong. Please try again.';
      setResults((current) => ({ ...current, [feature.key]: { state: 'error', message } }));
    }
  };

  // Type the answer out once; revisiting a feature shows it in full.
  const markTyped = (key: FeatureKey) => {
    setResults((current) => {
      const existing = current[key];
      if (existing?.state !== 'done' || existing.typed) return current;
      return { ...current, [key]: { ...existing, typed: true } };
    });
  };

  const openInTutor = (prompt: string) => {
    router.push({ pathname: '/', params: { prompt } });
  };

  return (
    <ScreenScroll>
      <View style={styles.heroShell}>
        <LinearGradient
          colors={[HERO_START, HERO_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="auto-awesome" size={14} color="#FFFFFF" />
              <ThemedText style={styles.heroBadgeText}>Features</ThemedText>
            </View>
            <StatusPill status={apiStatus} />
          </View>

          <ThemedText style={styles.heroTitle}>More than chat.{'\n'}A complete study loop.</ThemedText>
          <ThemedText style={styles.heroBody}>
            Understand a topic, test yourself, plan your next session, and keep moving. Every
            feature below runs live — try it right here.
          </ThemedText>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>{FEATURES.length}</ThemedText>
              <ThemedText style={styles.heroStatLabel}>study tools</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>3</ThemedText>
              <ThemedText style={styles.heroStatLabel}>MCQs per quiz</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>2</ThemedText>
              <ThemedText style={styles.heroStatLabel}>languages</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>See it in action</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            Pick a feature and run a live demo against the real AI tutor.
          </ThemedText>
        </View>

        <View style={styles.chipGrid}>
          {FEATURES.map((feature) => {
            const isSelected = feature.key === selected.key;
            return (
              <Pressable
                key={feature.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                onPress={() => selectFeature(feature.key)}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected && { borderColor: feature.accent, backgroundColor: feature.soft },
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.chipIcon,
                    { backgroundColor: isSelected ? feature.accent : feature.soft },
                  ]}>
                  <MaterialIcons
                    name={feature.icon}
                    size={18}
                    color={isSelected ? '#FFFFFF' : feature.accent}
                  />
                </View>
                <ThemedText style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {feature.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Animated.View
          style={{
            opacity: showcaseAnim,
            transform: [
              {
                translateY: showcaseAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
              },
            ],
          }}>
          <AppCard style={styles.showcase}>
            <View style={styles.showcaseHeader}>
              <View style={[styles.showcaseIcon, { backgroundColor: selected.soft }]}>
                <MaterialIcons name={selected.icon} size={24} color={selected.accent} />
              </View>
              <View style={styles.showcaseTitleWrap}>
                <ThemedText type="subtitle">{selected.name}</ThemedText>
                <ThemedText style={styles.sectionCaption}>{selected.tagline}</ThemedText>
              </View>
            </View>

            <View style={styles.highlightList}>
              {selected.highlights.map((highlight) => (
                <View key={highlight} style={styles.highlightRow}>
                  <MaterialIcons name="check-circle" size={16} color={selected.accent} />
                  <ThemedText style={styles.highlightText}>{highlight}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.demo}>
              <View style={styles.demoLabelRow}>
                <View style={[styles.liveDot, { backgroundColor: selected.accent }]} />
                <ThemedText style={styles.demoLabel}>Live demo</ThemedText>
              </View>

              <View style={styles.userBubble}>
                <ThemedText style={styles.userBubbleText}>{selected.prompt}</ThemedText>
              </View>

              {result?.state === 'loading' ? (
                <View style={styles.aiBubble}>
                  <View style={styles.thinkingRow}>
                    <ActivityIndicator size="small" color={selected.accent} />
                    <ThemedText style={styles.thinkingText}>Tutor is thinking…</ThemedText>
                  </View>
                </View>
              ) : null}

              {result?.state === 'done' ? (
                <View style={styles.aiBubble}>
                  {result.typed ? (
                    <ThemedText style={styles.aiBubbleText}>{result.text}</ThemedText>
                  ) : (
                    <Typewriter
                      key={selected.key}
                      text={result.text}
                      style={styles.aiBubbleText}
                      onDone={() => markTyped(selected.key)}
                    />
                  )}
                  <View style={styles.answerMeta}>
                    <MaterialIcons name="bolt" size={13} color={Design.color.success} />
                    <ThemedText style={styles.answerMetaText}>
                      Answered live in {result.seconds.toFixed(1)}s
                    </ThemedText>
                  </View>
                </View>
              ) : null}

              {result?.state === 'error' ? (
                <View style={styles.errorBanner}>
                  <MaterialIcons name="error-outline" size={16} color={Design.color.danger} />
                  <ThemedText style={styles.errorText}>{result.message}</ThemedText>
                </View>
              ) : null}

              <View style={styles.demoActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={result?.state === 'loading'}
                  onPress={() => runDemo(selected)}
                  style={({ pressed }) => [
                    styles.primaryAction,
                    { backgroundColor: selected.accent },
                    (pressed || result?.state === 'loading') && styles.pressed,
                  ]}>
                  <MaterialIcons
                    name={result?.state === 'done' ? 'replay' : 'play-arrow'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <ThemedText style={styles.primaryActionText}>
                    {result?.state === 'done' ? 'Run again' : 'Run live demo'}
                  </ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openInTutor(selected.prompt)}
                  style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
                  <ThemedText style={styles.secondaryActionText}>Open in Tutor</ThemedText>
                  <MaterialIcons name="arrow-forward" size={16} color={Design.color.text} />
                </Pressable>
              </View>
            </View>
          </AppCard>
        </Animated.View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>How it works</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            From your question to a clear answer in a few seconds.
          </ThemedText>
        </View>

        <AppCard style={styles.stepsCard}>
          {HOW_IT_WORKS.map((step, index) => {
            const isLast = index === HOW_IT_WORKS.length - 1;
            return (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepRail}>
                  <LinearGradient
                    colors={[HERO_START, HERO_END]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.stepIcon}>
                    <MaterialIcons name={step.icon} size={18} color="#FFFFFF" />
                  </LinearGradient>
                  {isLast ? null : <View style={styles.stepLine} />}
                </View>
                <View style={[styles.stepBody, !isLast && styles.stepBodySpaced]}>
                  <ThemedText style={styles.stepNumber}>Step {index + 1}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.stepTitle}>
                    {step.title}
                  </ThemedText>
                  <ThemedText style={styles.stepText}>{step.body}</ThemedText>
                </View>
              </View>
            );
          })}
        </AppCard>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <ThemedText style={appStyles.sectionTitle}>Built with</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            One codebase for web, iOS and Android, with a serverless API.
          </ThemedText>
        </View>
        <View style={styles.stackWrap}>
          {TECH_STACK.map((tech) => (
            <View key={tech} style={styles.stackChip}>
              <ThemedText style={styles.stackChipText}>{tech}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.heroShell}>
        <LinearGradient
          colors={[Design.color.primary, HERO_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cta}>
          <ThemedText style={styles.ctaTitle}>Ready to study smarter?</ThemedText>
          <ThemedText style={styles.ctaBody}>
            Ask your first question and turn the answer into a quiz in one tap.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/')}
            style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}>
            <ThemedText style={styles.ctaButtonText}>Open the Tutor</ThemedText>
            <MaterialIcons name="arrow-forward" size={18} color={HERO_START} />
          </Pressable>
        </LinearGradient>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.75,
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
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Design.space.sm,
  },
  heroBadge: {
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    paddingHorizontal: Design.space.sm + 2,
    paddingVertical: Design.space.xs,
    backgroundColor: 'rgba(15,23,42,0.28)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Design.radius.lg,
    paddingVertical: Design.space.md,
    paddingHorizontal: Design.space.sm,
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
    textAlign: 'center',
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
  },
  chip: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.sm,
    borderWidth: 1.5,
    borderColor: Design.color.border,
    borderRadius: Design.radius.md,
    backgroundColor: Design.color.surface,
    padding: Design.space.sm,
  },
  chipIcon: {
    width: 34,
    height: 34,
    borderRadius: Design.radius.sm - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    flex: 1,
    color: Design.color.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: Design.color.text,
  },
  showcase: {
    gap: Design.space.md,
  },
  showcaseHeader: {
    flexDirection: 'row',
    gap: Design.space.md,
    alignItems: 'flex-start',
  },
  showcaseIcon: {
    width: 52,
    height: 52,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseTitleWrap: {
    flex: 1,
    gap: Design.space.xs / 2,
  },
  highlightList: {
    gap: Design.space.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.sm,
  },
  highlightText: {
    flex: 1,
    color: Design.color.text,
    fontSize: 14,
    lineHeight: 20,
  },
  demo: {
    gap: Design.space.sm + 2,
    borderRadius: Design.radius.lg,
    backgroundColor: Design.color.canvas,
    borderWidth: 1,
    borderColor: Design.color.border,
    padding: Design.space.md,
  },
  demoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  demoLabel: {
    color: Design.color.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    borderRadius: Design.radius.md,
    borderBottomRightRadius: 6,
    backgroundColor: Design.color.primary,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.sm,
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    gap: Design.space.sm,
    borderRadius: Design.radius.md,
    borderBottomLeftRadius: 6,
    backgroundColor: Design.color.surface,
    borderWidth: 1,
    borderColor: Design.color.border,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.sm + 2,
  },
  aiBubbleText: {
    color: Design.color.text,
    fontSize: 14,
    lineHeight: 21,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.sm,
  },
  thinkingText: {
    color: Design.color.muted,
    fontSize: 14,
  },
  answerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerMetaText: {
    color: Design.color.success,
    fontSize: 12,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.sm,
    borderRadius: Design.radius.sm,
    backgroundColor: Design.color.dangerSoft,
    padding: Design.space.sm,
  },
  errorText: {
    flex: 1,
    color: Design.color.danger,
    fontSize: 13,
  },
  demoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
    marginTop: Design.space.xs,
  },
  primaryAction: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    paddingHorizontal: Design.space.lg,
    paddingVertical: Design.space.sm + 2,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryAction: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    borderWidth: 1,
    borderColor: Design.color.borderStrong,
    backgroundColor: Design.color.surface,
    paddingHorizontal: Design.space.lg,
    paddingVertical: Design.space.sm + 2,
  },
  secondaryActionText: {
    color: Design.color.text,
    fontSize: 15,
    fontWeight: '700',
  },
  stepsCard: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Design.space.md,
  },
  stepRail: {
    alignItems: 'center',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    backgroundColor: Design.color.primarySoft,
  },
  stepBody: {
    flex: 1,
    gap: 2,
    paddingTop: 2,
  },
  stepBodySpaced: {
    paddingBottom: Design.space.lg,
  },
  stepNumber: {
    color: HERO_END,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  stepTitle: {
    color: Design.color.text,
    fontSize: 16,
  },
  stepText: {
    color: Design.color.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  stackWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
  },
  stackChip: {
    borderRadius: Design.radius.pill,
    borderWidth: 1,
    borderColor: Design.color.border,
    backgroundColor: Design.color.surface,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.xs + 2,
  },
  stackChipText: {
    color: Design.color.text,
    fontSize: 13,
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
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
    borderRadius: Design.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Design.space.lg,
    paddingVertical: Design.space.sm + 2,
    marginTop: Design.space.sm,
  },
  ctaButtonText: {
    color: HERO_START,
    fontSize: 15,
    fontWeight: '800',
  },
});
