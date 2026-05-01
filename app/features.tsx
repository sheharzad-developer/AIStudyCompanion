import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppCard, HeroCard, ScreenScroll } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

const features = [
  ['AI Tutor', 'Ask a question and get a direct explanation with one useful example.'],
  ['Quiz Builder', 'Convert a topic into three MCQs so students can test recall immediately.'],
  ['Study Planner', 'Shape a topic and deadline into a short, practical revision sprint.'],
  ['Weather Helper', 'Check the weather for class, travel, or study sessions outside home.'],
];

export default function FeaturesScreen() {
  return (
    <ScreenScroll>
      <HeroCard
        kicker="Features"
        title="More than chat. A complete study flow."
        body="The app is designed around a simple loop: understand, practice, plan, and keep moving."
        accent="#7C3AED"
      />

      <View style={styles.grid}>
        {features.map(([title, text]) => (
          <AppCard key={title} style={styles.card}>
            <View style={styles.icon}>
              <ThemedText style={styles.iconText}>{title[0]}</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              {title}
            </ThemedText>
            <ThemedText style={styles.cardText}>{text}</ThemedText>
          </AppCard>
        ))}
      </View>

      <AppCard muted style={styles.panel}>
        <ThemedText type="subtitle">Suggested next step</ThemedText>
        <ThemedText style={styles.body}>
          Open the Tutor tab and ask: “Explain algebra equations with one example, then quiz me.”
        </ThemedText>
      </AppCard>

      <Link href="/" style={styles.link}>
        <ThemedText type="link">Back to Home</ThemedText>
      </Link>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Design.space.md,
  },
  card: {
    gap: Design.space.sm,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.primarySoft,
  },
  iconText: {
    color: Design.color.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  cardTitle: {
    color: Design.color.text,
    fontSize: 18,
  },
  cardText: {
    color: Design.color.muted,
  },
  panel: {
    gap: Design.space.md,
  },
  body: {
    color: Design.color.muted,
    lineHeight: 22,
  },
  link: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
});
