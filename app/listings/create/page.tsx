'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/app/components/ToastContext';

export default function CreateListingPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'OFFERING_ROOM',
        title: '',
        description: '',
        locationProvince: '',
        locationDistrict: '',
        locationAddress: '',
        rentPrice: '',
        deposit: '',
        availableFrom: '',
        roomType: '',
        totalRooms: '1',
        totalBathrooms: '1',
        sizeSqm: '',
        furnished: false,
        petsAllowed: false,
        smokingAllowed: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            showError('กรุณาเข้าสู่ระบบก่อน');
            router.push('/login');
            return;
        }

        // Validation
        if (formData.title.length < 10) {
            showError('หัวข้อต้องมีอย่างน้อย 10 ตัวอักษร');
            return;
        }
        if (formData.description.length < 50) {
            showError('รายละเอียดต้องมีอย่างน้อย 50 ตัวอักษร');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: formData.type,
                    title: formData.title,
                    description: formData.description,
                    locationProvince: formData.locationProvince,
                    locationDistrict: formData.locationDistrict,
                    locationAddress: formData.locationAddress,
                    rentPrice: parseInt(formData.rentPrice),
                    deposit: formData.deposit ? parseInt(formData.deposit) : undefined,
                    availableFrom: formData.availableFrom || new Date().toISOString(),
                    roomType: formData.roomType,
                    totalRooms: parseInt(formData.totalRooms),
                    totalBathrooms: parseInt(formData.totalBathrooms),
                    sizeSqm: formData.sizeSqm ? parseFloat(formData.sizeSqm) : undefined,
                    furnished: formData.furnished,
                    petsAllowed: formData.petsAllowed,
                    smokingAllowed: formData.smokingAllowed,
                }),
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('สร้างประกาศสำเร็จ!');
                router.push('/dashboard');
            } else {
                showError(data.error || 'เกิดข้อผิดพลาดในการสร้างประกาศ');
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
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
                        ← กลับไปหน้าประกาศ
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">สร้างประกาศใหม่</h1>
                    <p className="text-gray-600 mb-8">กรอกข้อมูลเพื่อหารูมเมทของคุณ</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ประเภทประกาศ *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="OFFERING_ROOM">มีห้องให้เช่า</option>
                                <option value="SEEKING_ROOMMATE">หาเพื่อนร่วมห้อง</option>
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                หัวข้อประกาศ * (อย่างน้อย 10 ตัวอักษร)
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="เช่น หาเพื่อนร่วมคอนโด ใกล้ BTS อโศก"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                รายละเอียด * (อย่างน้อย 50 ตัวอักษร)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                placeholder="รายละเอียดเกี่ยวกับห้อง สิ่งอำนวยความสะดวก และลักษณะรูมเมทที่ต้องการ"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Location */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    จังหวัด *
                                </label>
                                <select
                                    name="locationProvince"
                                    value={formData.locationProvince}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                >
                                    <option value="">เลือกจังหวัด</option>
                                    <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                                    <option value="นนทบุรี">นนทบุรี</option>
                                    <option value="ปทุมธานี">ปทุมธานี</option>
                                    <option value="สมุทรปราการ">สมุทรปราการ</option>
                                    <option value="เชียงใหม่">เชียงใหม่</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    เขต/อำเภอ *
                                </label>
                                <input
                                    type="text"
                                    name="locationDistrict"
                                    value={formData.locationDistrict}
                                    onChange={handleChange}
                                    required
                                    placeholder="เช่น วัฒนา"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ที่อยู่ * (อย่างน้อย 10 ตัวอักษร)
                            </label>
                            <input
                                type="text"
                                name="locationAddress"
                                value={formData.locationAddress}
                                onChange={handleChange}
                                required
                                placeholder="เช่น 123 ซอยสุขุมวิท 23"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Price and Room Type */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ค่าเช่า/เดือน (บาท) *
                                </label>
                                <input
                                    type="number"
                                    name="rentPrice"
                                    value={formData.rentPrice}
                                    onChange={handleChange}
                                    required
                                    placeholder="8500"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ประเภทห้อง *
                                </label>
                                <select
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                >
                                    <option value="">เลือกประเภทห้อง</option>
                                    <option value="PRIVATE">ห้องส่วนตัว</option>
                                    <option value="SHARED">ห้องแชร์</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ค่ามัดจำ (บาท)
                                </label>
                                <input
                                    type="number"
                                    name="deposit"
                                    value={formData.deposit}
                                    onChange={handleChange}
                                    placeholder="17000"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ขนาดห้อง (ตร.ม.)
                                </label>
                                <input
                                    type="number"
                                    name="sizeSqm"
                                    value={formData.sizeSqm}
                                    onChange={handleChange}
                                    placeholder="25"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    จำนวนห้องนอน
                                </label>
                                <input
                                    type="number"
                                    name="totalRooms"
                                    value={formData.totalRooms}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    จำนวนห้องน้ำ
                                </label>
                                <input
                                    type="number"
                                    name="totalBathrooms"
                                    value={formData.totalBathrooms}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                ตัวเลือก
                            </label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="furnished"
                                        checked={formData.furnished}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-gray-700 text-sm">มีเฟอร์นิเจอร์</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="petsAllowed"
                                        checked={formData.petsAllowed}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-gray-700 text-sm">อนุญาตเลี้ยงสัตว์</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="smokingAllowed"
                                        checked={formData.smokingAllowed}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-gray-700 text-sm">อนุญาตสูบบุหรี่</span>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all hover:scale-[1.01] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        กำลังสร้างประกาศ...
                                    </span>
                                ) : (
                                    'ลงประกาศ'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
