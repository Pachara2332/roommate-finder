import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';

interface Message {
    id: string;
    content: string;
    senderId: string;
    conversationId: string; // Add this
    createdAt: string;
    sender: {
        id: string;
        fullName: string;
        profileImage: string | null;
    };
}

interface ConversationData {
    id: string;
    participants: { user: { id: string; fullName: string; profileImage: string | null } }[];
    listing?: { title: string; id: string };
}

export const useChat = (conversationId: string | null) => {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<ConversationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    // Load initial messages
    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/conversations/${conversationId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setMessages(data.data.messages);
                    setConversation(data.data);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [conversationId]);

    // Socket event listeners
    useEffect(() => {
        if (!socket || !conversationId) return;

        socket.emit('join_conversation', conversationId);

        const handleReceiveMessage = (message: Message) => {
            if (message.conversationId === conversationId) { // Check if message belongs to current chat (though we join room, extra safety)
                setMessages(prev => [...prev, message]);
            }
        };

        const handleTypingStart = ({ userId }: { userId: string }) => {
            setTypingUsers(prev => new Set(prev).add(userId));
        };

        const handleTypingStop = ({ userId }: { userId: string }) => {
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('typing_start', handleTypingStart);
        socket.on('typing_stop', handleTypingStop);

        return () => {
            socket.emit('leave_conversation', conversationId);
            socket.off('receive_message', handleReceiveMessage);
            socket.off('typing_start', handleTypingStart);
            socket.off('typing_stop', handleTypingStop);
        };
    }, [socket, conversationId]);

    const sendMessage = useCallback((content: string) => {
        if (!socket || !conversationId) return;

        // Optimistic update? Maybe later. For now, rely on socket readback or backend confirm.
        // Actually, we should probably append optimistically to UI.
        // But for simplicity, let's wait for socket broadcast (or echo back).
        // Wait, socket.io broadcast usually excludes sender.
        // So sender *must* optimistically update or use ack.
        // My server code: `io.to(...).emit`. This includes sender if sender is in room?
        // Yes, `io.to` includes sender. `socket.to` excludes sender.
        // My `server.ts` used `io.to`. So sender will receive the message back. 
        // So no need for optimistic add if latency is low.

        socket.emit('send_message', { conversationId, content });
    }, [socket, conversationId]);

    const sendTyping = useCallback((isTyping: boolean) => {
        if (!socket || !conversationId) return;
        socket.emit(isTyping ? 'typing_start' : 'typing_stop', conversationId);
    }, [socket, conversationId]);

    return {
        messages,
        conversation,
        isLoading,
        isConnected,
        sendMessage,
        typingUsers: Array.from(typingUsers),
        sendTyping
    };
};
