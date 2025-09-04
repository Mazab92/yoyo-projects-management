import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <motion.div 
      className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary"
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center">
        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-4 text-white rounded-full" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;