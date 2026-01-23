import Link from "next/link";

// Mock listing data
const listing = {
    id: 1,
    title: "หาเพื่อนร่วมคอนโด ใกล้ BTS อโศก",
    description: `คอนโดใหม่ เพิ่งสร้างเสร็จปี 2025 ชั้น 15 วิวสวย เงียบสงบ
  
ห้องขนาด 35 ตร.ม. มี 1 ห้องนอน 1 ห้องน้ำ พร้อมเฟอร์นิเจอร์ครบ

กำลังหารูมเมทที่:
- สุภาพ ไม่สูบบุหรี่
- ทำงานประจำหรือเรียนอยู่
- ไม่เลี้ยงสัตว์

เข้าอยู่ได้ทันที สัญญา 1 ปี มัดจำ 2 เดือน

ติดต่อได้ตลอดครับ`,
    location: "สุขุมวิท 23, กรุงเทพฯ",
    price: 8500,
    roomType: "ห้องส่วนตัว",
    gender: "ไม่จำกัดเพศ",
    amenities: ["แอร์", "Wi-Fi", "เครื่องซักผ้า", "ที่จอดรถ", "สระว่ายน้ำ", "ฟิตเนส"],
    owner: {
        name: "คุณสมชาย",
        phone: "081-234-5678",
        lineId: "@somchai123",
    },
    createdAt: "20 ม.ค. 2026",
};

export default function ListingDetailPage({ params }: { params: { listingId: string } }) {
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
            <main className="max-w-5xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl h-80 flex items-center justify-center text-8xl">
                            🏢
                        </div>

                        {/* Title and Meta */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                                    {listing.roomType}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                    {listing.gender}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                {listing.title}
                            </h1>
                            <p className="text-gray-500 flex items-center gap-2 mb-4">
                                📍 {listing.location}
                            </p>
                            <p className="text-3xl font-bold text-purple-600">
                                ฿{listing.price.toLocaleString()}
                                <span className="text-sm font-normal text-gray-400">/เดือน</span>
                            </p>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">รายละเอียด</h2>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                                {listing.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">สิ่งอำนวยความสะดวก</h2>
                            <div className="flex flex-wrap gap-3">
                                {listing.amenities.map((amenity) => (
                                    <span
                                        key={amenity}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
                                    >
                                        ✓ {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Contact Card */}
                    <div className="md:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">ติดต่อผู้ลงประกาศ</h3>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl text-white">
                                    👤
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{listing.owner.name}</p>
                                    <p className="text-sm text-gray-500">โพสต์เมื่อ {listing.createdAt}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="text-xl">📞</span>
                                    <span>{listing.owner.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="text-xl">💬</span>
                                    <span>Line: {listing.owner.lineId}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg">
                                    💬 ส่งข้อความ
                                </button>
                                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                    ❤️ บันทึก
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Listing ID: {params.listingId}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
