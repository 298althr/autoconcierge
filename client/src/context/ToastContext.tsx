'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
    title: string;
    message?: string;
    type?: ToastType;
    duration?: number;
}

interface Toast extends ToastOptions {
    id: string;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(({ title, message, type = 'info', duration = 3000 }: ToastOptions) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, title, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-0 right-0 p-6 z-50 flex flex-col space-y-4 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => {
                        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                className={clsx(
                                    "pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl shadow-xl border backdrop-blur w-80 max-w-[calc(100vw-3rem)]",
                                    toast.type === 'success' ? "bg-emerald/10 border-emerald/20 text-emerald" :
                                        toast.type === 'error' ? "bg-red-50 border-red-100 text-red-500" :
                                            "bg-white border-gray-100 text-onyx"
                                )}
                            >
                                <Icon size={24} className="shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-black text-sm">{toast.title}</h4>
                                    {toast.message && <p className="text-xs mt-1 opacity-90 font-medium">{toast.message}</p>}
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="shrink-0 p-1 opacity-50 hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
