import React, { useState, useEffect } from 'react';
import { Risk } from '../types';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (risk: Omit<Risk, 'id'> | Risk) => void;
  riskToEdit: Risk | null;
}

const RiskModal: React.FC<RiskModalProps> = ({ isOpen, onClose, onSubmit, riskToEdit }) => {
  const [formData, setFormData] = useState<Omit<Risk, 'id'>>({
    description: '',
    severity: 'Medium',
    solution: '',
  });

  useEffect(() => {
    if (riskToEdit) {
      const { id, ...data } = riskToEdit;
      setFormData(data);
    } else {
      setFormData({ description: '', severity: 'Medium', solution: '' });
    }
  }, [riskToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(riskToEdit) {
        onSubmit({ id: riskToEdit.id, ...formData });
    } else {
        onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
        <h2 className="text-2xl font-bold text-dark dark:text-light">{riskToEdit ? 'Edit Risk' : 'Add New Risk'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
           <div>
            <label htmlFor="solution" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proposed Solution</label>
            <textarea name="solution" id="solution" value={formData.solution} onChange={handleChange} rows={3} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
            <select name="severity" id="severity" value={formData.severity} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark">{riskToEdit ? 'Save Changes' : 'Add Risk'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskModal;
