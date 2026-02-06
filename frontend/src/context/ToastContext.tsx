
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    toasts: Toast[];
    setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'INFO', duration: number = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type, duration }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
};

export const ToastContainer = () => {
    const context = useContext(ToastContext);
    if (!context) return null;
    const { toasts, setToasts } = context;

    if (toasts.length === 0) return null;

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto px-6 py-4 rounded-xl shadow-2xl border-l-4 transform transition-all animate-slide-in flex items-center gap-3 min-w-[300px] ${toast.type === 'SUCCESS' ? 'bg-white border-green-500 text-green-800' :
                            toast.type === 'WARNING' ? 'bg-white border-yellow-500 text-yellow-800' :
                                toast.type === 'ERROR' ? 'bg-white border-red-500 text-red-800' :
                                    'bg-white border-blue-500 text-blue-800'
                            }`}
                    >
                        <div className="text-xl">
                            {toast.type === 'SUCCESS' && '✅'}
                            {toast.type === 'WARNING' && '⚠️'}
                            {toast.type === 'ERROR' && '🚫'}
                            {toast.type === 'INFO' && 'ℹ️'}
                        </div>
                        <div className="flex-1 font-medium">{toast.message}</div>
                        <button
                            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <style jsx global>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
