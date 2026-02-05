'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/app/components/ToastContext';
import Navbar from '@/app/components/Navbar';
import { useListingStore } from '@/stores';

interface Listing {
    id: string;
    title: string;
    locationProvince: string;
    locationDistrict: string;
    rentPrice: number;
    roomType: string;
    user: {
        fullName: string;
    };
}

export default function ListingsPage() {
    const { showError } = useToast();
    const { filters, setFilters, setListings: setGlobalListings } = useListingStore();
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.locationProvince) params.set('locationProvince', filters.locationProvince);
            if (filters.minPrice) params.set('minPrice', filters.minPrice);
            if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
            if (filters.roomType) params.set('roomType', filters.roomType);
            if (filters.furnished) params.set('furnished', 'true');

            const response = await fetch(`/api/listings?${params.toString()}`);
            const data = await response.json();

            if (data.success && data.data?.items) {
                setListings(data.data.items);
                setGlobalListings(data.data.items);
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการโหลดประกาศ');
        } finally {
            setIsLoading(false);
        }
    };

    const [localFilters, setLocalFilters] = useState({
        locationProvince: filters.locationProvince,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        roomType: filters.roomType,
        furnished: filters.furnished,
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setLocalFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearch = () => {
        setFilters(localFilters);
        fetchListings();
    };

    const getRoomTypeIcon = (roomType: string) => {
        return roomType === 'PRIVATE' ? '🏢' : '🏠';
    };

    const getRoomTypeLabel = (roomType: string) => {
        return roomType === 'PRIVATE' ? 'ห้องส่วนตัว' : 'ห้องแชร์';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar variant="light" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">ประกาศหารูมเมททั้งหมด</h1>
                    <p className="text-gray-600">พบ {listings.length} ประกาศที่ตรงกับการค้นหาของคุณ</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
                    <div className="grid md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">พื้นที่</label>
                            <select
                                name="locationProvince"
                                value={filters.locationProvince}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                            >
                                <option value="">ทุกพื้นที่</option>
                                <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                                <option value="นนทบุรี">นนทบุรี</option>
                                <option value="ปทุมธานี">ปทุมธานี</option>
                                <option value="สมุทรปราการ">สมุทรปราการ</option>
                                <option value="เชียงใหม่">เชียงใหม่</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ราคาต่ำสุด</label>
                            <select
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                            >
                                <option value="">ไม่จำกัด</option>
                                <option value="3000">3,000 บาท</option>
                                <option value="5000">5,000 บาท</option>
                                <option value="7000">7,000 บาท</option>
                                <option value="10000">10,000 บาท</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ราคาสูงสุด</label>
                            <select
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                            >
                                <option value="">ไม่จำกัด</option>
                                <option value="5000">5,000 บาท</option>
                                <option value="10000">10,000 บาท</option>
                                <option value="15000">15,000 บาท</option>
                                <option value="20000">20,000 บาท</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทห้อง</label>
                            <select
                                name="roomType"
                                value={filters.roomType}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                            >
                                <option value="">ทุกประเภท</option>
                                <option value="PRIVATE">ห้องส่วนตัว</option>
                                <option value="SHARED">ห้องแชร์</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors w-full border border-gray-200">
                                <input
                                    type="checkbox"
                                    name="furnished"
                                    checked={filters.furnished}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-gray-700 font-medium">มีเฟอร์นิเจอร์</span>
                            </label>
                        </div>
                        <div className="col-span-1 md:col-span-5 lg:col-span-1 flex items-end">
                            <button
                                onClick={handleSearch}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                            >
                                🔍 ค้นหา
                            </button>
                        </div>

                    </div>
                </div>

                {/* Listings Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <Link
                                key={listing.id}
                                href={`/listings/${listing.id}`}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group"
                            >
                                {/* Image placeholder */}
                                <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-6xl">
                                    {getRoomTypeIcon(listing.roomType)}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                            {getRoomTypeLabel(listing.roomType)}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">
                                        {listing.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                                        📍 {listing.locationDistrict}, {listing.locationProvince}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-2xl font-bold text-purple-600">
                                            ฿{listing.rentPrice.toLocaleString()}
                                            <span className="text-sm font-normal text-gray-400">/เดือน</span>
                                        </p>
                                        <span className="text-sm text-gray-500">
                                            โดย {listing.user.fullName}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-5xl mb-4">🏠</p>
                        <p className="text-xl mb-2">ไม่พบประกาศที่ตรงกับการค้นหา</p>
                        <p>ลองเปลี่ยนตัวกรองหรือสร้างประกาศใหม่</p>
                    </div>
                )}
            </main>
        </div>
    );
}
