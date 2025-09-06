import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProjectContext } from '../hooks/useProjectContext';
import { BudgetItem } from '../types';
import { logActivity } from '../lib/activityLog';
import EmptyState from '../components/EmptyState';
import BouncingLoader from '../components/BouncingLoader';
import BudgetModal from '../components/BudgetModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrencyEGP } from '../lib/helpers';

// Fix: Updated t function prop type to allow for a parameters object.
const BudgetPage: React.FC<{ t: (key: string, params?: Record<string, string>) => string; locale: string }> = ({ t, locale }) => {
    const { currentProject } = useProjectContext();
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<BudgetItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);

    useEffect(() => {
        if (!currentProject) return;

        setLoading(true);
        const q = query(collection(db, 'budget'), where('projectId', '==', currentProject.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetItem));
            setBudgetItems(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentProject]);
    
    const { totalPlanned, totalActual } = useMemo(() => {
        return budgetItems.reduce((acc, item) => {
            acc.totalPlanned += item.planned;
            acc.totalActual += item.actual;
            return acc;
        }, { totalPlanned: 0, totalActual: 0 });
    }, [budgetItems]);

    const handleOpenModal = (item: BudgetItem | null = null) => {
        setItemToEdit(item);
        setModalOpen(true);
    };

    const handleSaveItem = async (itemData: Omit<BudgetItem, 'id' | 'projectId'>) => {
        if (!currentProject) return;
        try {
            if (itemToEdit) {
                await updateDoc(doc(db, 'budget', itemToEdit.id), itemData);
                logActivity('Updated budget item', { projectId: currentProject.id, item: itemData.category });
            } else {
                const newItem = { ...itemData, projectId: currentProject.id };
                await addDoc(collection(db, 'budget'), newItem);
                logActivity('Added budget item', { projectId: currentProject.id, item: itemData.category });
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving budget item:', error);
        }
    };
    
    const handleDeleteRequest = (item: BudgetItem) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    }
    
    const confirmDelete = async () => {
        if (!itemToDelete || !currentProject) return;
        try {
            await deleteDoc(doc(db, 'budget', itemToDelete.id));
            logActivity('Deleted budget item', { projectId: currentProject.id, item: itemToDelete.category });
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch(error) {
            console.error("Error deleting budget item:", error);
        }
    }
    
    if (!currentProject) return null;

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('budgetTitle', { projectName: currentProject.name })}
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark"
                >
                    <Plus size={16} className="mr-2" /> {t('addBudgetItem')}
                </button>
            </div>

            {loading ? <BouncingLoader /> : budgetItems.length === 0 ? (
                <EmptyState title={t('noBudget')} message={t('noBudgetMessage')} />
            ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-white dark:bg-dark-secondary rounded-lg shadow"><div className="text-sm text-gray-500">{t('planned')}</div><div className="text-xl font-bold">{formatCurrencyEGP(totalPlanned, locale as 'en'|'ar')}</div></div>
                    <div className="p-4 bg-white dark:bg-dark-secondary rounded-lg shadow"><div className="text-sm text-gray-500">{t('actual')}</div><div className="text-xl font-bold">{formatCurrencyEGP(totalActual, locale as 'en'|'ar')}</div></div>
                    <div className="p-4 bg-white dark:bg-dark-secondary rounded-lg shadow"><div className="text-sm text-gray-500">{t('remaining')}</div><div className={`text-xl font-bold ${totalPlanned - totalActual < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrencyEGP(totalPlanned - totalActual, locale as 'en'|'ar')}</div></div>
                </div>
                <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('category')}</th>
                                <th scope="col" className="px-6 py-3">{t('planned')}</th>
                                <th scope="col" className="px-6 py-3">{t('actual')}</th>
                                <th scope="col" className="px-6 py-3">{t('remaining')}</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgetItems.map(item => (
                                <tr key={item.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.category}</th>
                                    <td className="px-6 py-4">{formatCurrencyEGP(item.planned, locale as 'en'|'ar')}</td>
                                    <td className="px-6 py-4">{formatCurrencyEGP(item.actual, locale as 'en'|'ar')}</td>
                                    <td className={`px-6 py-4 font-medium ${item.planned - item.actual < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrencyEGP(item.planned - item.actual, locale as 'en'|'ar')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-primary"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteRequest(item)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </>
            )}
            
            <BudgetModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveItem}
                item={itemToEdit}
                t={t}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={t('deleteItemTitle')}
                message={t('deleteItemMessage')}
                t={t}
            />
        </div>
    );
};

export default BudgetPage;
