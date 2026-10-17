import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import type { SocialProfile } from '@/hooks/use-social-sign-in';

export type Profile = SocialProfile | { name: string; email: string; provider: 'Email' };

export type StudySettings = {
  profile: Profile | null;
  dailyNudge: boolean;
  quizReminders: boolean;
  /** Send recent chat messages with each question so follow-ups keep their context. */
  rememberContext: boolean;
};

type StoreState = StudySettings & {
  /** Bumped by "Clear chat history"; the tutor screen resets its messages when it changes. */
  chatResetCount: number;
};

const STORAGE_KEY = 'study-settings-v1';

const DEFAULT_SETTINGS: StudySettings = {
  profile: null,
  dailyNudge: true,
  quizReminders: false,
  rememberContext: true,
};

let state: StoreState = { ...DEFAULT_SETTINGS, chatResetCount: 0 };
let hydration: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  const { chatResetCount: _ignored, ...settings } = state;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
}

function hydrate() {
  if (!hydration) {
    hydration = AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const saved = JSON.parse(stored) as Partial<StudySettings>;
        state = { ...state, ...saved };
        emit();
      })
      .catch(() => {});
  }
  return hydration;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function updateStudySettings(patch: Partial<StudySettings>) {
  state = { ...state, ...patch };
  emit();
  persist();
}

export function clearChatHistory() {
  state = { ...state, chatResetCount: state.chatResetCount + 1 };
  emit();
}

export function useStudySettings() {
  useEffect(() => {
    hydrate();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
