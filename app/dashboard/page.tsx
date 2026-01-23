'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ToastContext';

interface Listing {
    id: string;
    title: string;
    status: string;
    viewsCount: number;
    createdAt: string;
}

interface Message {
    id: string;
    sender: { fullName: string };
    content: string;
    createdAt: string;
    isRead: boolean;
}

export default function DashboardPage() {
    const router = useRouter();
    const { showError } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [recentMessages, setRecentMessages] = useState<Message[]>([]);
    const [stats, setStats] = useState({
        listingsCount: 0,
        viewsCount: 0,
        messagesCount: 0,
    });

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            router.push('/login');
            return;
        }

        try {
            const userData = JSON.parse(user);
            setUserName(userData.fullName);
        } catch {
            router.push('/login');
            return;
        }

        fetchDashboardData(token);
    }, [router]);

    const fetchDashboardData = async (token: string) => {
        try {
            // Fetch listings
            const listingsRes = await fetch('/api/listings', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const listingsData = await listingsRes.json();

            if (listingsData.success && listingsData.data?.items) {
                setMyListings(listingsData.data.items.slice(0, 5));
                setStats(prev => ({
                    ...prev,
                    listingsCount: listingsData.data.total || 0,
                    viewsCount: listingsData.data.items.reduce((sum: number, l: Listing) => sum + l.viewsCount, 0),
                }));
            }

            // Fetch messages
            const messagesRes = await fetch('/api/messages', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const messagesData = await messagesRes.json();

            if (messagesData.success && messagesData.data) {
                setRecentMessages(messagesData.data.slice(0, 5));
                setStats(prev => ({
                    ...prev,
                    messagesCount: messagesData.data.filter((m: Message) => !m.isRead).length,
                }));
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ชม.ที่แล้ว`;
        return formatDate(dateString);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">สวัสดีครับ {userName} 👋</h1>
                <p className="text-gray-600">ภาพรวมกิจกรรมของคุณ</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">📋</span>
                        <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                            ทั้งหมด
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats.listingsCount}</p>
                    <p className="text-gray-500">ประกาศของฉัน</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">👁️</span>
                        <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                            รวม
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats.viewsCount}</p>
                    <p className="text-gray-500">การเข้าชม</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">💬</span>
                        <span className="text-sm text-pink-600 bg-pink-100 px-3 py-1 rounded-full font-medium">
                            {stats.messagesCount} ใหม่
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats.messagesCount}</p>
                    <p className="text-gray-500">ข้อความใหม่</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* My Listings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">ประกาศของฉัน</h2>
                        <Link href="/listings/create" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            + สร้างใหม่
                        </Link>
                    </div>

                    {myListings.length > 0 ? (
                        <div className="space-y-4">
                            {myListings.map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/listings/${listing.id}`}
                                    className="block p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${listing.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {listing.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>👁️ {listing.viewsCount}</span>
                                        <span className="ml-auto">{formatDate(listing.createdAt)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="mb-4">ยังไม่มีประกาศ</p>
                            <Link
                                href="/listings/create"
                                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                สร้างประกาศแรก
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Messages */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">ข้อความล่าสุด</h2>
                        <Link href="/dashboard/messages" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            ดูทั้งหมด →
                        </Link>
                    </div>

                    {recentMessages.length > 0 ? (
                        <div className="space-y-4">
                            {recentMessages.map((msg) => (
                                <Link
                                    key={msg.id}
                                    href="/dashboard/messages"
                                    className={`block p-4 rounded-xl transition-colors ${!msg.isRead ? 'bg-purple-50 hover:bg-purple-100' : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                                            {msg.sender.fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className={`font-semibold ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {msg.sender.fullName}
                                                </p>
                                                <span className="text-xs text-gray-400">{formatTimeAgo(msg.createdAt)}</span>
                                            </div>
                                            <p className={`text-sm line-clamp-1 ${!msg.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                                                {msg.content}
                                            </p>
                                        </div>
                                        {!msg.isRead && (
                                            <span className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-2"></span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>ยังไม่มีข้อความ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
