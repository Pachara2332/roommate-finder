'use client';

import { use, useEffect, useState } from 'react';
import ChatWindow from '@/app/components/chat/ChatWindow';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useChat } from '@/hooks/useChat';
import Navbar from '@/app/components/Navbar';

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const { user } = useAuth();
    const resolvedParams = use(params);
    const { conversationId } = resolvedParams;
    const { conversation, isLoading } = useChat(conversationId);

    // Find other user
    const otherParticipant = conversation?.participants.find(p => p.user.id !== user?.id);
    const otherUser = otherParticipant?.user ? {
        id: otherParticipant.user.id,
        fullName: otherParticipant.user.fullName,
        profileImage: otherParticipant.user.profileImage
    } : undefined;

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
                <Navbar />
                <div className="flex-1 overflow-hidden max-w-6xl mx-auto w-full border-x border-gray-100 shadow-sm">
                    {/* We can reuse ChatWindow here */}
                    <ChatWindow conversationId={conversationId} otherUser={otherUser} />
                </div>
            </div>
        </ProtectedRoute>
    );
}
