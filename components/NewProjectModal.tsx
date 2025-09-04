
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface NewProjectModalProps {
  onClose: () => void;
  onSubmit: (projectData: { id?: number; name: string; goal: string; startDate: string; endDate: string; budget: number }) => void;
  projectToEdit?: Project | null;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onSubmit, projectToEdit }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setGoal(projectToEdit.goal);
      setStartDate(projectToEdit.duration.start);
      setEndDate(projectToEdit.duration.end);
      setBudget(projectToEdit.budget);
    }
  }, [projectToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !goal || !startDate || !endDate || budget <= 0) {
        alert(t('fillAllFieldsError'));
        return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        alert(t('dateValidationError'));
        return;
    }
    onSubmit({ id: projectToEdit?.id, name, goal, startDate, endDate, budget });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg transform transition-all animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{projectToEdit ? t('editProject') : t('createNewProject')}</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('projectName')}</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('projectGoal')}</label>
            <textarea id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDate')}</label>
                <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDate')}</label>
                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('budget')} (EGP)</label>
            <input type="number" id="budget" value={budget === 0 ? '' : budget} onChange={(e) => setBudget(Number(e.target.value))} required min="1" placeholder={t('budgetPlaceholder')} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold transition">{projectToEdit ? t('saveChanges') : t('createProject')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
