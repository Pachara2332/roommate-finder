'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/components/ToastContext';
import Navbar from '@/app/components/Navbar';

interface User {
    id: string;
    fullName: string;
    profileImage?: string;
}

interface Message {
    id: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    sender: User;
    receiver: User;
    listing?: {
        id: string;
        title: string;
    };
}

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const listingId = searchParams.get('listingId');
    const { showError } = useToast();

    // Unwrap params
    const resolvedParams = use(params);
    const chatPartnerId = resolvedParams.userId;

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [chatPartner, setChatPartner] = useState<User | null>(null);

    // Initial load
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setCurrentUser(JSON.parse(userData));

        // Initial fetch
        fetchMessages();

        // Polling interval
        const intervalId = setInterval(fetchMessages, 3000);

        return () => clearInterval(intervalId);
    }, [chatPartnerId]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/messages?conversationWith=${chatPartnerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.success) {
                setMessages(data.data);

                // Extract partner info from the first message found
                if (data.data.length > 0 && !chatPartner) {
                    const firstMsg = data.data[0];
                    const partner = firstMsg.sender.id === chatPartnerId ? firstMsg.sender : firstMsg.receiver;
                    setChatPartner(partner);
                } else if (!chatPartner) {
                    // If no messages yet, we might want to fetch user info separately 
                    // but for now let's hope we have messages or implemented a user fetch API
                    // We can fallback to just showing "Chat" if no info
                }
            }
        } catch (error) {
            console.error('Failed to load messages', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage;
        setNewMessage(''); // Clear input immediately

        // Optimistic update
        const tempId = Date.now().toString();
        const optimisticMessage: Message = {
            id: tempId,
            content: messageContent,
            createdAt: new Date().toISOString(),
            isRead: false,
            sender: {
                id: currentUser?.id,
                fullName: currentUser?.fullName,
                profileImage: currentUser?.profileImage
            },
            receiver: {
                id: chatPartnerId,
                fullName: chatPartner?.fullName || 'User'
            },
            listing: listingId ? { id: listingId, title: 'Loading...' } : undefined
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setIsSending(true); // Keep this to prevent double submit if needed, or remove to allow fast typing

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    receiverId: chatPartnerId,
                    content: messageContent,
                    listingId: listingId || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Replace optimistic message with real one or just fetch fresh
                // Fetching fresh ensures consistency
                fetchMessages();
            } else {
                showError('ส่งข้อความไม่สำเร็จ');
                // Revert optimistic update? For now getting fresh messages will handle sync
                fetchMessages();
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการส่งข้อความ');
            // Revert on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading && !messages.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Navbar />
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link href="/messages" className="text-gray-500 hover:text-gray-900 transition-colors">
                        ← กลับ
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {chatPartner?.fullName?.[0] || '?'}
                        </div>
                        <h1 className="font-bold text-gray-900">
                            {chatPartner?.fullName || 'Chat'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-5xl mb-4">👋</p>
                        <p>เริ่มทักทายเลย!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender.id === currentUser?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
                                        }`}
                                >
                                    {msg.listing && (
                                        <div className={`text-xs mb-2 pb-2 border-b ${isMe ? 'border-white/20' : 'border-gray-100'} flex items-center gap-1`}>
                                            🏠 <span className="font-medium">{msg.listing.title}</span>
                                        </div>
                                    )}
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 px-6 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? '...' : 'ส่ง'}
                    </button>
                </form>
            </div>
        </div>
    );
}
