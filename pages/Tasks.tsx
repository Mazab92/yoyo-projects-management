import React, { useState } from 'react';
import { Task, TeamMember } from '../types';
import { formatDate } from '../utils/helpers';
import TaskModal from '../components/TaskModal';
import { Plus, ListChecks } from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  team: TeamMember[];
  onUpdate: (collection: 'tasks', action: 'add' | 'update' | 'delete', data: any) => void;
  onDelete: (item: Task) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, team, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [filter, setFilter] = useState<'All' | Task['status']>('All');

    const handleEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleSubmit = (taskData: Omit<Task, 'id'> | Task) => {
        if ('id' in taskData) {
            onUpdate('tasks', 'update', taskData);
        } else {
            onUpdate('tasks', 'add', taskData);
        }
        setIsModalOpen(false);
    };
    
    const filteredTasks = filter === 'All' ? tasks : tasks.filter(task => task.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-dark dark:text-light">Tasks</h1>
                <button onClick={handleAdd} className="flex items-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark">
                    <Plus size={20} className="mr-2" /> Add Task
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {(['All', 'Completed', 'In Progress', 'Postponed'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1 text-sm font-medium rounded-full ${filter === status ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Task Name</th>
                                <th scope="col" className="px-6 py-3">Assigned To</th>
                                <th scope="col" className="px-6 py-3">Start Date</th>
                                <th scope="col" className="px-6 py-3">End Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map(task => {
                                const member = team.find(m => m.id === task.assignedTo);
                                return (
                                    <tr key={task.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{task.name}</th>
                                        <td className="px-6 py-4">{member?.name || 'Unassigned'}</td>
                                        <td className="px-6 py-4">{formatDate(task.startDate)}</td>
                                        <td className="px-6 py-4">{formatDate(task.endDate)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleEdit(task)} className="text-yellow-500 hover:text-yellow-700">Edit</button>
                                                <button onClick={() => onDelete(task)} className="text-red-500 hover:text-red-700">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {filteredTasks.length === 0 && (
                        <div className="py-8 text-center text-gray-500">
                            <ListChecks size={40} className="mx-auto mb-2" />
                            <p>No tasks found for this filter.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    taskToEdit={taskToEdit}
                    teamMembers={team}
                />
            )}
        </div>
    );
};

export default Tasks;
