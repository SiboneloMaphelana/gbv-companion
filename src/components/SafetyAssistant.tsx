import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types/safety';
import { useSafetyAssistant } from '../hooks/useSafetyAssistant';
import { styles } from '../styles/safetyAssistant';

const SafetyAssistantScreen = () => {
  const { messages, isLoading, sendMessage, showEmergencyResources } = useSafetyAssistant();
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

  const handleSend = async () => {
    if (inputText.trim().length === 0 || isLoading) return;
    await sendMessage(inputText);
    setInputText('');
    setInputHeight(42);
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
          <TouchableOpacity 
            style={styles.emergencyButton} 
            onPress={showEmergencyResources}
          >
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
            <TouchableOpacity 
              onPress={handleSend} 
              disabled={isLoading || !inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={isLoading || !inputText.trim() ? '#ccc' : '#007bff'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SafetyAssistantScreen;
