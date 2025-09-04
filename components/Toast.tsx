import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircle className="text-green-500" />,
    style: 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300',
  },
  error: {
    icon: <X className="text-red-500" />,
    style: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300',
  },
  warning: {
    icon: <AlertTriangle className="text-yellow-500" />,
    style: 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300',
  },
  info: {
    icon: <Info className="text-blue-500" />,
    style: 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const config = toastConfig[type];

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 text-sm border-l-4 rounded-md shadow-lg ${config.style}`} role="alert">
      <div className="mr-3">{config.icon}</div>
      <p>{message}</p>
      <button onClick={onClose} className="p-1 ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
        <span className="sr-only">Dismiss</span>
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
