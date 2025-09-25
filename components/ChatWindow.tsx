
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageComponent from './Message';
import MessageInput from './MessageInput';
import { GeminiIcon } from './icons';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-white">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <GeminiIcon className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-semibold">How can I help you today?</h1>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-850">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
           <WelcomeScreen />
        ) : (
            messages.map((msg, index) => <MessageComponent key={msg.id} message={msg} />)
        )}
        {isLoading && messages.length > 0 && (
          <MessageComponent 
            key="loading" 
            message={{ id: 'loading', role: 'assistant', content: '...' }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="w-full">
        <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatWindow;
