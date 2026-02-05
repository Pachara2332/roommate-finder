'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

interface NavbarProps {
    variant?: 'light' | 'dark';
}

export default function Navbar({ variant = 'light' }: NavbarProps) {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const isDark = variant === 'dark';

    return (
        <nav className={`sticky top-0 z-50 ${isDark
                ? 'backdrop-blur-md bg-white/10 border-b border-white/10'
                : 'bg-white border-b border-gray-200 shadow-sm'
            }`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link
                    href="/"
                    className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-purple-900'
                        }`}
                >
                    🏠 RoommateFinder
                </Link>
                <div className="flex gap-4 items-center">
                    <Link
                        href="/listings"
                        className={`px-4 py-2 font-medium transition-colors ${isDark
                                ? 'text-white/80 hover:text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        ดูประกาศ
                    </Link>
                    {isAuthenticated && user ? (
                        <>
                            <span className={`font-medium hidden md:block ${isDark ? 'text-white/90' : 'text-gray-700'
                                }`}>
                                สวัสดี, {user.fullName || 'User'}
                            </span>
                            <Link
                                href="/listings/create"
                                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-lg"
                            >
                                + สร้างประกาศ
                            </Link>
                            <Link
                                href="/dashboard"
                                className={`px-5 py-2.5 rounded-full font-medium transition-all ${isDark
                                        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={`px-4 py-2 font-medium transition-colors ${isDark
                                        ? 'text-white/70 hover:text-white'
                                        : 'text-gray-500 hover:text-red-500'
                                    }`}
                            >
                                ออกจากระบบ
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={`px-5 py-2.5 font-medium transition-colors ${isDark
                                        ? 'text-white/90 hover:text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                เข้าสู่ระบบ
                            </Link>
                            <Link
                                href="/register"
                                className={`px-5 py-2.5 rounded-full font-semibold transition-all hover:scale-105 shadow-lg ${isDark
                                        ? 'bg-white text-purple-900 hover:bg-white/90'
                                        : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:opacity-90'
                                    }`}
                            >
                                สมัครสมาชิก
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
