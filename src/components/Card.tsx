import React from 'react';
import { motion } from 'framer-motion';

const Card: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <motion.div className="p-5 bg-white rounded-xl shadow-md dark:bg-dark-secondary" whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }} >
        <div className="flex items-center">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-white rounded-lg" style={{ background: `linear-gradient(to right, ${color}, ${color === '#3B82F6' ? '#10B981' : '#F59E0B'})` }}>{icon}</div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </motion.div>
);

export default Card;
