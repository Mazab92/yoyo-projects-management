import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, User } from '../types';
import Modal from './Modal';
import { Timestamp } from 'firebase/firestore';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id' | 'projectId'>) => void;
    task: Task | null;
    teamMembers: User[];
    t: (key: string) => string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, teamMembers, t }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskStatus>('To Do');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState<string | null>(null);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setStatus(task.status);
            setDueDate(task.dueDate.toDate().toISOString().split('T')[0]);
            setAssignedTo(task.assignedTo);
        } else {
            setTitle('');
            setDescription('');
            setStatus('To Do');
            setDueDate(new Date().toISOString().split('T')[0]);
            setAssignedTo(null);
        }
    }, [task, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            title, 
            description, 
            status, 
            dueDate: Timestamp.fromDate(new Date(dueDate)), 
            assignedTo 
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task ? t('editTask') : t('addTask')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('taskName')}</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white"></textarea>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white">
                            <option value="To Do">{t('toDo')}</option>
                            <option value="In Progress">{t('inProgress')}</option>
                            <option value="Done">{t('done')}</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dueDate')}</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>
                <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('assignee')}</label>
                    <select id="assignee" value={assignedTo || ''} onChange={(e) => setAssignedTo(e.target.value || null)} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white">
                        <option value="">Unassigned</option>
                        {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                    </select>
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        {t('cancel')}
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                        {t('save')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskModal;
