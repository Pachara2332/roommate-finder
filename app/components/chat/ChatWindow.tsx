import { useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import MessageInput from './MessageInput';
import { useAuth } from '@/app/context/AuthContext'; // Assume this exists? Yes, seen in previous files.

interface ChatWindowProps {
    conversationId: string;
    otherUser?: {
        id: string;
        fullName: string;
        profileImage?: string | null;
    };
    onBack?: () => void; // Mobile back
}

export default function ChatWindow({ conversationId, otherUser, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const { messages, isLoading, sendMessage, sendTyping, typingUsers, isConnected } = useChat(conversationId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden text-gray-500">
                            ←
                        </button>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                        {otherUser?.profileImage ? (
                            <img src={otherUser.profileImage} alt={otherUser.fullName} className="w-full h-full object-cover" />
                        ) : (
                            otherUser?.fullName?.[0] || '?'
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">{otherUser?.fullName || 'Chat'}</h2>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            {typingUsers.length > 0 && <span className="text-xs text-gray-500 animate-pulse">กำลังพิมพ์...</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id; // Or compare ID
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex-shrink-0 overflow-hidden">
                                    {msg.sender?.profileImage && <img src={msg.sender.profileImage} className="w-full h-full object-cover" />}
                                </div>
                            )}

                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl break-words ${isMe
                                    ? 'bg-purple-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}>
                                <p>{msg.content}</p>
                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput onSendMessage={sendMessage} onTyping={sendTyping} />
        </div>
    );
}
