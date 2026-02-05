'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

export default function LogoutButton() {
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 transition-colors w-full"
        >
            <span className="text-xl">🚪</span>
            ออกจากระบบ
        </button>
    );
}
