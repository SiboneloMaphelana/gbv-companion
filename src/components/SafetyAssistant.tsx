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
} from 'react-native';
import { Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
}

const SafetyAssistantScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! I am your Safety Assistant. How can I help you today?',
      sender: 'assistant',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(42);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
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

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText('');
    setInputHeight(42);

    // Simulate assistant reply
    setTimeout(() => {
      const reply: Message = {
        id: Date.now().toString() + '-r',
        text: 'Thank you for your message. Help is on the way.',
        sender: 'assistant',
      };
      setMessages((prevMessages) => [...prevMessages, reply]);
    }, 1000);
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
          <TouchableOpacity style={styles.emergencyButton}>
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
              onContentSizeChange={(e) =>
                setInputHeight(e.nativeEvent.contentSize.height)
              }
            />
            <TouchableOpacity onPress={handleSend}>
              <Ionicons name="send" size={24} color="#007bff" style={styles.sendIcon} />
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
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#000',
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
  },
});

export default SafetyAssistantScreen;
