import React, { useState, useEffect } from 'react';
import { BudgetItem } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<BudgetItem, 'id'> | BudgetItem) => void;
  itemToEdit: BudgetItem | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSubmit, itemToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    expectedCost: 0,
    actualCost: 0,
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
    } else {
      setFormData({ name: '', expectedCost: 0, actualCost: 0 });
    }
  }, [itemToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
        <h2 className="text-2xl font-bold text-dark dark:text-light">{itemToEdit ? 'Edit Budget Item' : 'Add Budget Item'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expectedCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Cost ($)</label>
              <input type="number" name="expectedCost" id="expectedCost" value={formData.expectedCost} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="actualCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Actual Cost ($)</label>
              <input type="number" name="actualCost" id="actualCost" value={formData.actualCost} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark">{itemToEdit ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
