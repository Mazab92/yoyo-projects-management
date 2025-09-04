import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../types';
import { formatDate } from '../utils/helpers';
import { PlusCircle, Filter, Pencil, Trash2 } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import { useLocalization } from '../hooks/useLocalization';

const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap";
  const statusClasses = {
    [TaskStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [TaskStatus.Postponed]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    [TaskStatus.NotStarted]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

interface TasksProps {
  project: Project;
  onUpdate: (action: 'add' | 'update' | 'delete', task: Partial<Task>, taskId?: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ project, onUpdate }) => {
  const { t } = useLocalization();
  const { tasks, team } = project;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getMemberById = (id: string) => team.find(m => m.id === id);

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleSubmitTask = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
      onUpdate('update', taskData);
    } else {
      onUpdate('add', taskData);
    }
    handleCloseModal();
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (window.confirm(t('deleteTaskConfirmation'))) {
        onUpdate('delete', {}, taskId);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{t('taskList')}</h2>
          <div className="flex items-center space-x-2">
              <button className="flex-1 sm:flex-none flex items-center justify-center bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <Filter size={16} className="me-2" />
                  {t('filter')}
              </button>
              <button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                  <PlusCircle size={18} className="me-2" />
                  {t('addTask')}
              </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">{t('taskName')}</th>
                <th scope="col" className="px-6 py-3">{t('assignedTo')}</th>
                <th scope="col" className="px-6 py-3">{t('status')}</th>
                <th scope="col" className="px-6 py-3">{t('startDate')}</th>
                <th scope="col" className="px-6 py-3">{t('endDate')}</th>
                <th scope="col" className="px-6 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? tasks.map(task => {
                const member = getMemberById(task.assignedTo);
                return (
                  <tr key={task.id} className="bg-white dark:bg-dark-secondary border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td scope="row" className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{task.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{task.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                          {member && <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover me-3" />}
                          <span>{member ? member.name : t('unassigned')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4">{formatDate(task.startDate)}</td>
                    <td className="px-6 py-4">{formatDate(task.endDate)}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <button onClick={() => handleOpenModal(task)} className="text-blue-500 hover:text-blue-700" title={t('editTask')}><Pencil size={18}/></button>
                            <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700" title={t('deleteTask')}><Trash2 size={18}/></button>
                        </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    {t('noTasksFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
            {tasks.length > 0 ? tasks.map(task => {
                const member = getMemberById(task.assignedTo);
                return (
                    <div key={task.id} className="bg-gray-50 dark:bg-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{task.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                            </div>
                             <TaskStatusBadge status={task.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm py-3 border-y border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('assignedTo')}</p>
                                <div className="flex items-center mt-1">
                                    {member && <img src={member.avatarUrl} alt={member.name} className="w-6 h-6 rounded-full object-cover me-2" />}
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{member ? member.name : t('unassigned')}</span>
                                </div>
                            </div>
                             <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('endDate')}</p>
                                <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{formatDate(task.endDate)}</p>
                            </div>
                        </div>
                        <div className="flex justify-end items-center mt-3 space-x-3 rtl:space-x-reverse">
                            <button onClick={() => handleOpenModal(task)} className="text-blue-500 hover:text-blue-700" title={t('editTask')}><Pencil size={18}/></button>
                            <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700" title={t('deleteTask')}><Trash2 size={18}/></button>
                        </div>
                    </div>
                )
            }) : (
                 <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    {t('noTasksFound')}
                  </div>
            )}
        </div>
      </div>
      {isModalOpen && (
        <TaskModal
          taskToEdit={editingTask}
          teamMembers={team}
          onClose={handleCloseModal}
          onSubmit={handleSubmitTask}
        />
      )}
    </>
  );
};

export default Tasks;
