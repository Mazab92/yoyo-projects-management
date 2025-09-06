import React from 'react';

const EmptyState: React.FC<{ title: string; message: string; action?: React.ReactNode; }> = ({ title, message, action }) => (
    <div className="py-16 text-center"><h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>{action && <div className="mt-6">{action}</div>}</div>
);

export default EmptyState;
