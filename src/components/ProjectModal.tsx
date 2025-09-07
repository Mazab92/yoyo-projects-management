import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import Modal from './Modal';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Fix: Corrected the Omit properties to match the Project type and the parent component's handler.
    onSave: (project: Omit<Project, 'id' | 'createdBy' | 'team' | 'createdAt' | 'googleDriveFolderId'>) => void;
    project: Project | null;
    t: (key: string) => string;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, project, t }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (project) {
            setName(project.name);
            setDescription(project.description);
            setStartDate(project.startDate);
            setEndDate(project.endDate);
        } else {
            const today = new Date().toISOString().split('T')[0];
            setName('');
            setDescription('');
            setStartDate(today);
            setEndDate(today);
        }
    }, [project, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description, startDate, endDate });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={project ? t('editProject') : t('newProject')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('projectName')}</label>
                    <input
                        type="text"
                        id="projectName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    ></textarea>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('startDate')}</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="block w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('endDate')}</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="block w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        {t('cancel')}
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                        {project ? t('updateProject') : t('createProject')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ProjectModal;