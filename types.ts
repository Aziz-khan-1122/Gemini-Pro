
import { Chat } from '@google/genai';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  ERROR = 'error',
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  chatInstance?: Chat;
}
