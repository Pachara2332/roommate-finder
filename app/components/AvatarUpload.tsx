'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
    currentImageUrl?: string | null;
    onUploadSuccess?: (url: string) => void;
}

export default function AvatarUpload({ currentImageUrl, onUploadSuccess }: AvatarUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Client-side Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image (JPG, PNG, or WEBP)');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be less than 2MB');
            return;
        }

        setError(null);

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // 2. Upload Process
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/user/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            const { url } = await response.json();

            if (onUploadSuccess) {
                onUploadSuccess(url);
            }
            router.refresh(); // Refresh server components to show new avatar

        } catch (err: any) {
            console.error('Upload Error:', err);
            setError(err.message || 'Something went wrong');
            setPreviewUrl(currentImageUrl || null); // Revert preview on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 relative">
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Profile Avatar"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                    )}

                    {/* Overlay Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Edit Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                    title="Change Avatar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                    </svg>
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
            />

            {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">{error}</p>
            )}
        </div>
    );
}
