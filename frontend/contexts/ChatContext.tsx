"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

// Pending prompt that needs to be sent to the backend (from landing page)
export interface PendingPrompt {
  content: string;
  timestamp: number;
}

function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setMessages: (messages: ChatMessage[]) => void;
  // Pending prompt from landing page that should trigger API call
  pendingPrompt: PendingPrompt | null;
  setPendingPrompt: (prompt: PendingPrompt | null) => void;
  // Stable session ID for Langfuse analytics — rotates only on chat clear
  chatSessionId: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Initialize with just the welcome message - no persistence
  const [messages, setMessagesState] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant' as const,
      content: `Welcome to MoonKnight, I'm your AI assistant. I'm ready to help you build Compact smart contracts and frontends.`,
      timestamp: Date.now(),
    },
  ]);

  // Stable session ID for Langfuse — rotates only when user clears chat
  const [chatSessionId, setChatSessionId] = useState<string>(generateSessionId);

  // Pending prompt from landing page that needs to trigger API call
  const [pendingPrompt, setPendingPromptState] = useState<PendingPrompt | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setMessagesState((prev) => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to MoonKnight, I'm your AI assistant. I'm ready to help you build Compact smart contracts and frontends.`,
      timestamp: Date.now(),
    };
    setMessagesState([welcomeMessage]);
    // Rotate session ID — new conversation = new Langfuse session
    setChatSessionId(generateSessionId());
  }, []);

  const setMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessagesState(newMessages);
  }, []);

  const setPendingPrompt = useCallback((prompt: PendingPrompt | null) => {
    setPendingPromptState(prompt);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages, setMessages, pendingPrompt, setPendingPrompt, chatSessionId }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
