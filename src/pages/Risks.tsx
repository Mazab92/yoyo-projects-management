import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProjectContext } from '../hooks/useProjectContext';
import { Risk, RiskSeverity } from '../types';
import { logActivity } from '../lib/activityLog';

import EmptyState from '../components/EmptyState';
import BouncingLoader from '../components/BouncingLoader';
import RiskModal from '../components/RiskModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Plus, Edit, Trash2 } from 'lucide-react';

// Fix: Updated t function prop type to allow for a parameters object.
const RisksPage: React.FC<{ t: (key: string, params?: Record<string, string>) => string }> = ({ t }) => {
    const { currentProject } = useProjectContext();
    const [risks, setRisks] = useState<Risk[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<Risk | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Risk | null>(null);

    useEffect(() => {
        if (!currentProject) return;

        setLoading(true);
        const q = query(collection(db, 'risks'), where('projectId', '==', currentProject.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Risk));
            setRisks(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentProject]);
    
    const getSeverityColor = (severity: RiskSeverity) => {
        switch(severity) {
            case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    }

    const handleOpenModal = (item: Risk | null = null) => {
        setItemToEdit(item);
        setModalOpen(true);
    };

    const handleSaveItem = async (itemData: Omit<Risk, 'id' | 'projectId'>) => {
        if (!currentProject) return;
        try {
            if (itemToEdit) {
                await updateDoc(doc(db, 'risks', itemToEdit.id), itemData);
                logActivity('Updated risk', { projectId: currentProject.id, risk: itemData.description });
            } else {
                const newItem = { ...itemData, projectId: currentProject.id };
                await addDoc(collection(db, 'risks'), newItem);
                logActivity('Added risk', { projectId: currentProject.id, risk: itemData.description });
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving risk:', error);
        }
    };
    
    const handleDeleteRequest = (item: Risk) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    }
    
    const confirmDelete = async () => {
        if (!itemToDelete || !currentProject) return;
        try {
            await deleteDoc(doc(db, 'risks', itemToDelete.id));
            logActivity('Deleted risk', { projectId: currentProject.id, risk: itemToDelete.description });
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch(error) {
            console.error("Error deleting risk:", error);
        }
    }
    
    if (!currentProject) return null;

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('risksTitle', { projectName: currentProject.name })}
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark"
                >
                    <Plus size={16} className="mr-2" /> {t('addRisk')}
                </button>
            </div>

            {loading ? <BouncingLoader /> : risks.length === 0 ? (
                <EmptyState title={t('noRisks')} message={t('noRisksMessage')} />
            ) : (
                <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('description')}</th>
                                <th scope="col" className="px-6 py-3">{t('severity')}</th>
                                <th scope="col" className="px-6 py-3">{t('mitigation')}</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {risks.map(item => (
                                <tr key={item.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.description}</th>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(item.severity)}`}>
                                            {t(item.severity.toLowerCase())}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{item.mitigation}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-primary"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteRequest(item)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <RiskModal 
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

export default RisksPage;
