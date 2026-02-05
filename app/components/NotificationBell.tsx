'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import Link from 'next/link';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return '💬';
            case 'listing':
                return '🏠';
            default:
                return '🔔';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">การแจ้งเตือน</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-purple-600 hover:text-purple-700"
                            >
                                อ่านทั้งหมด
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                ไม่มีการแจ้งเตือน
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-purple-50' : ''
                                        }`}
                                >
                                    {notification.link ? (
                                        <Link href={notification.link} className="block">
                                            <NotificationItem notification={notification} getIcon={getNotificationIcon} />
                                        </Link>
                                    ) : (
                                        <NotificationItem notification={notification} getIcon={getNotificationIcon} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100">
                            <Link
                                href="/dashboard/notifications"
                                className="block text-center text-sm text-purple-600 hover:text-purple-700"
                            >
                                ดูทั้งหมด
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotificationItem({
    notification,
    getIcon,
}: {
    notification: { type: string; title: string; body: string; createdAt: Date; read: boolean };
    getIcon: (type: string) => string;
}) {
    return (
        <div className="flex gap-3">
            <div className="text-xl">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{notification.title}</p>
                <p className="text-sm text-gray-600 truncate">{notification.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                    {notification.createdAt.toLocaleString('th-TH')}
                </p>
            </div>
            {!notification.read && (
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            )}
        </div>
    );
}
