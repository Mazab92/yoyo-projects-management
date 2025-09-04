import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Omit<TeamMember, 'id'> | TeamMember) => void;
  memberToEdit: TeamMember | null;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ isOpen, onClose, onSubmit, memberToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    avatar: '',
  });

  useEffect(() => {
    if (memberToEdit) {
      setFormData(memberToEdit);
    } else {
      setFormData({ name: '', role: '', email: '', avatar: '' });
    }
  }, [memberToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(memberToEdit) {
        onSubmit({ id: memberToEdit.id, ...formData });
    } else {
        onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
        <h2 className="text-2xl font-bold text-dark dark:text-light">{memberToEdit ? 'Edit Team Member' : 'Add New Team Member'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <input type="text" name="role" id="role" value={formData.role} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL (Optional)</label>
            <input type="text" name="avatar" id="avatar" value={formData.avatar} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary" />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark">{memberToEdit ? 'Save Changes' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberModal;
