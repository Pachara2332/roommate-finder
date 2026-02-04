import Link from 'next/link';

interface Conversation {
    id: string;
    listing?: {
        title: string;
        images: { imageUrl: string }[];
    } | null;
    otherUser?: {
        id: string;
        fullName: string;
        profileImage: string | null;
    }; // We pre-calculated this in API?? API returns `otherUser`? 
    // Wait, API returned formattedConversations with `otherUser`.
    lastMessage?: {
        content: string;
        createdAt: string;
        isRead: boolean;
        senderId: string;
    };
    unreadCount?: number;
}

interface ConversationListProps {
    conversations: Conversation[];
    currentConversationId?: string;
    isLoading?: boolean;
}

export default function ConversationList({ conversations, currentConversationId, isLoading }: ConversationListProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 p-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p className="text-4xl mb-2">💬</p>
                <p>ยังไม่มีข้อความ</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {conversations.map((conv) => (
                <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${currentConversationId === conv.id ? 'bg-purple-50' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                {conv.otherUser?.profileImage ? (
                                    <img src={conv.otherUser.profileImage} alt={conv.otherUser.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    conv.otherUser?.fullName?.[0] || '?'
                                )}
                            </div>
                            {/* Unread badge would go here */}
                            {/* {conv.unreadCount > 0 && (...)} */}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-sm font-bold text-gray-900 truncate">
                                    {conv.otherUser?.fullName || 'User'}
                                </h3>
                                {conv.lastMessage && (
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                                {conv.lastMessage?.content || 'เริ่มบทสนทนา'}
                            </p>
                            {conv.listing && (
                                <div className="mt-1 text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md inline-block truncate max-w-full">
                                    🏠 {conv.listing.title}
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
