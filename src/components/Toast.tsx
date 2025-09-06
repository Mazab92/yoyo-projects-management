import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ToastMessage } from '../types';

const Toast: React.FC<ToastMessage> = ({ message, type }) => {
    const icons = {
        success: <CheckCircle className="text-emerald-500" />,
        error: <AlertCircle className="text-red-500" />,
        info: <Info className="text-blue-500" />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="flex items-start w-full p-4 space-x-3 bg-white rounded-xl shadow-lg dark:bg-dark-secondary"
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{message}</p>
        </motion.div>
    );
};

export default Toast;
