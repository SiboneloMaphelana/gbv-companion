export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp?: Date;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
} 