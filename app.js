import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import axios from 'axios';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const API_BASE_URL = 'http://192.168.18.241:3000';
const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  // State Management
  const [messages, setMessages] = useState([
    {
      id: '0',
      type: MESSAGE_TYPES.AI,
      text: 'Hello! 👋 I\'m your AI Study Companion. Ask me anything about your studies, and I\'ll help you learn!',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // ========================================================================
  // SEND MESSAGE HANDLER
  // ========================================================================
  const handleSendMessage = async () => {
    // Validation
    if (!inputText.trim()) {
      return;
    }

    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      type: MESSAGE_TYPES.USER,
      text: inputText.trim(),
      timestamp: new Date(),
    };

    // Add user message to state immediately (optimistic update)
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');

    // Fetch AI response
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, {
        question: userMessage.text,
        conversationHistory: messages,
      });

      // Create AI message
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: MESSAGE_TYPES.AI,
        text: response.data.answer || 'Sorry, I couldn\'t process that. Please try again.',
        timestamp: new Date(),
      };

      // Add AI message to state
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      // Handle error
      console.error('API Error:', error);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: MESSAGE_TYPES.AI,
        text: 'Oops! Something went wrong. Please check your connection and try again.',
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // RENDER MESSAGE BUBBLE
  // ========================================================================
  const renderMessage = ({ item }) => {
    const isUserMessage = item.type === MESSAGE_TYPES.USER;

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUserMessage ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUserMessage ? styles.userText : styles.aiText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isUserMessage ? styles.userTimestamp : styles.aiTimestamp,
            ]}
          >
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

  // ========================================================================
  // RENDER LOADING INDICATOR
  // ========================================================================
  const renderLoadingIndicator = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingContainer}>
        <View style={styles.messageBubble}>
          <ActivityIndicator size="small" color="#0084FF" />
          <Text style={[styles.messageText, { marginLeft: 8 }]}>
            Thinking...
          </Text>
        </View>
      </View>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Study Companion</Text>
          <Text style={styles.headerSubtitle}>Learn anything, anytime</Text>
        </View>

        {/* Chat List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatListContent}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Indicator */}
        {renderLoadingIndicator()}

        {/* Input Section */}
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
              disabled={isLoading || !inputText.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  keyboardAvoid: {
    flex: 1,
  },

  // Header
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

  // Chat List
  chatListContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  // Message Container
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

  // Message Bubble
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

  // Message Text
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

  // Timestamp
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

  // Loading
  loadingContainer: {
    paddingHorizontal: 12,
    marginVertical: 6,
    alignItems: 'flex-start',
  },

  // Input Section
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
