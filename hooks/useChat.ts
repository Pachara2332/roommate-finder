'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
}

interface UseChatOptions {
  conversationId: string;
}

export function useChat({ conversationId }: UseChatOptions) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Join conversation room
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit('join_conversation', conversationId);

    return () => {
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, isConnected, conversationId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.userId);
      }
    };

    const handleUserStoppedTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setIsTyping(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, conversationId]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/conversations/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (data.success && data.data?.messages) {
          setMessages(data.data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (!socket || !isConnected || !content.trim()) return;

    socket.emit('send_message', {
      conversationId,
      content: content.trim(),
    });
  }, [socket, isConnected, conversationId]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit('typing_start', conversationId);
  }, [socket, isConnected, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit('typing_stop', conversationId);
  }, [socket, isConnected, conversationId]);

  return {
    messages,
    isLoading,
    isConnected,
    isTyping,
    sendMessage,
    startTyping,
    stopTyping,
  };
}
