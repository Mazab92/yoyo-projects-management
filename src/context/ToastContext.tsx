import React, { useState, useRef, ReactNode, createContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastMessage, ToastType } from '../types';
import Toast from '../components/Toast';

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const toastId = useRef(0);

    const addToast = (message: string, type: ToastType) => {
        const id = toastId.current++;
        setToasts(currentToasts => [...currentToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 5000);
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] w-full max-w-xs space-y-3" dir="ltr">
                <AnimatePresence>
                    {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
