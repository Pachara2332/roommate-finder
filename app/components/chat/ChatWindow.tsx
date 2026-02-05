'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
}

export default function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
    const { messages, isLoading, isConnected, isTyping, sendMessage, startTyping, stopTyping } = useChat({ conversationId });
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        sendMessage(newMessage);
        setNewMessage('');
        stopTyping();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Handle typing indicator
        startTyping();

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 1000);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Connection Status */}
            <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                    {isConnected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ...'}
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        ยังไม่มีข้อความ เริ่มสนทนาเลย!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isMine = message.senderId === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMine
                                            ? 'bg-purple-600 text-white rounded-br-md'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                        }`}
                                >
                                    {!isMine && (
                                        <p className="text-xs text-purple-600 font-medium mb-1">
                                            {message.sender.fullName}
                                        </p>
                                    )}
                                    <p>{message.content}</p>
                                    <p className={`text-xs mt-1 ${isMine ? 'text-purple-200' : 'text-gray-500'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString('th-TH', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t bg-gray-50">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !isConnected}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ส่ง
                    </button>
                </div>
            </form>
        </div>
    );
}
