'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/app/components/ImageUpload';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useToast } from '@/app/components/ToastContext';
import { PROVINCES, FURNITURE_OPTIONS } from '@/lib/thai-data';

export default function CreateListingPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
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
        amenities: [] as string[],
        images: [] as string[],
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAmenityChange = (amenityId: string) => {
        setFormData(prev => {
            const current = prev.amenities;
            if (current.includes(amenityId)) {
                return { ...prev, amenities: current.filter(id => id !== amenityId) };
            } else {
                return { ...prev, amenities: [...current, amenityId] };
            }
        });
    };

    const handleImageChange = (urls: string[]) => {
        setFormData(prev => ({
            ...prev,
            images: urls
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.images.length < 3) {
            showError('กรุณาอัปโหลดรูปภาพอย่างน้อย 3 รูป');
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                    furnished: formData.amenities.length > 0 || formData.furnished, // Auto-set if amenities selected
                    petsAllowed: formData.petsAllowed,
                    smokingAllowed: formData.smokingAllowed,
                    amenities: formData.amenities,
                    images: formData.images,
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create listing');
            }

            const listing = await response.json();

            showSuccess('สร้างประกาศสำเร็จ');
            router.push(`/listings/${listing.data.id}`);
        } catch (error: any) {
            console.error('Error creating listing:', error);
            showError(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-3xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">สร้างประกาศใหม่</h1>
                        <p className="text-gray-600 mb-8">กรอกข้อมูลเพื่อหารูมเมทของคุณ</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    รูปภาพห้องพัก ({formData.images.length}/7) <span className="text-red-500">* (ขั้นต่ำ 3 รูป)</span>
                                </label>
                                <ImageUpload
                                    value={formData.images}
                                    onChange={handleImageChange}
                                    maxFiles={7}
                                />
                            </div>

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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-500"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                                    >
                                        <option value="">เลือกจังหวัด</option>
                                        {PROVINCES.map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Amenities / Furniture */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    สิ่งอำนวยความสะดวก & เฟอร์นิเจอร์
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {FURNITURE_OPTIONS.map(option => (
                                        <label key={option.id} className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100">
                                            <input
                                                type="checkbox"
                                                checked={formData.amenities.includes(option.id)}
                                                onChange={() => handleAmenityChange(option.id)}
                                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                            <span className="text-gray-700 text-sm">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Options */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    เพิ่มเติม
                                </label>
                                <div className="flex flex-wrap gap-4">
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
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all hover:scale-[1.01] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        </ProtectedRoute>
    );
}
