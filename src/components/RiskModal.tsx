import React, { useState, useEffect } from 'react';
import { Risk, RiskSeverity } from '../types';
import Modal from './Modal';

interface RiskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<Risk, 'id' | 'projectId'>) => void;
    item: Risk | null;
    t: (key: string) => string;
}

const RiskModal: React.FC<RiskModalProps> = ({ isOpen, onClose, onSave, item, t }) => {
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<RiskSeverity>('Medium');
    const [mitigation, setMitigation] = useState('');

    useEffect(() => {
        if (item) {
            setDescription(item.description);
            setSeverity(item.severity);
            setMitigation(item.mitigation);
        } else {
            setDescription('');
            setSeverity('Medium');
            setMitigation('');
        }
    }, [item, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ description, severity, mitigation });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? t('editRisk') : t('addRisk')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white"></textarea>
                </div>
                <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('severity')}</label>
                    <select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value as RiskSeverity)} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white">
                        <option value="Low">{t('low')}</option>
                        <option value="Medium">{t('medium')}</option>
                        <option value="High">{t('high')}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="mitigation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mitigation')}</label>
                    <textarea id="mitigation" value={mitigation} onChange={(e) => setMitigation(e.target.value)} required rows={3} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white"></textarea>
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

export default RiskModal;
