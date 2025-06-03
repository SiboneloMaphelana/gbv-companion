import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { generateSafetyResponse } from '../services/gemini';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp?: Date;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  text: "Hello, I'm your AI Safety Assistant. I'm here to help you with:\n\n• Creating safety plans\n• Finding emergency resources\n• Understanding your rights\n• Connecting with support services\n\nHow can I assist you today?",
  sender: 'assistant',
  timestamp: new Date(),
};

const EMERGENCY_RESOURCES = `EMERGENCY RESOURCES:

🚨 Police: 10111
🏥 Ambulance: 10177
📞 GBV Command Centre: 0800 428 428

If you're in immediate danger:
1. Call emergency services immediately
2. Try to move to a safe location
3. Make noise to alert neighbors
4. Use your emergency code word if you have one`;

const SafetyAssistantScreen = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(42);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim().length === 0 || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setInputHeight(42);
    setIsLoading(true);

    try {
      // Convert messages to the format expected by Gemini
      const conversationHistory = messages.map(msg => ({
        role: msg.sender,
        content: msg.text
      }));

      // Get AI response
      const response = await generateSafetyResponse(inputText, conversationHistory);

      const assistantMessage: Message = {
        id: Date.now().toString() + '-response',
        text: response.message,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: "I'm having trouble connecting. For immediate help, please call emergency services at 10111 or the GBV Command Centre at 0800 428 428.",
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergency = () => {
    const emergencyMessage: Message = {
      id: Date.now().toString(),
      text: EMERGENCY_RESOURCES,
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, emergencyMessage]);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <Surface
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.assistantMessageText,
        ]}
      >
        {item.text}
      </Text>
    </Surface>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.loadingText}>Assistant is typing...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        {!isKeyboardVisible ? (
          <View style={styles.headerWrapper}>
            <Text style={styles.header}>Safety Assistant</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
            <Text style={styles.emergencyButtonText}>Emergency Resources</Text>
          </TouchableOpacity>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={renderFooter}
        />

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { height: Math.max(42, inputHeight) }]}
              placeholder="Type your message..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              blurOnSubmit={false}
              editable={!isLoading}
              onContentSizeChange={(e) =>
                setInputHeight(e.nativeEvent.contentSize.height)
              }
            />
            <TouchableOpacity onPress={handleSend} disabled={isLoading || !inputText.trim()}>
              <Ionicons 
                name="send" 
                size={24} 
                color={isLoading || !inputText.trim() ? '#ccc' : '#007bff'} 
                style={styles.sendIcon} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerWrapper: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  emergencyButton: {
    backgroundColor: '#ff4d4d',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 6,
    padding: 10,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  inputWrapper: {
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  sendIcon: {
    marginLeft: 4,
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default SafetyAssistantScreen;
