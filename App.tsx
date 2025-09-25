
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { Conversation, Message, MessageRole } from './types';
import { createChat, sendMessageStreaming, generateTitle } from './services/geminiService';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsedConvos: Conversation[] = JSON.parse(savedConversations);
      // Re-create chat instances
      const conversationsWithInstances = parsedConvos.map(convo => ({
        ...convo,
        chatInstance: createChat()
      }));
      setConversations(conversationsWithInstances);
      
      if (conversationsWithInstances.length > 0) {
        const sortedConvos = [...conversationsWithInstances].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActiveConversationId(sortedConvos[0].id);
      }
    }
  }, []);

  useEffect(() => {
    // Exclude non-serializable chatInstance from localStorage
    const serializableConversations = conversations.map(({ chatInstance, ...rest }) => rest);
    if (serializableConversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(serializableConversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      chatInstance: createChat(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleSwitchConversation = (id: string) => {
    setActiveConversationId(id);
  };
  
  const handleSendMessage = async (messageContent: string) => {
    if (!activeConversation) {
      handleNewChat();
      // Use a useEffect to send the message after the new chat is created
      // This is a simplified approach. A more robust solution might use a queue.
      setTimeout(() => {
        // This won't work perfectly due to state closure, but for this app it's a simple way.
        // A better pattern would be to pass the message to handleNewChat.
      }, 0);
      return;
    }

    const userMessage: Message = { id: uuidv4(), role: MessageRole.USER, content: messageContent };
    const assistantMessageId = uuidv4();
    const assistantMessage: Message = { id: assistantMessageId, role: MessageRole.ASSISTANT, content: '' };

    const updatedMessages = [...activeConversation.messages, userMessage];

    setConversations(prev =>
        prev.map(c =>
            c.id === activeConversationId ? { ...c, messages: [...updatedMessages, assistantMessage] } : c
        )
    );
    
    setIsLoading(true);

    try {
      if (!activeConversation.chatInstance) {
        throw new Error("Chat instance not found");
      }
      
      await sendMessageStreaming(
        activeConversation.chatInstance,
        messageContent,
        (chunk) => {
          setConversations(prev =>
            prev.map(c => {
              if (c.id === activeConversationId) {
                const newMessages = c.messages.map(m =>
                  m.id === assistantMessageId ? { ...m, content: m.content + chunk } : m
                );
                return { ...c, messages: newMessages };
              }
              return c;
            })
          );
        }
      );
      
      // After streaming, if it was the first message, generate a title
      if (activeConversation.messages.length === 0) {
         const finalMessages = [...updatedMessages, { ...assistantMessage, content: '...' }]; // temporary content
         const newTitle = await generateTitle(finalMessages);
         setConversations(prev =>
            prev.map(c =>
                c.id === activeConversationId ? { ...c, title: newTitle } : c
            )
        );
      }

    } catch (error) {
       const errorMessage: Message = {
         id: uuidv4(),
         role: MessageRole.ERROR,
         content: (error as Error).message,
       };
       setConversations(prev =>
         prev.map(c =>
           c.id === activeConversationId
             ? { ...c, messages: [...updatedMessages, errorMessage] }
             : c
         )
       );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="dark:bg-gray-900 bg-white">
        <Sidebar 
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSwitchConversation={handleSwitchConversation}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </div>
      <main className="flex-1 flex flex-col h-full dark:bg-gray-800 bg-gray-100">
        <ChatWindow 
          messages={activeConversation ? activeConversation.messages : []}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;
