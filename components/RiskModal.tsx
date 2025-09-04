import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Risk, RiskSeverity } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface RiskModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<Risk, 'id'> & { id?: string }) => void;
  riskToEdit: Risk | null;
}

const RiskModal: React.FC<RiskModalProps> = ({ onClose, onSubmit, riskToEdit }) => {
  const { t } = useLocalization();
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<RiskSeverity>(RiskSeverity.Medium);
  const [solution, setSolution] = useState('');

  useEffect(() => {
    if (riskToEdit) {
      setDescription(riskToEdit.description);
      setSeverity(riskToEdit.severity);
      setSolution(riskToEdit.solution);
    }
  }, [riskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !solution) {
        alert(t('fillAllFieldsError'));
        return;
    }
    onSubmit({ id: riskToEdit?.id, description, severity, solution });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{riskToEdit ? t('editRisk') : t('addNewRisk')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">{t('riskDescription')}</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
          </div>
          <div>
            <label htmlFor="severity" className="block text-sm font-medium mb-1">{t('severity')}</label>
            <select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value as RiskSeverity)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              {Object.values(RiskSeverity).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="solution" className="block text-sm font-medium mb-1">{t('mitigationSolution')}</label>
            <textarea id="solution" value={solution} onChange={(e) => setSolution(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold">{riskToEdit ? t('saveChanges') : t('addRisk')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskModal;
