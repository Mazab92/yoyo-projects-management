
import React, { useState, useMemo } from 'react';
import { Project, BudgetItem } from '../types';
import { formatCurrency } from '../utils/helpers';
import { PlusCircle, Pencil, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../components/Card';
import { useLocalization } from '../hooks/useLocalization';
import BudgetModal from '../components/BudgetModal';

interface BudgetProps {
  project: Project;
  onBudgetItemsUpdate: (items: BudgetItem[]) => void;
}

const Budget: React.FC<BudgetProps> = ({ project, onBudgetItemsUpdate }) => {
  const { t } = useLocalization();
  const { budgetItems, budget: totalBudget } = project;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const totalSpent = useMemo(() => budgetItems.reduce((sum, item) => sum + item.actualCost, 0), [budgetItems]);
  const remainingBudget = totalBudget - totalSpent;

  const handleOpenModal = (item: BudgetItem | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (itemData: Omit<BudgetItem, 'id'> & { id?: number }) => {
    let updatedItems: BudgetItem[];
    if (itemData.id) {
      updatedItems = budgetItems.map(i => i.id === itemData.id ? { ...i, ...itemData } : i);
    } else {
      const newId = budgetItems.length > 0 ? Math.max(...budgetItems.map(i => i.id)) + 1 : 1;
      updatedItems = [...budgetItems, { ...itemData, id: newId }];
    }
    onBudgetItemsUpdate(updatedItems);
    handleCloseModal();
  };
  
  const handleDelete = (itemId: number) => {
    if (window.confirm(t('deleteBudgetItemConfirmation'))) {
        onBudgetItemsUpdate(budgetItems.filter(i => i.id !== itemId));
    }
  };

  const VarianceIndicator: React.FC<{ variance: number }> = ({ variance }) => {
    if (variance > 0) return <TrendingDown className="text-green-500" />;
    if (variance < 0) return <TrendingUp className="text-red-500" />;
    return <Minus className="text-gray-500" />;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title={t('totalBudget')} value={formatCurrency(totalBudget)} icon={<div className="font-bold text-lg">EGP</div>} color="bg-blue-500" />
            <Card title={t('totalSpent')} value={formatCurrency(totalSpent)} icon={<div className="font-bold text-lg">EGP</div>} color="bg-orange-500" />
            <Card title={t('remaining')} value={formatCurrency(remainingBudget)} icon={<div className="font-bold text-lg">EGP</div>} color={remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500'} />
        </div>

        <div className="bg-white dark:bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-dark dark:text-light">{t('budgetManagement')}</h2>
            <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              <PlusCircle size={18} className="me-2" />
              {t('addBudgetItem')}
            </button>
          </div>
          
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">{t('budgetItemName')}</th>
                  <th scope="col" className="px-6 py-3">{t('expectedCost')}</th>
                  <th scope="col" className="px-6 py-3">{t('actualCost')}</th>
                  <th scope="col" className="px-6 py-3">{t('variance')}</th>
                  <th scope="col" className="px-6 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.length > 0 ? budgetItems.map(item => {
                  const variance = item.expectedCost - item.actualCost;
                  return (
                    <tr key={item.id} className="bg-white dark:bg-dark-secondary border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4">{formatCurrency(item.expectedCost)}</td>
                      <td className="px-6 py-4">{formatCurrency(item.actualCost)}</td>
                      <td className={`px-6 py-4 font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <VarianceIndicator variance={variance} />
                            <span>{formatCurrency(variance)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700" title={t('editItem')}><Pencil size={18}/></button>
                              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" title={t('deleteItem')}><Trash2 size={18}/></button>
                          </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                      {t('noBudgetItems')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
              {budgetItems.length > 0 ? budgetItems.map(item => {
                  const variance = item.expectedCost - item.actualCost;
                  return (
                      <div key={item.id} className="bg-gray-50 dark:bg-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-start mb-3">
                              <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                              <div className={`flex items-center space-x-2 rtl:space-x-reverse font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <VarianceIndicator variance={variance} />
                                  <span>{formatCurrency(variance)}</span>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm py-3 border-y border-gray-200 dark:border-gray-700">
                              <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('expectedCost')}</p>
                                  <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{formatCurrency(item.expectedCost)}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('actualCost')}</p>
                                  <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{formatCurrency(item.actualCost)}</p>
                              </div>
                          </div>
                           <div className="flex justify-end items-center mt-3 space-x-3 rtl:space-x-reverse">
                              <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700" title={t('editItem')}><Pencil size={18}/></button>
                              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" title={t('deleteItem')}><Trash2 size={18}/></button>
                          </div>
                      </div>
                  );
              }) : (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      {t('noBudgetItems')}
                  </div>
              )}
          </div>

        </div>
      </div>
      {isModalOpen && (
        <BudgetModal
          itemToEdit={editingItem}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default Budget;
