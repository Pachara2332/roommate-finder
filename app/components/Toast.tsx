'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toast: ToastData;
    onClose: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: '✓',
        gradientFrom: 'from-emerald-500',
        gradientTo: 'to-green-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500',
    },
    error: {
        icon: '✕',
        gradientFrom: 'from-red-500',
        gradientTo: 'to-rose-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
    },
    warning: {
        icon: '⚠',
        gradientFrom: 'from-amber-500',
        gradientTo: 'to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    },
    info: {
        icon: 'ℹ',
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    },
};

export function Toast({ toast, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const config = toastConfig[toast.type];

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setIsVisible(true));

        // Auto dismiss after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose(toast.id);
        }, 300);
    };

    return (
        <div
            className={`
        relative overflow-hidden
        w-full max-w-sm
        ${config.bgColor} ${config.borderColor}
        border rounded-2xl shadow-2xl
        backdrop-blur-xl
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
            style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            }}
        >
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50">
                <div
                    className={`h-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} animate-progress`}
                    style={{
                        animation: 'shrink 5s linear forwards',
                    }}
                />
            </div>

            <div className="flex items-start gap-4 p-4">
                {/* Icon */}
                <div
                    className={`
            flex-shrink-0 w-10 h-10 rounded-xl
            ${config.iconBg}
            flex items-center justify-center
            text-white text-lg font-bold
            shadow-lg
          `}
                >
                    {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                    <p className="text-gray-800 font-medium text-sm leading-relaxed">
                        {toast.message}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="
            flex-shrink-0 w-8 h-8 rounded-full
            flex items-center justify-center
            text-gray-400 hover:text-gray-600
            hover:bg-gray-200/50
            transition-all duration-200
          "
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastData[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} onClose={onClose} />
                </div>
            ))}

            <style jsx global>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
        </div>
    );
}
