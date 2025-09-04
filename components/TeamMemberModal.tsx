import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TeamMember, UserRole } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface TeamMemberModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<TeamMember, 'id'> & { id?: string }) => void;
  memberToEdit: TeamMember | null;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ onClose, onSubmit, memberToEdit }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        name: '',
        role: UserRole.Developer,
        email: '',
        avatarUrl: '',
    });

    useEffect(() => {
        if (memberToEdit) {
            setFormData({
                name: memberToEdit.name,
                role: memberToEdit.role,
                email: memberToEdit.email,
                avatarUrl: memberToEdit.avatarUrl,
            });
        }
    }, [memberToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert('Please fill all required fields.');
            return;
        }
        const finalData = { ...formData, avatarUrl: formData.avatarUrl || `https://i.pravatar.cc/150?u=${formData.email}` };
        onSubmit({ id: memberToEdit?.id, ...finalData });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-dark dark:text-light">{memberToEdit ? 'Edit Team Member' : 'Add Team Member'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            {Object.values(UserRole).map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-medium mb-1">Avatar URL (Optional)</label>
                        <input type="text" id="avatarUrl" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="Defaults to a random avatar" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold">{memberToEdit ? t('saveChanges') : t('addMember')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamMemberModal;
