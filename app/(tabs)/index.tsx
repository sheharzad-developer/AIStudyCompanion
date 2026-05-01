import axios, { isAxiosError } from 'axios';
import Constants from 'expo-constants';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Design } from '@/constants/theme';

type ConstantsWithManifest = typeof Constants & {
  manifest?: {
    debuggerHost?: string;
  };
};

const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
} as const;

const SUGGESTED_PROMPTS = [
  'Explain photosynthesis in simple words',
  'Quiz me on Newton laws',
  'Make a 20-minute study plan',
  'What is the weather in Lahore?',
];

type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

type Message = {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
};

function getDevServerHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ?? (Constants as ConstantsWithManifest).manifest?.debuggerHost;

  return hostUri?.split(':')[0];
}

function getDefaultApiBaseUrl() {
  const devServerHost = getDevServerHost();

  if (devServerHost && devServerHost !== 'localhost' && devServerHost !== '127.0.0.1') {
    return `http://${devServerHost}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultApiBaseUrl()).replace(
  /\/$/,
  '',
);

function createMessage(type: MessageType, text: string): Message {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    text,
    timestamp: new Date(),
  };
}

export default function TutorScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    createMessage(
      MESSAGE_TYPES.AI,
      'Hi, I am your AI Study Companion. Ask for a simple explanation, quiz, study plan, or quick weather check.',
    ),
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const conversationCount = useMemo(
    () => messages.filter((message) => message.type === MESSAGE_TYPES.USER).length,
    [messages],
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText ?? inputText).trim();

    if (!textToSend || isLoading) return;

    const userMessage = createMessage(MESSAGE_TYPES.USER, textToSend);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, {
        question: userMessage.text,
        conversationHistory: nextMessages.slice(-8).map((message) => ({
          role: message.type,
          text: message.text,
        })),
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        createMessage(
          MESSAGE_TYPES.AI,
          response.data.answer || "Sorry, I couldn't process that. Please try again.",
        ),
      ]);
    } catch (error) {
      console.error('API Error:', error);

      const errorText = isAxiosError(error)
        ? error.response?.data?.error ||
          `Could not reach the study server at ${API_BASE_URL}. Check the backend and network.`
        : 'Something went wrong. Please try again.';

      setMessages((prevMessages) => [
        ...prevMessages,
        createMessage(MESSAGE_TYPES.AI, errorText),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPrompt = ({ item }: { item: string }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ask: ${item}`}
      disabled={isLoading}
      onPress={() => handleSendMessage(item)}
      style={({ pressed }) => [styles.promptChip, (pressed || isLoading) && styles.pressed]}>
      <Text style={styles.promptText}>{item}</Text>
    </Pressable>
  );

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    const isUserMessage = item.type === MESSAGE_TYPES.USER;

    return (
      <View style={[styles.messageRow, isUserMessage ? styles.userMessageRow : styles.aiMessageRow]}>
        <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUserMessage ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, isUserMessage ? styles.userTimestamp : styles.aiTimestamp]}>
            {item.timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.heroCard}>
        <View style={styles.kickerPill}>
          <Text style={styles.kicker}>Tutor</Text>
        </View>
        <Text style={styles.heroTitle}>Ask smarter. Learn faster.</Text>
        <Text style={styles.heroBody}>
          Clean explanations, short quizzes, and revision prompts built for everyday study.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{conversationCount}</Text>
            <Text style={styles.statLabel}>questions</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>AI</Text>
            <Text style={styles.statLabel}>ready tutor</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Try a prompt</Text>
      <FlatList
        data={SUGGESTED_PROMPTS}
        horizontal
        keyExtractor={(item) => item}
        renderItem={renderPrompt}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptList}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.headerTitle}>AI Tutor</Text>
          <Text style={styles.headerSubtitle}>Clear answers for focused study</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Ready</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
      />

      {isLoading ? (
        <View style={styles.loadingBubble}>
          <ActivityIndicator size="small" color={Design.color.primary} />
          <Text style={styles.loadingText}>Building a clear answer...</Text>
        </View>
      ) : null}

      <View style={[styles.inputSection, { paddingBottom: Math.max(insets.bottom + 8, 10) }]}>
        <View style={styles.inputContainer}>
          <TextInput
            accessibilityLabel="Ask your study companion"
            style={styles.textInput}
            placeholder="Ask for an explanation, quiz, plan..."
            placeholderTextColor={Design.color.subtle}
            value={inputText}
            onChangeText={setInputText}
            editable={!isLoading}
            multiline
            maxLength={700}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={({ pressed }) => [
              styles.sendButton,
              (isLoading || !inputText.trim()) && styles.sendButtonDisabled,
              pressed && !isLoading ? styles.pressed : undefined,
            ]}
            onPress={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
        <Text style={styles.helperText}>Backend: {API_BASE_URL}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Design.color.canvas,
  },
  header: {
    paddingHorizontal: Design.space.lg,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Design.space.md,
  },
  headerTitle: {
    color: Design.color.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    color: Design.color.muted,
    fontSize: 13,
    marginTop: 3,
  },
  statusPill: {
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Design.color.success,
  },
  statusText: {
    color: Design.color.text,
    fontSize: 12,
    fontWeight: '800',
  },
  chatListContent: {
    paddingHorizontal: Design.space.lg,
    paddingBottom: Design.space.md,
    flexGrow: 1,
  },
  listHeader: {
    paddingBottom: Design.space.sm,
  },
  heroCard: {
    backgroundColor: Design.color.surface,
    borderRadius: Design.radius.xl,
    borderWidth: 1,
    borderColor: Design.color.border,
    padding: Design.space.xl,
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity,
    shadowRadius: Design.shadow.radius,
    elevation: Design.shadow.elevation,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  kicker: {
    color: Design.color.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: Design.color.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 38,
    marginTop: Design.space.md,
  },
  heroBody: {
    color: Design.color.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Design.space.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Design.space.sm,
    marginTop: Design.space.md,
  },
  statPill: {
    flex: 1,
    borderRadius: Design.radius.md,
    backgroundColor: Design.color.surfaceMuted,
    padding: Design.space.md,
  },
  statValue: {
    color: Design.color.text,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: Design.color.muted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    color: Design.color.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginTop: Design.space.lg,
    textTransform: 'uppercase',
  },
  promptList: {
    gap: Design.space.sm,
    paddingTop: Design.space.sm,
    paddingRight: Design.space.lg,
  },
  promptChip: {
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 230,
  },
  promptText: {
    color: Design.color.text,
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  messageRow: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '86%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: Design.radius.md,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: Design.color.primary,
    borderColor: Design.color.primary,
  },
  aiBubble: {
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: Design.color.text,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.72)',
  },
  aiTimestamp: {
    color: Design.color.muted,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    marginHorizontal: Design.space.lg,
    marginBottom: 6,
    borderRadius: Design.radius.md,
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: Design.color.muted,
    fontSize: 14,
  },
  inputSection: {
    paddingHorizontal: Design.space.lg,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: Design.color.border,
    backgroundColor: Design.color.canvas,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderWidth: 1,
    borderColor: Design.color.border,
    borderRadius: Design.radius.lg,
    backgroundColor: Design.color.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    color: Design.color.text,
    paddingHorizontal: 4,
    paddingVertical: 8,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 112,
  },
  sendButton: {
    minWidth: 64,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.primary,
    paddingHorizontal: 16,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  helperText: {
    color: Design.color.muted,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
});
