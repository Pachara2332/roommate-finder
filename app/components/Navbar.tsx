'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname } from 'next/navigation';

interface NavbarProps {
    variant?: 'transparent' | 'default';
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isTransparent = variant === 'transparent';

    const textLogoClass = isTransparent ? 'text-white' : 'text-purple-900';
    const textLinkClass = isTransparent ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-gray-900';
    const navClass = isTransparent
        ? 'fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10'
        : 'sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm';

    return (
        <nav className={navClass}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className={`text-2xl font-bold tracking-tight ${textLogoClass}`}>
                    🏠 RoommateFinder
                </Link>

                <div className="flex gap-4 items-center">
                    {/* Navigation Links */}
                    {pathname !== '/' && (
                        <Link href="/listings" className={`hidden md:block font-medium transition-colors ${textLinkClass} mr-2`}>
                            ค้นหาห้อง
                        </Link>
                    )}

                    {user ? (
                        <>
                            <div className={`hidden md:flex items-center gap-2 mr-2 ${isTransparent ? 'text-white/90' : 'text-gray-700'}`}>
                                <span>{user.fullName}</span>
                            </div>

                            {pathname !== '/dashboard' && (
                                <Link
                                    href="/dashboard"
                                    className={`px-5 py-2.5 rounded-full font-medium transition-all ${isTransparent
                                            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                            )}

                            <button
                                onClick={logout}
                                className={`px-5 py-2.5 font-medium transition-colors ${textLinkClass}`}
                            >
                                ออกจากระบบ
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={`px-5 py-2.5 font-medium transition-colors ${textLinkClass}`}
                            >
                                เข้าสู่ระบบ
                            </Link>
                            <Link
                                href="/register"
                                className={`px-5 py-2.5 rounded-full font-semibold transition-all hover:scale-105 shadow-lg ${isTransparent
                                        ? 'bg-white text-purple-900 hover:bg-white/90'
                                        : 'bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:opacity-90'
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
