import React, { useState, useEffect } from 'react';
import { BudgetItem } from '../types';
import Modal from './Modal';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<BudgetItem, 'id' | 'projectId'>) => void;
    item: BudgetItem | null;
    t: (key: string) => string;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSave, item, t }) => {
    const [category, setCategory] = useState('');
    const [planned, setPlanned] = useState(0);
    const [actual, setActual] = useState(0);

    useEffect(() => {
        if (item) {
            setCategory(item.category);
            setPlanned(item.planned);
            setActual(item.actual);
        } else {
            setCategory('');
            setPlanned(0);
            setActual(0);
        }
    }, [item, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ category, planned, actual });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? t('editBudgetItem') : t('addBudgetItem')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')}</label>
                    <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="planned" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('plannedBudget')}</label>
                        <input type="number" id="planned" value={planned} onChange={(e) => setPlanned(Number(e.target.value))} required className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="actual" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('actualSpending')}</label>
                        <input type="number" id="actual" value={actual} onChange={(e) => setActual(Number(e.target.value))} required className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        {t('cancel')}
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                        {t('save')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default BudgetModal;
