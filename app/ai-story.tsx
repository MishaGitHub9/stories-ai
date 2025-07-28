import { FormattedAlert } from '@/components/FormattedAlert';
import { LimitReachedModal } from '@/components/LimitReachedModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLimits } from '@/hooks/useLimits';
import { useTranslationLanguage } from '@/hooks/useTranslationLanguage';
import { claudeService, ConversationContext } from '@/services/claude';
import { TranslationService } from '@/services/translation';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simple component to render formatted text with bold, italic, and emojis
const FormattedText = ({ text, style, colorScheme }: { text: string; style: any; colorScheme: any }) => {
  const renderFormattedText = (text: string) => {
    // Split text by markdown patterns while preserving the markers
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        return (
          <Text key={index} style={[style, { fontWeight: 'bold' }]}>
            {part.slice(2, -2)}
          </Text>
        );
      } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
        // Italic text
        return (
          <Text key={index} style={[style, { fontStyle: 'italic' }]}>
            {part.slice(1, -1)}
          </Text>
        );
      } else {
        // Regular text
        return (
          <Text key={index} style={style}>
            {part}
          </Text>
        );
      }
    });
  };

  return (
    <Text style={style}>
      {renderFormattedText(text)}
    </Text>
  );
};

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user' | 'scenario';
  timestamp: Date;
}

export default function AIStoryScreen() {
  const colorScheme = useColorScheme();
  const { topic, level } = useLocalSearchParams<{ topic: string; level: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
  const { selectedLanguage, isLoading: isLanguageLoading } = useTranslationLanguage();
  const { limits, incrementStoriesGenerated, incrementMessagesSent, canPerformAction } = useLimits();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Генеруємо унікальний ID для розмови
  const conversationId = React.useMemo(() => {
    return `${topic}-${level}-${Date.now()}`;
  }, [topic, level]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Custom alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleLongPress = async (text: string, messageId: string) => {
    if (isLanguageLoading) {
      const languageFlags = {
        ukrainian: '🇺🇦',
        german: '🇩🇪',
        polish: '🇵🇱',
        french: '🇫🇷',
        spanish: '🇪🇸'
      };
      setAlertTitle('Loading');
      setAlertMessage(`${languageFlags[selectedLanguage]} Please wait while language settings are loading...`);
      setAlertVisible(true);
      return;
    }
    
    // ТЕСТУВАННЯ: Дозволяємо переклад для всіх користувачів


    // if (!limits.hasActiveSubscription) {
    //   setAlertTitle('Available with subscription only');
    //   setAlertMessage('Message translation is available only for users with subscription.');
    //   setAlertVisible(true);
    //   return;
    // }

    setTranslatingMessageId(messageId);
    
    // Show translation indicator
    const languageFlags = {
      ukrainian: '🇺🇦',
      german: '🇩🇪',
      polish: '🇵🇱',
      french: '🇫🇷',
      spanish: '🇪🇸'
    };
    
    try {
      const translation = await TranslationService.getTranslation(text, selectedLanguage);
      const languageNames = {
        ukrainian: 'Переклад',
        german: 'Übersetzung',
        polish: 'Tłumaczenie',
        french: 'Traduction',
        spanish: 'Traducción'
      };
      setAlertTitle(`${languageFlags[selectedLanguage]} ${languageNames[selectedLanguage]}`);
      setAlertMessage(translation.translation);
      setAlertVisible(true);
    } catch (error) {
      const errorMessages = {
        ukrainian: 'Error',
        german: 'Fehler',
        polish: 'Błąd',
        french: 'Erreur',
        spanish: 'Error'
      };
      const tryAgainMessages = {
        ukrainian: 'Failed to translate text. Please try again.',
        german: 'Übersetzung fehlgeschlagen. Versuchen Sie es erneut.',
        polish: 'Nie udało się przetłumaczyć tekstu. Spróbuj ponownie.',
        french: 'Échec de la traduction. Réessayez.',
        spanish: 'Error al traducir. Inténtalo de nuevo.'
      };
      setAlertTitle(`${languageFlags[selectedLanguage]} ${errorMessages[selectedLanguage]}`);
      setAlertMessage(tryAgainMessages[selectedLanguage]);
      setAlertVisible(true);
    } finally {
      setTranslatingMessageId(null);
    }
  };

  const initializeStory = async () => {
    if (!topic || !level) return;

    // Перевірка лімітів вже виконана в ai-mode.tsx
    // тому тут не потрібно перевіряти знову

    setIsLoading(true);
    
    try {
      // Generate scenario with Claude
      const scenario = await claudeService.generateScenario(topic, level);
      
      const context: ConversationContext = {
        topic,
        level: level as 'beginner' | 'intermediate' | 'advanced',
        conversationHistory: [
          { role: 'assistant', content: scenario.firstMessage }
        ],
        scenario: scenario.intro,
        conversationId: conversationId
      };
      
      setConversationContext(context);

      // Create intro and first dialogue messages
      const introMessage: Message = {
        id: '1',
        text: scenario.intro,
        sender: 'scenario',
        timestamp: new Date()
      };
      
      const firstDialogue: Message = {
        id: '2',
        text: scenario.firstMessage,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages([introMessage, firstDialogue]);
      
      // Лічильник вже збільшений в ai-mode.tsx при виборі теми та рівня
      // тому тут не потрібно збільшувати його знову
      
    } catch (error: any) {
      console.error('Error initializing story:', error);
      
      const errorMessage = error.message?.includes('overloaded') 
        ? 'AI servers are busy right now. Please try again in a moment. 🤖'
        : 'Failed to initialize AI conversation. Please check your internet connection and try again. 🌐';
        
      Alert.alert(
        'Connection Issue', 
        errorMessage,
        [
          { text: 'Retry', onPress: () => initializeStory() },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeStory();
  }, [topic, level]);

  const sendMessage = async () => {
    if (!inputText.trim() || !conversationContext || isLoading) return;

    // Check character limit
    if (inputText.length > 500) {
      setAlertTitle('Message Too Long');
      setAlertMessage('Your message exceeds the 500 character limit. Please shorten it and try again.');
      setAlertVisible(true);
      return;
    }

    // Check message limit
    if (!canPerformAction('send_message')) {
      setShowLimitModal(true);
      return;
    }
    
    const userMessageText = inputText.trim();
    setInputText('');
    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Update conversation context with user's message
      const updatedContext: ConversationContext = {
        ...conversationContext,
        conversationHistory: [
          ...conversationContext.conversationHistory,
          { role: 'user', content: userMessageText }
        ],
        conversationId: conversationId
      };

      // Generate AI response using Claude
      const aiResponseText = await claudeService.generateResponse(updatedContext, userMessageText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update context with AI response
      const finalContext: ConversationContext = {
        ...updatedContext,
        conversationHistory: [
          ...updatedContext.conversationHistory,
          { role: 'assistant', content: aiResponseText }
        ],
        conversationId: conversationId
      };
      
      setConversationContext(finalContext);
      
      await incrementMessagesSent();
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to send message. Please try again.';
      Alert.alert(
        'Connection Issue', 
        errorMessage,
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Stack.Screen
          options={{
            headerShown: false, // Приховуємо стандартний header
          }}
        />
        
        <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          {/* Custom Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {topic?.charAt(0).toUpperCase()}{topic?.slice(1)} - {level?.charAt(0).toUpperCase()}{level?.slice(1)}
            </Text>
            <View style={styles.headerSpacer} />
          </View>


          
          {/* Translation Hint */}
          <View style={styles.translationHintContainer}>
            <View style={styles.translationHint}>
              <Text style={[styles.translationHintText, { color: Colors[colorScheme ?? 'light'].icon }]}>
                 Long press to translate
              </Text>
            </View>
          </View>
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <TouchableOpacity
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.sender === 'user' ? styles.userMessage : 
                  message.sender === 'scenario' ? styles.scenarioMessage : 
                  styles.aiMessage
                ]}
                onLongPress={() => handleLongPress(message.text, message.id)}
                activeOpacity={0.8}
                disabled={translatingMessageId === message.id}
              >
                {message.sender === 'scenario' ? (
                  <FormattedText
                    text={message.text}
                    style={[styles.scenarioText, { color: Colors[colorScheme ?? 'light'].text }]}
                    colorScheme={colorScheme}
                  />
                ) : message.sender === 'ai' ? (
                  <FormattedText
                    text={message.text}
                    style={[styles.messageText, { color: Colors[colorScheme ?? 'light'].text }]}
                    colorScheme={colorScheme}
                  />
                ) : (
                  <Text style={[styles.messageText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {message.text}
                  </Text>
                )}
                {message.sender !== 'scenario' && (
                  <Text style={[styles.timestamp, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
                {translatingMessageId === message.id && (
                  <View style={styles.translatingIndicator}>
                    <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primaryPurple} />
                    <Text style={[styles.translatingText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {(() => {
                        const languageFlags = {
                          ukrainian: '🇺🇦',
                          german: '🇩🇪',
                          polish: '🇵🇱',
                          french: '🇫🇷',
                          spanish: '🇪🇸'
                        };
                        const translatingTexts = {
                          ukrainian: 'Переклад...',
                          german: 'Übersetze...',
                          polish: 'Tłumaczę...',
                          french: 'Traduction...',
                          spanish: 'Traduciendo...'
                        };
                        return `${languageFlags[selectedLanguage]} ${translatingTexts[selectedLanguage]}`;
                      })()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primaryPurple} />
                <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  AI is typing...
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={[styles.inputContainer, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: Colors[colorScheme ?? 'light'].inputBackground,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: inputText.length > 500 ? '#EF4444' : Colors[colorScheme ?? 'light'].border
                  }
                ]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                multiline
                maxLength={500}
                editable={!isLoading}
                onSubmitEditing={sendMessage}
                blurOnSubmit={false}
              />
              {/* Character Counter */}
              {inputText.length > 450 && (
                <View style={styles.characterCounterContainer}>
                  <Text style={[
                    styles.characterCounter,
                    { 
                      color: inputText.length > 500 ? '#EF4444' : 
                             inputText.length > 450 ? '#F59E0B' : 
                             Colors[colorScheme ?? 'light'].icon 
                    }
                  ]}>
                    {inputText.length}/500
                  </Text>
                </View>
              )}
            </View>
            {/* Character Limit Warning */}
            {inputText.length > 500 && (
              <View style={styles.characterLimitWarning}>
                <Text style={styles.characterLimitWarningText}>
                  ⚠️ Message too long. Please shorten it to 500 characters or less.
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  backgroundColor: inputText.trim() && !isLoading && inputText.length <= 500 ? Colors[colorScheme ?? 'light'].primaryPurple : Colors[colorScheme ?? 'light'].tabIconDefault,
                  opacity: inputText.trim() && !isLoading && inputText.length <= 500 ? 1 : 0.5
                }
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading || inputText.length > 500}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Custom Formatted Alert */}
        <FormattedAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />

        {/* Limit Reached Modal */}
        <LimitReachedModal
          visible={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          limitType="messages"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B5CF6',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
  },
  scenarioMessage: {
    alignSelf: 'center',
    backgroundColor: '#2D1B69',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    maxWidth: '90%',
    marginVertical: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  scenarioText: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 16,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    fontSize: 16,
    minHeight: 40,
    maxHeight: 150,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  translatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  translatingText: {
    marginLeft: 8,
    fontSize: 12,
    fontStyle: 'italic',
  },
  translationHintContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  translationHint: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  translationHintText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#8B5CF6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1E0B37',
    borderBottomWidth: 1,
    borderBottomColor: '#2D1B69',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40, // Adjust as needed for spacing
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    position: 'relative',
  },
  characterCounterContainer: {
    position: 'absolute',
    top: 8,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  characterCounter: {
    fontSize: 11,
    fontWeight: '600',
  },
  characterLimitWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginHorizontal: 16,
  },
  characterLimitWarningText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
 