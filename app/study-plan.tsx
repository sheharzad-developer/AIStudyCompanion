import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppCard, HeroCard, ScreenScroll } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

const plan = [
  ['5 min', 'Ask the tutor for a simple explanation of the topic.'],
  ['10 min', 'Write the example in your own words and note what still feels confusing.'],
  ['10 min', 'Ask for a quiz and answer without looking at the explanation.'],
  ['5 min', 'Review mistakes and ask one follow-up question.'],
];

export default function StudyPlanScreen() {
  return (
    <ScreenScroll>
      <HeroCard
        kicker="Study Plan"
        title="A clean 30-minute sprint."
        body="Use this repeatable route for focused sessions before exams, homework, or revision."
        accent={Design.color.success}
      />

      <AppCard style={styles.timeline}>
        {plan.map(([time, task], index) => (
          <View key={task} style={styles.step}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{index + 1}</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText type="defaultSemiBold" style={styles.time}>
                {time}
              </ThemedText>
              <ThemedText style={styles.stepText}>{task}</ThemedText>
            </View>
          </View>
        ))}
      </AppCard>

      <Link href="/" style={styles.link}>
        <ThemedText type="link">Back to Home</ThemedText>
      </Link>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  timeline: {
    gap: Design.space.lg,
  },
  step: {
    flexDirection: 'row',
    gap: Design.space.md,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.success,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  stepContent: {
    flex: 1,
  },
  time: {
    color: Design.color.text,
  },
  stepText: {
    color: Design.color.muted,
    marginTop: 4,
    lineHeight: 22,
  },
  link: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
});
