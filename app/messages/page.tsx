'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/components/ToastContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Navbar from '@/app/components/Navbar';
import ConversationList from '@/app/components/chat/ConversationList';

export default function InboxPage() {
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); // Simple polling for list updates
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-4xl mx-auto px-6 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">ข้อความของคุณ</h1>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <ConversationList conversations={conversations} isLoading={isLoading} />
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
