import { useState, useCallback } from 'react';
import { Message } from '../types/safety';
import { generateSafetyResponse } from '../services/gemini';
import { INITIAL_MESSAGE, EMERGENCY_RESOURCES } from '../constants/safety';

export const useSafetyAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (inputText: string) => {
    if (inputText.trim().length === 0 || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender,
        content: msg.text
      }));

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
  }, [messages, isLoading]);

  const showEmergencyResources = useCallback(() => {
    const emergencyMessage: Message = {
      id: Date.now().toString(),
      text: EMERGENCY_RESOURCES,
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, emergencyMessage]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    showEmergencyResources
  };
}; 