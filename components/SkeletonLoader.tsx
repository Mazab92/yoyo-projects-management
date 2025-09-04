import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full p-4 mx-auto">
      <div className="flex space-x-4 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 rounded-full dark:bg-gray-700"></div>
        <div className="flex-1 py-1 space-y-6">
          <div className="h-2 bg-gray-300 rounded dark:bg-gray-700"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 col-span-2 bg-gray-300 rounded dark:bg-gray-700"></div>
              <div className="h-2 col-span-1 bg-gray-300 rounded dark:bg-gray-700"></div>
            </div>
            <div className="h-2 bg-gray-300 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
