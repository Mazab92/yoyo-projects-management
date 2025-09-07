import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, User, Priority } from '../types';
import Modal from './Modal';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '../hooks/useToast';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id' | 'projectId' | 'createdAt'>) => void;
    task: Task | null;
    teamMembers: User[];
    allTasks: Task[];
    t: (key: string, params?: Record<string, string>) => string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, teamMembers, allTasks, t }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskStatus>('To Do');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState<string | null>(null);
    const [priority, setPriority] = useState<Priority>('Medium');
    const [progress, setProgress] = useState(0);
    const [dependsOn, setDependsOn] = useState<string[]>([]);
    const [reminderDate, setReminderDate] = useState('');
    
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setTitle(task.title);
                setDescription(task.description);
                setStatus(task.status);
                setDueDate(task.dueDate.toDate().toISOString().split('T')[0]);
                setAssignedTo(task.assignedTo);
                setPriority(task.priority || 'Medium');
                setProgress(task.progress || 0);
                setDependsOn(task.dependsOn || []);
                setReminderDate(task.reminderDate ? task.reminderDate.toDate().toISOString().slice(0, 16) : '');
            } else {
                setTitle('');
                setDescription('');
                setStatus('To Do');
                setDueDate(new Date().toISOString().split('T')[0]);
                setAssignedTo(null);
                setPriority('Medium');
                setProgress(0);
                setDependsOn([]);
                setReminderDate('');
            }
        }
    }, [task, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (task?.status === 'To Do' && status !== 'To Do') {
            const activeDependencies = (dependsOn || [])
                .map(depId => allTasks.find(t => t.id === depId))
                .filter(Boolean) as Task[];
            
            const incompleteDependencies = activeDependencies.filter(dep => dep.status !== 'Done');

            if (incompleteDependencies.length > 0) {
                const depNames = incompleteDependencies.map(d => `'${d.title}'`).join(', ');
                addToast(t('taskBlockedByDependencies', { tasks: depNames }), 'error');
                return;
            }
        }

        const taskData: Omit<Task, 'id' | 'projectId' | 'createdAt'> = {
            title, 
            description, 
            status, 
            dueDate: Timestamp.fromDate(new Date(dueDate)), 
            assignedTo,
            priority,
            progress,
            dependsOn,
            reminderDate: reminderDate ? Timestamp.fromDate(new Date(reminderDate)) : undefined,
        };
        // Remove undefined reminderDate so it doesn't overwrite with null in Firestore
        if (!taskData.reminderDate) {
            delete taskData.reminderDate;
        }
        
        onSave(taskData);
    };
    
    const dependencyOptions = allTasks.filter(t => t.id !== task?.id);

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
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('priority')}</label>
                        <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white">
                            <option value="Low">{t('low')}</option>
                            <option value="Medium">{t('medium')}</option>
                            <option value="High">{t('high')}</option>
                            <option value="Urgent">{t('urgent')}</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('assignee')}</label>
                        <select id="assignee" value={assignedTo || ''} onChange={(e) => setAssignedTo(e.target.value || null)} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white">
                            <option value="">Unassigned</option>
                            {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dueDate')}</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="progress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('progress')}: {progress}%</label>
                    <input type="range" id="progress" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                 </div>
                 <div>
                    <label htmlFor="dependsOn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dependsOn')}</label>
                    <select id="dependsOn" multiple value={dependsOn} onChange={(e) => setDependsOn(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white h-24">
                        {dependencyOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.title}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reminderDate')}</label>
                    <input type="datetime-local" id="reminderDate" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md dark:bg-gray-700 dark:text-white" />
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