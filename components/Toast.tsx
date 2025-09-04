import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`flex items-center p-4 text-white rounded-lg shadow-lg ${bgColor} animate-fade-in-right`}>
      <Icon className="w-6 h-6 mr-3" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/20">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Add keyframes to your global styles if you can, or include them in a <style> tag in index.html
// For now, let's assume you have a way to add this CSS. If not, the animation won't work but the component will.
// @keyframes fade-in-right {
//   from {
//     opacity: 0;
//     transform: translateX(100%);
//   }
//   to {
//     opacity: 1;
//     transform: translateX(0);
//   }
// }
// .animate-fade-in-right {
//   animation: fade-in-right 0.5s ease-out forwards;
// }

export default Toast;