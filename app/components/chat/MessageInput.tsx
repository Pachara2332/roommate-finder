import { useState, useEffect, useRef } from 'react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
}

export default function MessageInput({ onSendMessage, onTyping, disabled }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
            handleTyping(false);
        }
    };

    const handleTyping = (isTyping: boolean) => {
        if (onTyping) {
            onTyping(isTyping);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);

        handleTyping(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            handleTyping(false);
        }, 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex gap-3">
                <input
                    type="text"
                    value={message}
                    onChange={handleChange}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 px-6 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={disabled}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ส่ง
                </button>
            </div>
        </form>
    );
}
