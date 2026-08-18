"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "error" | "info";
type ToastState = { id: number; message: string; type: ToastType } | null;

type ToastContextValue = {
    showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있어요");
    return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastState>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((message: string, type: ToastType = "error") => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const id = Date.now();
        setToast({ id, message, type });
        timerRef.current = setTimeout(() => {
            setToast((current) => (current?.id === id ? null : current));
        }, 3800);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div
                    role="alert"
                    className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2.5rem)] max-w-sm"
                >
                    <div
                        className={
                            "rounded-2xl px-4 py-3.5 shadow-lg flex items-start gap-2.5 text-sm font-semibold leading-relaxed " +
                            (toast.type === "error" ? "bg-ink text-white" : "bg-white border border-line text-ink")
                        }
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                            {toast.type === "error" ? (
                                <>
                                    <circle cx="12" cy="12" r="9" stroke={toast.type === "error" ? "white" : "#14171B"} strokeWidth="1.6" />
                                    <path d="M12 8V13" stroke={toast.type === "error" ? "white" : "#14171B"} strokeWidth="1.8" strokeLinecap="round" />
                                    <circle cx="12" cy="16.2" r="1" fill={toast.type === "error" ? "white" : "#14171B"} />
                                </>
                            ) : (
                                <>
                                    <circle cx="12" cy="12" r="9" stroke="#14171B" strokeWidth="1.6" />
                                    <path d="M9 12L11 14L15.5 9.2" stroke="#14171B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </>
                            )}
                        </svg>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}