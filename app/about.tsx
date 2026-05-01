import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppCard, HeroCard, ScreenScroll } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

const values = [
  'Short answers that avoid jargon',
  'One real-life example for every explanation',
  'Quiz practice when a student is ready',
  'Simple Urdu support where it helps understanding',
];

export default function AboutScreen() {
  return (
    <ScreenScroll>
      <HeroCard
        kicker="About"
        title="Built for students who need clarity fast."
        body="AI Study Companion turns big topics into simple explanations, then helps students practice with quizzes and focused revision prompts."
      />

      <AppCard style={styles.panel}>
        <ThemedText type="subtitle">Learning promise</ThemedText>
        {values.map((value) => (
          <View key={value} style={styles.row}>
            <View style={styles.dot} />
            <ThemedText style={styles.rowText}>{value}</ThemedText>
          </View>
        ))}
      </AppCard>

      <AppCard muted style={styles.panel}>
        <ThemedText type="subtitle">How it works</ThemedText>
        <ThemedText style={styles.body}>
          The mobile app sends study questions to a local Express backend. The backend keeps API keys
          private, calls Gemini for explanations and quizzes, and returns student-friendly answers.
        </ThemedText>
      </AppCard>

      <Link href="/" style={styles.link}>
        <ThemedText type="link">Back to Home</ThemedText>
      </Link>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Design.space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Design.color.primary,
  },
  rowText: {
    flex: 1,
    color: Design.color.muted,
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
