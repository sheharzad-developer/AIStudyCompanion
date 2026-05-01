import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppButton } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <AppCard style={styles.card}>
        <View style={styles.icon}>
          <ThemedText style={styles.iconText}>30</ThemedText>
        </View>
        <ThemedText type="title" style={styles.title}>
          Ready for a study sprint?
        </ThemedText>
        <ThemedText style={styles.description}>
          Pick one topic, ask for a short explanation, then turn the answer into a quiz while it is
          still fresh.
        </ThemedText>
        <Link href="/" dismissTo asChild>
          <AppButton>Start with the tutor</AppButton>
        </Link>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Design.space.lg,
    backgroundColor: Design.color.canvas,
  },
  card: {
    alignItems: 'center',
    gap: Design.space.md,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.primarySoft,
  },
  iconText: {
    color: Design.color.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  title: {
    color: Design.color.text,
    textAlign: 'center',
  },
  description: {
    color: Design.color.muted,
    maxWidth: 320,
    textAlign: 'center',
    lineHeight: 22,
  },
});
