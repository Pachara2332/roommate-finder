'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/app/components/ToastContext';

interface ImageUploadProps {
    onUpload: (urls: string[]) => void;
    maxFiles?: number;
    existingImages?: string[];
}

export default function ImageUpload({
    onUpload,
    maxFiles = 5,
    existingImages = []
}: ImageUploadProps) {
    const { showSuccess, showError } = useToast();
    const [images, setImages] = useState<string[]>(existingImages);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList) => {
        if (images.length + files.length > maxFiles) {
            showError(`สามารถอัพโหลดได้สูงสุด ${maxFiles} รูป`);
            return;
        }

        setIsUploading(true);
        const formData = new FormData();

        Array.from(files).forEach((file) => {
            formData.append('images', file);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success && data.data?.urls) {
                const newImages = [...images, ...data.data.urls];
                setImages(newImages);
                onUpload(newImages);
                showSuccess(`อัพโหลดสำเร็จ ${data.data.urls.length} รูป`);
            } else {
                showError(data.error || 'อัพโหลดล้มเหลว');
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการอัพโหลด');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onUpload(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                        <p className="text-gray-600">กำลังอัพโหลด...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">📷</div>
                        <p className="text-gray-700 font-medium">
                            ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก
                        </p>
                        <p className="text-sm text-gray-500">
                            รองรับ JPEG, PNG, WebP, GIF (สูงสุด 5MB ต่อไฟล์)
                        </p>
                        <p className="text-sm text-purple-600">
                            {images.length}/{maxFiles} รูป
                        </p>
                    </div>
                )}
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                            >
                                ×
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                                    หลัก
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
