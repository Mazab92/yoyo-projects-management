
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color = 'bg-primary', children }) => {
  return (
    <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
          <p className="text-3xl font-bold text-dark dark:text-light mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} text-white`}>
          {icon}
        </div>
      </div>
      {children}
    </div>
  );
};

export default Card;
