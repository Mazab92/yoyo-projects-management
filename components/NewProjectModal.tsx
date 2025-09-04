import React, { useState, useEffect } from 'react';
import { Project } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id'>) => void;
  projectToEdit: Project | null;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSubmit, projectToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    duration: '',
    budget: 0,
  });

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        name: projectToEdit.name,
        goal: projectToEdit.goal,
        duration: projectToEdit.duration,
        budget: projectToEdit.budget,
      });
    } else {
      setFormData({ name: '', goal: '', duration: '', budget: 0 });
    }
  }, [projectToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'budget' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
        <h2 className="text-2xl font-bold text-dark dark:text-light">{projectToEdit ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
           <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Goal</label>
            <textarea name="goal" id="goal" value={formData.goal} onChange={handleChange} rows={3} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" placeholder="e.g., 3 Months"/>
            </div>
            <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget ($)</label>
                <input type="number" name="budget" id="budget" value={formData.budget} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark">{projectToEdit ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
