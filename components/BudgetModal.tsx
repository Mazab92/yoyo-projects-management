
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BudgetItem } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface BudgetModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<BudgetItem, 'id'> & { id?: number }) => void;
  itemToEdit: BudgetItem | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ onClose, onSubmit, itemToEdit }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [expectedCost, setExpectedCost] = useState(0);
  const [actualCost, setActualCost] = useState(0);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setExpectedCost(itemToEdit.expectedCost);
      setActualCost(itemToEdit.actualCost);
    }
  }, [itemToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || expectedCost <= 0) {
        alert(t('fillAllFieldsError'));
        return;
    }
    onSubmit({ id: itemToEdit?.id, name, expectedCost, actualCost });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{itemToEdit ? t('editBudgetItem') : t('addNewBudgetItem')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">{t('budgetItemName')}</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expectedCost" className="block text-sm font-medium mb-1">{t('expectedCost')} (EGP)</label>
              <input type="number" id="expectedCost" value={expectedCost === 0 ? '' : expectedCost} onChange={(e) => setExpectedCost(Number(e.target.value))} required min="1" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="actualCost" className="block text-sm font-medium mb-1">{t('actualCost')} (EGP)</label>
              <input type="number" id="actualCost" value={actualCost === 0 ? '' : actualCost} onChange={(e) => setActualCost(Number(e.target.value))} min="0" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold">{itemToEdit ? t('saveChanges') : t('addBudgetItem')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
