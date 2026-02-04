'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/app/components/Navbar';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  // Removed manual useEffect and localStorage checks since useAuth handles it

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Navbar */}
      <Navbar variant="transparent" />

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              ค้นหา<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">รูมเมท</span>ที่ใช่
              <br />สำหรับคุณ
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-10">
              แพลตฟอร์มที่จะช่วยให้คุณพบเพื่อนร่วมห้องที่เหมาะสม ปลอดภัย และน่าเชื่อถือ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/listings"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full font-bold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-xl"
              >
                🔍 ดูประกาศทั้งหมด
              </Link>
              <Link
                href="/listings/create"
                className="px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-full font-bold text-lg hover:bg-white/30 transition-all border border-white/30"
              >
                ✨ สร้างประกาศใหม่
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🔒
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">ปลอดภัย & น่าเชื่อถือ</h3>
              <p className="text-white/60">
                ระบบยืนยันตัวตนและรีวิวช่วยให้คุณมั่นใจในการเลือกรูมเมท
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                💬
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">แชทได้ทันที</h3>
              <p className="text-white/60">
                พูดคุยกับผู้โพสต์ประกาศได้โดยตรง ไม่ต้องรอนาน
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🎯
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">ค้นหาง่าย</h3>
              <p className="text-white/60">
                กรองตามราคา ทำเล และความชอบเพื่อหาห้องที่ตรงใจ
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/50">
            © 2026 RoommateFinder. สร้างด้วย ❤️ เพื่อคนหาห้อง
          </p>
        </div>
      </footer>
    </div>
  );
}

