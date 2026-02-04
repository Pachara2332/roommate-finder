'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
    onChange: (values: string[]) => void;
    value: string[];
    maxFiles?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value = [], maxFiles = 7 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check if adding these files would exceed the limit
        if (value.length + files.length > maxFiles) {
            setError(`You can only upload up to ${maxFiles} images.`);
            return;
        }

        setError(null);
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const newUrls: string[] = [];

        try {
            // Process uploads in parallel
            const uploadPromises = Array.from(files).map(async (file) => {
                // Individual file validation
                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    throw new Error(`File "${file.name}" is not a valid image type.`);
                }
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`File "${file.name}" exceeds 5MB limit.`);
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                const data = await response.json();
                return data.url;
            });

            const results = await Promise.all(uploadPromises);
            newUrls.push(...results);

            onChange([...value, ...newUrls]);

        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Some images failed to upload');
            // Even if some failed, update with successful ones
            if (newUrls.length > 0) {
                onChange([...value, ...newUrls]);
            }
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }

    }, [onChange, value, maxFiles]);

    const handleRemove = useCallback((urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove));
    }, [onChange, value]);

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {value.map((url, index) => (
                        <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                            <Image
                                fill
                                style={{ objectFit: 'cover' }}
                                src={url}
                                alt={`Listing image ${index + 1}`}
                            />
                            {/* Remove Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRemove(url);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                            {/* Main Badge */}
                            {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                    รูปหลัก
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {value.length < maxFiles && (
                <div
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    className="relative cursor-pointer hover:opacity-70 transition border-dashed border-2 border-gray-300 flex flex-col justify-center items-center h-[150px] w-full bg-gray-50 rounded-xl overflow-hidden"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={isLoading}
                        multiple
                    />

                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <div className="text-3xl">
                            {isLoading ? (
                                <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                            ) : (
                                '📷'
                            )}
                        </div>
                        <div className="font-semibold text-sm">
                            {isLoading ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพ'}
                        </div>
                        <div className="text-xs">
                            {value.length} / {maxFiles} รูป
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload;
