"use client";

import { useState } from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">ตั้งค่า</h1>
                <p className="text-gray-600">จัดการบัญชีและการตั้งค่าของคุณ</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-4 px-2 font-medium transition-colors ${activeTab === "profile"
                            ? "text-purple-600 border-b-2 border-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    โปรไฟล์
                </button>
                <button
                    onClick={() => setActiveTab("notifications")}
                    className={`pb-4 px-2 font-medium transition-colors ${activeTab === "notifications"
                            ? "text-purple-600 border-b-2 border-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    การแจ้งเตือน
                </button>
                <button
                    onClick={() => setActiveTab("security")}
                    className={`pb-4 px-2 font-medium transition-colors ${activeTab === "security"
                            ? "text-purple-600 border-b-2 border-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    ความปลอดภัย
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="max-w-2xl">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        {/* Avatar */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-4xl text-white">
                                👤
                            </div>
                            <div>
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                                    เปลี่ยนรูปภาพ
                                </button>
                                <p className="text-sm text-gray-500 mt-2">JPG, PNG ขนาดไม่เกิน 2MB</p>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        ชื่อ
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="สมชาย"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        นามสกุล
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="ใจดี"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    อีเมล
                                </label>
                                <input
                                    type="email"
                                    defaultValue="somchai@example.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="tel"
                                    defaultValue="081-234-5678"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    แนะนำตัว
                                </label>
                                <textarea
                                    rows={4}
                                    defaultValue="สวัสดีครับ ผมกำลังหาห้องพักย่านสุขุมวิท"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
                            >
                                บันทึกการเปลี่ยนแปลง
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
                <div className="max-w-2xl">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <p className="font-semibold text-gray-900">ข้อความใหม่</p>
                                <p className="text-sm text-gray-500">รับการแจ้งเตือนเมื่อมีข้อความใหม่</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <p className="font-semibold text-gray-900">ประกาศถูกดู</p>
                                <p className="text-sm text-gray-500">รับการแจ้งเตือนเมื่อมีคนดูประกาศของคุณ</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <p className="font-semibold text-gray-900">ข่าวสารและโปรโมชั่น</p>
                                <p className="text-sm text-gray-500">รับข่าวสารและโปรโมชั่นพิเศษ</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-semibold text-gray-900">การแจ้งเตือนทางอีเมล</p>
                                <p className="text-sm text-gray-500">รับการแจ้งเตือนผ่านอีเมล</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
                <div className="max-w-2xl space-y-6">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">เปลี่ยนรหัสผ่าน</h3>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    รหัสผ่านปัจจุบัน
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    รหัสผ่านใหม่
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ยืนยันรหัสผ่านใหม่
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
                            >
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </form>
                    </div>

                    <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
                        <h3 className="text-xl font-bold text-red-700 mb-2">ลบบัญชี</h3>
                        <p className="text-red-600 mb-4">เมื่อลบบัญชีแล้วจะไม่สามารถกู้คืนได้</p>
                        <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">
                            ลบบัญชีของฉัน
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
