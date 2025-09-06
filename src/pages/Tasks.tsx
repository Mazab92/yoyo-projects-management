import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProjectContext } from '../hooks/useProjectContext';
import { Task, User, TaskStatus } from '../types';
import { logActivity } from '../lib/activityLog';
import EmptyState from '../components/EmptyState';
import BouncingLoader from '../components/BouncingLoader';
import TaskModal from '../components/TaskModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStatusColor, formatDateTime } from '../lib/helpers';

// Fix: Updated t function prop type to allow for a parameters object.
const TasksPage: React.FC<{ t: (key: string, params?: Record<string, string>) => string; locale: string }> = ({ t, locale }) => {
    const { currentProject } = useProjectContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [team, setTeam] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    useEffect(() => {
        if (!currentProject) return;

        setLoading(true);
        const q = query(collection(db, 'tasks'), where('projectId', '==', currentProject.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setTasks(tasksData.sort((a, b) => a.dueDate.seconds - b.dueDate.seconds));
            setLoading(false);
        });

        const teamUnsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
            const allUsers = snapshot.docs.map(d => ({id: d.id, ...d.data()}) as User);
            setTeam(allUsers.filter(u => currentProject.team.includes(u.id)));
        });

        return () => {
            unsubscribe();
            teamUnsubscribe();
        }
    }, [currentProject]);

    const handleOpenModal = (task: Task | null = null) => {
        setTaskToEdit(task);
        setModalOpen(true);
    };

    const handleSaveTask = async (taskData: Omit<Task, 'id' | 'projectId'>) => {
        if (!currentProject) return;
        try {
            if (taskToEdit) {
                await updateDoc(doc(db, 'tasks', taskToEdit.id), taskData);
                logActivity('Updated task', { projectId: currentProject.id, taskId: taskToEdit.id, title: taskData.title });
            } else {
                const newTask = { ...taskData, projectId: currentProject.id };
                const docRef = await addDoc(collection(db, 'tasks'), newTask);
                logActivity('Created task', { projectId: currentProject.id, taskId: docRef.id, title: taskData.title });
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };
    
    const handleDeleteRequest = (task: Task) => {
        setTaskToDelete(task);
        setDeleteModalOpen(true);
    }
    
    const confirmDelete = async () => {
        if (!taskToDelete || !currentProject) return;
        try {
            await deleteDoc(doc(db, 'tasks', taskToDelete.id));
            logActivity('Deleted task', { projectId: currentProject.id, title: taskToDelete.title });
            setDeleteModalOpen(false);
            setTaskToDelete(null);
        } catch(error) {
            console.error("Error deleting task:", error);
        }
    }
    
    const getAssigneeName = (userId: string | null) => team.find(m => m.id === userId)?.name || 'Unassigned';

    const renderTaskList = (status: TaskStatus) => (
        <div key={status}>
            <h2 className="text-lg font-semibold mb-3">{t(status === 'To Do' ? 'toDo' : status === 'In Progress' ? 'inProgress' : 'done')}</h2>
            <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(task => (
                    <motion.div layout key={task.id} className="p-4 bg-white dark:bg-dark-secondary rounded-lg shadow group">
                        <div className="flex justify-between items-start">
                           <h3 className="font-semibold text-gray-800 dark:text-gray-200">{task.title}</h3>
                           <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(task)} className="p-1 text-gray-500 hover:text-primary"><Edit size={16} /></button>
                                <button onClick={() => handleDeleteRequest(task)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                           </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                        <div className="flex justify-between items-center mt-3 text-xs">
                            <span className="font-medium text-gray-600 dark:text-gray-300">{getAssigneeName(task.assignedTo)}</span>
                            <span className="text-gray-500">{formatDateTime(task.dueDate, locale as 'en' | 'ar')}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
    
    if (!currentProject) return null;

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('tasksTitle', { projectName: currentProject.name })}
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark"
                >
                    <Plus size={16} className="mr-2" /> {t('addTask')}
                </button>
            </div>

            {loading ? <BouncingLoader /> : tasks.length === 0 ? (
                <EmptyState title={t('noTasks')} message={t('noTasksMessage')} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderTaskList('To Do')}
                    {renderTaskList('In Progress')}
                    {renderTaskList('Done')}
                </div>
            )}
            
            <TaskModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveTask}
                task={taskToEdit}
                teamMembers={team}
                t={t}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={t('deleteItemTitle')}
                message={t('deleteItemMessage')}
                t={t}
            />
        </div>
    );
};

export default TasksPage;
