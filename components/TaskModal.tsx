import React, { useState, useEffect } from 'react';
import { Task, TeamMember } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'> | Task) => void;
  taskToEdit: Task | null;
  teamMembers: TeamMember[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, taskToEdit, teamMembers }) => {
  const [formData, setFormData] = useState<Omit<Task, 'id'> & { id?: string }>({
    name: '',
    status: 'In Progress',
    assignedTo: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (taskToEdit) {
      setFormData(taskToEdit);
    } else {
      setFormData({
        name: '',
        status: 'In Progress',
        assignedTo: teamMembers.length > 0 ? teamMembers[0].id : '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [taskToEdit, teamMembers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
        <h2 className="text-2xl font-bold text-dark dark:text-light">{taskToEdit ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
                <select name="assignedTo" id="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary">
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary">
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                </select>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark">{taskToEdit ? 'Save Changes' : 'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
