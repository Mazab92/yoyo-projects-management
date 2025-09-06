import React, { useState } from 'react';
import Modal from './Modal';
import BouncingLoader from './BouncingLoader';

interface TeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMember: (email: string) => Promise<void>;
    t: (key: string) => string;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ isOpen, onClose, onAddMember, t }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onAddMember(email);
        setIsLoading(false);
        setEmail('');
    };
    
    // Reset state on close
    const handleClose = () => {
        setEmail('');
        setIsLoading(false);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('addTeamMember')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('email')}</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={t('addMemberByEmail')}
                        className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        {t('cancel')}
                    </button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark h-10 w-24 flex justify-center items-center">
                        {isLoading ? <BouncingLoader /> : t('add')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TeamMemberModal;
