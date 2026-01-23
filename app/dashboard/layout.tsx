import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-purple-900 tracking-tight">
                        🏠 RoommateFinder
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/listings"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ดูประกาศ
                        </Link>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white">
                            👤
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-6">
                    <div className="space-y-2">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-all font-medium"
                        >
                            <span className="text-xl">📊</span>
                            ภาพรวม
                        </Link>
                        <Link
                            href="/dashboard/messages"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-all font-medium"
                        >
                            <span className="text-xl">💬</span>
                            ข้อความ
                            <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                                3
                            </span>
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-all font-medium"
                        >
                            <span className="text-xl">⚙️</span>
                            ตั้งค่า
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <Link
                            href="/listings/create"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
                        >
                            + สร้างประกาศ
                        </Link>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                        <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 transition-colors w-full">
                            <span className="text-xl">🚪</span>
                            ออกจากระบบ
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
