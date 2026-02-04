'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ToastContext';
import Image from 'next/image';

interface ListingDetail {
    id: string;
    title: string;
    description: string;
    locationProvince: string;
    locationDistrict: string;
    locationAddress: string;
    rentPrice: number;
    deposit?: number;
    availableFrom: string;
    roomType: string;
    numRoommatesWanted?: number;
    totalRooms: number;
    totalBathrooms: number;
    sizeSqm?: number;
    furnished: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    status: string;
    viewsCount: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        profileImage?: string;
        gender?: string;
        occupation?: string;
    };
    images: {
        id: string;
        imageUrl: string;
    }[];
    amenities: string[];
}

export default function ListingDetailPage({ params }: { params: Promise<{ listingId: string }> }) {
    const router = useRouter();
    const { showError } = useToast();
    const [listing, setListing] = useState<ListingDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Unwrap params
    const resolvedParams = use(params);
    const listingId = resolvedParams.listingId;

    useEffect(() => {
        // Get current user
        const userData = localStorage.getItem('user');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }

        fetchListingDetail();
    }, [listingId]);

    const fetchListingDetail = async () => {
        try {
            const response = await fetch(`/api/listings/${listingId}`);
            const data = await response.json();

            if (data.success) {
                setListing(data.data);
            } else {
                showError('ไม่พบประกาศนี้');
                router.push('/listings');
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!listing) return null;

    const isOwner = currentUser?.id === listing.user.id;

    const handleChat = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiverId: listing.user.id,
                    listingId: listing.id
                })
            });

            const data = await res.json();

            if (data.success) {
                router.push(`/messages/${data.data.id}`);
            } else {
                showError(data.error || 'ไม่สามารถเริ่มการสนทนาได้');
            }
        } catch (error) {
            console.error('Chat error:', error);
            showError('เกิดข้อผิดพลาดในการเริ่มการสนทนา');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-purple-900 tracking-tight">
                        🏠 RoommateFinder
                    </Link>
                    <Link
                        href="/listings"
                        className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        ← ย้อนกลับ
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Image Gallery */}
                {/* Image Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 h-[400px]">
                    <div className="relative h-full bg-gray-200 rounded-2xl overflow-hidden group">
                        {listing.images[0] ? (
                            <Image
                                src={listing.images[0].imageUrl}
                                alt={listing.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                priority
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-6xl text-gray-400">🖼️</div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 h-full">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="relative bg-gray-200 rounded-2xl overflow-hidden group">
                                {listing.images[index] ? (
                                    <Image
                                        src={listing.images[index].imageUrl}
                                        alt={`${listing.title} ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-4xl text-gray-400">📷</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 font-medium rounded-full text-sm">
                                    {listing.roomType === 'PRIVATE' ? 'ห้องส่วนตัว' : 'ห้องแชร์'}
                                </span>
                                <span className="text-gray-500 flex items-center gap-1">
                                    📍 {listing.locationDistrict}, {listing.locationProvince}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                            <p className="text-3xl font-bold text-purple-600">
                                ฿{listing.rentPrice.toLocaleString()} <span className="text-base font-normal text-gray-500">/เดือน</span>
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">ห้องนอน</p>
                                <p className="font-semibold">{listing.totalRooms}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">ห้องน้ำ</p>
                                <p className="font-semibold">{listing.totalBathrooms}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">ขนาด</p>
                                <p className="font-semibold">{listing.sizeSqm ? `${listing.sizeSqm} ตร.ม.` : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">ว่างเมื่อ</p>
                                <p className="font-semibold">{new Date(listing.availableFrom).toLocaleDateString('th-TH')}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">รายละเอียด</h2>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed break-words">
                                {listing.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">สิ่งอำนวยความสะดวก</h2>
                            <div className="flex flex-wrap gap-4">
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${listing.furnished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    🪑 เฟอร์นิเจอร์: {listing.furnished ? 'มี' : 'ไม่มี'}
                                </div>
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${listing.petsAllowed ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    🐶 เลี้ยงสัตว์: {listing.petsAllowed ? 'ได้' : 'ไม่ได้'}
                                </div>
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${listing.smokingAllowed ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    🚬 สูบบุหรี่: {listing.smokingAllowed ? 'ได้' : 'ไม่ได้'}
                                </div>
                            </div>
                        </div>

                        {/* Map (Placeholder) */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">สถานที่ตั้ง</h2>
                            <div className="bg-gray-100 h-64 rounded-2xl flex items-center justify-center text-gray-400">
                                🗺️ แผนที่ ({listing.locationAddress})
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Owner Info */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">ผู้ลงประกาศ</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                                    {listing.user.fullName[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{listing.user.fullName}</p>
                                    <p className="text-sm text-gray-500">{listing.user.occupation || 'สมาชิก'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">เพศ</span>
                                    <span className="font-medium">{listing.user.gender === 'MALE' ? 'ชาย' : listing.user.gender === 'FEMALE' ? 'หญิง' : 'อื่นๆ'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ลงเมื่อ</span>
                                    <span className="font-medium">{new Date(listing.createdAt).toLocaleDateString('th-TH')}</span>
                                </div>
                            </div>

                            {isOwner ? (
                                <button className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold cursor-not-allowed">
                                    นี่คือประกาศของคุณ
                                </button>
                            ) : (
                                <button
                                    onClick={handleChat}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all hover:scale-105"
                                >
                                    💬 ทักแชท
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
