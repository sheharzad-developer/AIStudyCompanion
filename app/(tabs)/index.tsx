import axios, { isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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

type SuggestedPrompt = {
  text: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  accent: string;
};

const SUGGESTED_PROMPTS: readonly SuggestedPrompt[] = [
  {
    text: 'Explain photosynthesis in simple words',
    icon: 'lightbulb-outline',
    accent: Design.color.warning,
  },
  {
    text: 'Quiz me on Newton laws',
    icon: 'help-outline',
    accent: Design.color.primary,
  },
  {
    text: 'Make a 20-minute study plan',
    icon: 'event-note',
    accent: Design.color.success,
  },
  {
    text: 'What is the weather in Lahore?',
    icon: 'wb-sunny',
    accent: '#0EA5E9',
  },
];

const MAX_CONTENT_WIDTH = 680;
const SIDE_PADDING = Design.space.lg;
const USER_BUBBLE_MAX_RATIO = 0.78;
const AI_BUBBLE_MAX_RATIO = 0.82;

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

function useResponsiveWidth() {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription.remove();
  }, []);

  return Math.min(screenWidth - SIDE_PADDING * 2, MAX_CONTENT_WIDTH);
}

const MessageBubble = memo(function MessageBubble({
  item,
  contentWidth,
}: {
  item: Message;
  contentWidth: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isUserMessage = item.type === MESSAGE_TYPES.USER;
  const bubbleMaxWidth =
    contentWidth * (isUserMessage ? USER_BUBBLE_MAX_RATIO : AI_BUBBLE_MAX_RATIO);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const bubbleContent = (
    <>
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
    </>
  );

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUserMessage ? styles.userMessageRow : styles.aiMessageRow,
        { opacity: fadeAnim },
      ]}>
      {isUserMessage ? (
        <LinearGradient
          colors={[Design.color.primary, Design.color.primaryPressed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.messageBubble, styles.userBubble, { maxWidth: bubbleMaxWidth }]}>
          {bubbleContent}
        </LinearGradient>
      ) : (
        <View style={[styles.messageBubble, styles.aiBubble, { maxWidth: bubbleMaxWidth }]}>
          {bubbleContent}
        </View>
      )}
    </Animated.View>
  );
});

export default function TutorScreen() {
  const insets = useSafeAreaInsets();
  const contentWidth = useResponsiveWidth();
  const [messages, setMessages] = useState<Message[]>([
    createMessage(
      MESSAGE_TYPES.AI,
      'Hi, I am your AI Study Companion. Ask for a simple explanation, quiz, study plan, or quick weather check.',
    ),
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);
  const flatListRef = useRef<FlatList<Message>>(null);

  const conversationCount = useMemo(
    () => messages.filter((message) => message.type === MESSAGE_TYPES.USER).length,
    [messages],
  );

  useEffect(() => {
    if (messages.length === 0) return;
    const handle = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(handle);
  }, [messages, composerHeight]);

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

  const handleComposerLayout = useCallback((event: LayoutChangeEvent) => {
    setComposerHeight(event.nativeEvent.layout.height);
  }, []);

  const renderPrompt = ({ item }: { item: SuggestedPrompt }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ask: ${item.text}`}
      disabled={isLoading}
      onPress={() => handleSendMessage(item.text)}
      style={({ pressed }) => [styles.promptChip, (pressed || isLoading) && styles.pressed]}>
      <View style={[styles.promptChipIcon, { backgroundColor: `${item.accent}18` }]}>
        <MaterialIcons name={item.icon} size={16} color={item.accent} />
      </View>
      <Text style={styles.promptText}>{item.text}</Text>
    </Pressable>
  );

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <MessageBubble item={item} contentWidth={contentWidth} />
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.heroShell}>
        <LinearGradient
          colors={[Design.color.primary, Design.color.primaryPressed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <MaterialIcons name="auto-awesome" size={14} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>Tutor</Text>
          </View>
          <Text style={styles.heroTitle}>Ask smarter.{'\n'}Learn faster.</Text>
          <Text style={styles.heroBody}>
            Clean explanations, short quizzes, and revision prompts built for everyday study.
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{conversationCount}</Text>
              <Text style={styles.statLabel}>questions</Text>
            </View>
            <View style={styles.statPillDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statValue}>AI</Text>
              <Text style={styles.statLabel}>ready tutor</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.sectionLabel}>Try a prompt</Text>
      <FlatList
        data={SUGGESTED_PROMPTS}
        horizontal
        keyExtractor={(item) => item.text}
        renderItem={renderPrompt}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptList}
      />
    </View>
  );

  const composerBottomInset = Math.max(insets.bottom, Design.space.sm);
  const listBottomPadding = composerHeight + composerBottomInset + Design.space.lg;
  const loadingOffset = composerHeight + composerBottomInset + Design.space.sm;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.centeredContent}>
          <View style={[styles.contentWidth, { maxWidth: contentWidth }]}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>AI Tutor</Text>
                <Text style={styles.headerSubtitle}>Learn faster with AI</Text>
              </View>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready</Text>
              </View>
            </View>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={[
            styles.chatListContent,
            { paddingBottom: listBottomPadding, width: contentWidth },
          ]}
          showsVerticalScrollIndicator={false}
        />

        {isLoading ? (
          <View
            style={[styles.loadingLayer, { bottom: loadingOffset }]}
            pointerEvents="none">
            <View style={[styles.contentWidth, { maxWidth: contentWidth }]}>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={Design.color.primary} />
                <Text style={styles.loadingText}>AI is thinking…</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View
          onLayout={handleComposerLayout}
          style={[styles.composerWrap, { paddingBottom: composerBottomInset }]}>
          <View style={[styles.composer, { maxWidth: contentWidth }]}>
            <TextInput
              accessibilityLabel="Ask your study companion"
              style={styles.textInput}
              placeholder="Ask anything about your studies…"
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
              <MaterialIcons name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          {__DEV__ ? <Text style={styles.helperText}>Backend: {API_BASE_URL}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Design.color.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: Design.color.canvas,
  },
  centeredContent: {
    alignItems: 'center',
    paddingHorizontal: SIDE_PADDING,
    width: '100%',
  },
  contentWidth: {
    width: '100%',
  },
  header: {
    paddingTop: Design.space.md,
    paddingBottom: Design.space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Design.space.md,
  },
  headerText: {
    flexShrink: 1,
  },
  headerTitle: {
    color: Design.color.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    color: Design.color.muted,
    fontSize: 14,
    marginTop: Design.space.xs / 2,
  },
  statusPill: {
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    paddingHorizontal: Design.space.sm + 2,
    paddingVertical: Design.space.xs + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity / 2,
    shadowRadius: Design.shadow.radius / 2,
    elevation: 1,
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
    fontWeight: '900',
  },
  chatListContent: {
    alignSelf: 'center',
    paddingHorizontal: 0,
    flexGrow: 1,
  },
  listHeader: {
    paddingBottom: Design.space.md,
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
  heroCard: {
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Design.radius.lg,
    paddingVertical: Design.space.md,
    paddingHorizontal: Design.space.md,
    marginTop: Design.space.sm,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
  },
  statPillDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  sectionLabel: {
    color: Design.color.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: Design.space.xl,
    textTransform: 'uppercase',
  },
  promptList: {
    gap: Design.space.sm,
    paddingTop: Design.space.sm,
    paddingRight: SIDE_PADDING,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.sm,
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    paddingLeft: Design.space.xs + 2,
    paddingRight: Design.space.md,
    paddingVertical: Design.space.xs + 2,
    maxWidth: 280,
  },
  promptChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    flex: 1,
    color: Design.color.text,
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  messageRow: {
    marginVertical: Design.space.xs + 2,
    flexDirection: 'row',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.sm + 2,
    borderRadius: Design.radius.md,
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity / 2,
    shadowRadius: Design.shadow.radius / 2,
    elevation: 1,
  },
  userBubble: {
    borderBottomRightRadius: Design.radius.sm / 2,
  },
  aiBubble: {
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    borderBottomLeftRadius: Design.radius.sm / 2,
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
    marginTop: Design.space.xs,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.74)',
  },
  aiTimestamp: {
    color: Design.color.muted,
  },
  loadingLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SIDE_PADDING,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.surface,
    borderColor: Design.color.border,
    borderWidth: 1,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.sm,
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity / 2,
    shadowRadius: Design.shadow.radius / 2,
    elevation: 1,
  },
  loadingText: {
    color: Design.color.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  composerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: SIDE_PADDING,
    paddingTop: Design.space.sm,
    backgroundColor: Design.color.canvas,
    borderTopWidth: 1,
    borderTopColor: Design.color.border,
  },
  composer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Design.space.sm,
    borderWidth: 1,
    borderColor: Design.color.border,
    borderRadius: Design.radius.lg,
    backgroundColor: Design.color.surface,
    paddingHorizontal: Design.space.sm,
    paddingVertical: Design.space.xs,
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity,
    shadowRadius: Design.shadow.radius,
    elevation: Design.shadow.elevation,
  },
  textInput: {
    flex: 1,
    color: Design.color.text,
    paddingHorizontal: Design.space.xs,
    paddingVertical: Design.space.sm,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 44,
    maxHeight: 116,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.primary,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  helperText: {
    color: Design.color.muted,
    fontSize: 11,
    marginTop: Design.space.xs,
    textAlign: 'center',
  },
});
