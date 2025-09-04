import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, TeamMember, TaskStatus } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface TaskModalProps {
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id'> & { id?: string }) => void;
  taskToEdit: Task | null;
  teamMembers: TeamMember[];
}

type TaskFormData = Omit<Task, 'id'> & { id?: string };

const TaskModal: React.FC<TaskModalProps> = ({ onClose, onSubmit, taskToEdit, teamMembers }) => {
  const { t } = useLocalization();
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    assignedTo: '',
    status: TaskStatus.NotStarted,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        id: taskToEdit.id,
        name: taskToEdit.name,
        description: taskToEdit.description,
        assignedTo: taskToEdit.assignedTo,
        status: taskToEdit.status,
        startDate: taskToEdit.startDate,
        endDate: taskToEdit.endDate,
      });
    } else {
        // Set default assigned to first team member if available
        if(teamMembers.length > 0) {
            setFormData(prev => ({...prev, assignedTo: teamMembers[0].id}));
        }
    }
  }, [taskToEdit, teamMembers]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
        alert(t('fillAllFieldsError'));
        return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
        alert(t('dateValidationError'));
        return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg transform transition-all animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{taskToEdit ? t('editTask') : t('addNewTask')}</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('taskName')}</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('assignedTo')}</label>
              <select id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {teamMembers.length > 0 ? teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                )) : <option disabled>{t('noTeamMembers')}</option>}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDate')}</label>
                <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDate')}</label>
                <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold transition">{taskToEdit ? t('saveChanges') : t('addTask')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
