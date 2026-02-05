"use client";

import { useState } from "react";

// Mock messages data
const conversations = [
    {
        id: 1,
        user: "คุณวิชัย",
        lastMessage: "สนใจห้องครับ ขอดูห้องได้ไหม?",
        time: "10 นาทีที่แล้ว",
        unread: true,
        listing: "หาเพื่อนร่วมคอนโด ใกล้ BTS อโศก",
    },
    {
        id: 2,
        user: "คุณพิมพ์",
        lastMessage: "ค่าน้ำค่าไฟรวมในค่าเช่าไหมคะ",
        time: "2 ชม.ที่แล้ว",
        unread: true,
        listing: "หาเพื่อนร่วมคอนโด ใกล้ BTS อโศก",
    },
    {
        id: 3,
        user: "คุณสมศักดิ์",
        lastMessage: "ขอบคุณครับ เดี๋ยวจะติดต่อกลับ",
        time: "เมื่อวาน",
        unread: false,
        listing: "คอนโดใหม่ ใกล้ MRT พระราม 9",
    },
    {
        id: 4,
        user: "คุณนิดา",
        lastMessage: "ได้ค่ะ แล้วเจอกันวันเสาร์",
        time: "2 วันที่แล้ว",
        unread: false,
        listing: "หาเพื่อนร่วมคอนโด ใกล้ BTS อโศก",
    },
];

const chatMessages = [
    { id: 1, from: "them", text: "สวัสดีครับ สนใจห้องที่ลงประกาศครับ", time: "14:30" },
    { id: 2, from: "me", text: "สวัสดีครับ ยินดีครับ มีอะไรสอบถามได้เลยครับ", time: "14:32" },
    { id: 3, from: "them", text: "ห้องว่างเมื่อไหร่ครับ? แล้วใกล้ BTS จริงๆเลยไหม", time: "14:35" },
    { id: 4, from: "me", text: "เข้าอยู่ได้ทันทีเลยครับ ห่างจาก BTS อโศกประมาณ 300 เมตร เดินไม่เกิน 5 นาทีครับ", time: "14:38" },
    { id: 5, from: "them", text: "สนใจห้องครับ ขอดูห้องได้ไหม?", time: "14:45" },
];

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState("");

    return (
        <div className="h-[calc(100vh-8rem)]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-80 border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">ข้อความ</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedChat(conv)}
                                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${selectedChat.id === conv.id ? "bg-purple-50" : ""
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {conv.user.charAt(3)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`font-semibold ${conv.unread ? "text-gray-900" : "text-gray-600"}`}>
                                                {conv.user}
                                            </p>
                                            <span className="text-xs text-gray-400">{conv.time}</span>
                                        </div>
                                        <p className={`text-sm line-clamp-1 ${conv.unread ? "text-gray-700" : "text-gray-500"}`}>
                                            {conv.lastMessage}
                                        </p>
                                        <p className="text-xs text-purple-500 mt-1 line-clamp-1">
                                            📋 {conv.listing}
                                        </p>
                                    </div>
                                    {conv.unread && (
                                        <span className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-2"></span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {selectedChat.user.charAt(3)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{selectedChat.user}</p>
                            <p className="text-xs text-gray-500">📋 {selectedChat.listing}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {chatMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${msg.from === "me"
                                        ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                                        : "bg-white text-gray-800 shadow-sm"
                                        }`}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                    <p
                                        className={`text-xs mt-1 ${msg.from === "me" ? "text-white/70" : "text-gray-400"
                                            }`}
                                    >
                                        {msg.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="พิมพ์ข้อความ..."
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all">
                                ส่ง
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
