import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-dark dark:text-light">{value}</p>
        </div>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: color, color: 'white' }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Card;
