import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios, { isAxiosError } from 'axios';

const API_BASE_URL = 'http://192.168.18.241:3000';
const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
} as const;

type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

type Message = {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: MESSAGE_TYPES.AI,
      text: "Hello! I'm your AI Study Companion. Ask me anything about your studies, and I'll help you learn!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: MESSAGE_TYPES.USER,
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, {
        question: userMessage.text,
        conversationHistory: messages,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: MESSAGE_TYPES.AI,
        text: response.data.answer || "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('API Error:', error);

      const errorText = isAxiosError(error)
        ? error.response?.data?.error ||
          'Could not reach the study server. Please check your connection and try again.'
        : 'Oops! Something went wrong. Please try again.';

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: MESSAGE_TYPES.AI,
        text: errorText,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    const isUserMessage = item.type === MESSAGE_TYPES.USER;

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isUserMessage ? styles.userBubble : styles.aiBubble,
          ]}>
          <Text style={[styles.messageText, isUserMessage ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isUserMessage ? styles.userTimestamp : styles.aiTimestamp,
            ]}>
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

  const renderLoadingIndicator = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingContainer}>
        <View style={[styles.messageBubble, styles.loadingBubble]}>
          <ActivityIndicator size="small" color="#0084FF" />
          <Text style={[styles.messageText, styles.loadingText]}>Thinking...</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Study Companion</Text>
          <Text style={styles.headerSubtitle}>Learn anything, anytime</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatListContent}
          showsVerticalScrollIndicator={false}
        />

        {renderLoadingIndicator()}

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask a question..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              editable={!isLoading}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (isLoading || !inputText.trim()) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={isLoading || !inputText.trim()}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#65676B',
  },
  chatListContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#0084FF',
  },
  aiBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFF',
  },
  aiText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#65676B',
  },
  loadingContainer: {
    paddingHorizontal: 12,
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  loadingBubble: {
    backgroundColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000',
    marginLeft: 8,
  },
  inputSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
