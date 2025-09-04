import React from 'react';

const RiskModal: React.FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Risk</h2>
        <p className="mt-4">Risk creation form will be here.</p>
         <div className="flex justify-end pt-4 mt-4 space-x-4 border-t dark:border-gray-700">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark">
              Save Risk
            </button>
        </div>
      </div>
    </div>
  );
};

export default RiskModal;
