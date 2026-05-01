import { StyleSheet, View } from 'react-native';

import { AppCard, HeroCard, ScreenScroll, appStyles } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

const features = [
  ['Simple explanations', 'Short answers with one practical example.'],
  ['Quiz practice', 'Generate three beginner-friendly MCQs.'],
  ['Study planning', 'Turn a topic into a focused sprint.'],
  ['Weather checks', 'Plan around travel and class conditions.'],
];

const prompts = [
  'Explain cell division like I am in grade 8, then ask me one check question.',
  'Make a 30-minute revision plan for algebra with breaks.',
  'Create a quiz about World War II causes.',
];

const setupTips = [
  'Start the backend from ai-study-backend.',
  'Use EXPO_PUBLIC_API_BASE_URL for physical phones.',
  'Keep GEMINI_API_KEY only in the backend .env file.',
];

export default function StudyGuideScreen() {
  return (
    <ScreenScroll>
      <HeroCard
        kicker="Study Guide"
        title="Use better prompts. Get better answers."
        body="A clean guide for asking focused questions, turning answers into practice, and keeping setup healthy."
        accent="#7C3AED"
      />

      <ThemedText style={appStyles.sectionTitle}>What the companion does</ThemedText>
      <View style={styles.grid}>
        {features.map(([title, body]) => (
          <AppCard key={title} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <ThemedText style={styles.featureIconText}>{title[0]}</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              {title}
            </ThemedText>
            <ThemedText style={styles.cardBody}>{body}</ThemedText>
          </AppCard>
        ))}
      </View>

      <AppCard style={styles.panel}>
        <ThemedText type="subtitle">Best prompts</ThemedText>
        {prompts.map((prompt) => (
          <View key={prompt} style={styles.prompt}>
            <View style={styles.promptLine} />
            <ThemedText style={styles.promptText}>{prompt}</ThemedText>
          </View>
        ))}
      </AppCard>

      <AppCard muted style={styles.panel}>
        <ThemedText type="subtitle">Setup checklist</ThemedText>
        {setupTips.map((tip, index) => (
          <View key={tip} style={styles.checkRow}>
            <View style={styles.checkBadge}>
              <ThemedText style={styles.checkBadgeText}>{index + 1}</ThemedText>
            </View>
            <ThemedText style={styles.checkText}>{tip}</ThemedText>
          </View>
        ))}
      </AppCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Design.space.md,
  },
  featureCard: {
    gap: Design.space.sm,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.primarySoft,
  },
  featureIconText: {
    color: Design.color.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  featureTitle: {
    color: Design.color.text,
    fontSize: 18,
  },
  cardBody: {
    color: Design.color.muted,
  },
  panel: {
    gap: Design.space.md,
  },
  prompt: {
    flexDirection: 'row',
    gap: Design.space.md,
    alignItems: 'flex-start',
  },
  promptLine: {
    width: 4,
    height: '100%',
    minHeight: 42,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  promptText: {
    flex: 1,
    color: Design.color.muted,
    lineHeight: 22,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
  },
  checkBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.surface,
  },
  checkBadgeText: {
    color: Design.color.primary,
    fontWeight: '900',
  },
  checkText: {
    flex: 1,
    color: Design.color.muted,
  },
});
