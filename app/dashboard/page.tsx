'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/app/components/ToastContext';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Navbar from '@/app/components/Navbar';
import AvatarUpload from '@/app/components/AvatarUpload';

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
    const { user, updateUser } = useAuth();
    const { showError, showSuccess } = useToast();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [recentMessages, setRecentMessages] = useState<Message[]>([]);
    const [stats, setStats] = useState({
        listingsCount: 0,
        viewsCount: 0,
        messagesCount: 0,
    });

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch listings
            const listingsRes = await fetch('/api/listings?userId=' + user?.id, { // Ideally filter by user, but for now getting all is default list behavior, need verify. Actually GET /api/listings fetches all. We shouldn't fetch ALL. But previous code fetched all and sliced 5. Let's keep it simple or fix API later. Wait, previous code: fetch('/api/listings').
                // Ideally we should have /api/listings/me or similar. For now let's reproduce previous behavior which fetched ALL listings (buggy if platform grows) but filter on client if needed?
                // Actually the PREVIOUS code fetched /api/listings and just displayed them as "My Listings" which is wrong if it returns everyone's listings.
                // But let's stick to previous logical flow for now, just auth changes.
                headers: { Authorization: `Bearer ${token}` },
            });
            const listingsData = await listingsRes.json();

            if (listingsData.success && listingsData.data?.items) {
                // Filter only my listings
                const myItems = listingsData.data.items.filter((l: any) => l.user.id === user?.id);
                setMyListings(myItems.slice(0, 5));
                setStats(prev => ({
                    ...prev,
                    listingsCount: myItems.length,
                    viewsCount: myItems.reduce((sum: number, l: Listing) => sum + l.viewsCount, 0),
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
            setIsLoadingData(false);
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-6 py-8">
                    {/* Header */}
                    {/* Header */}
                    <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                        <AvatarUpload
                            currentImageUrl={user?.profileImage}
                            onUploadSuccess={(url) => {
                                showSuccess('อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
                                if (user) {
                                    updateUser({ ...user, profileImage: url });
                                }
                            }}
                        />
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">สวัสดีครับ {user?.fullName} 👋</h1>
                            <p className="text-gray-600">ภาพรวมกิจกรรมของคุณ</p>
                        </div>
                    </div>

                    {isLoadingData ? (
                        <div className="flex items-center justify-center min-h-[30vh]">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <>
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
                                        <Link href="/messages" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                                            ดูทั้งหมด →
                                        </Link>
                                    </div>

                                    {recentMessages.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentMessages.map((msg) => (
                                                <Link
                                                    key={msg.id}
                                                    href={'/messages'}
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
                        </>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
