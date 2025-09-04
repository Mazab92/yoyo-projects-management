import React from 'react';
import Card from '../components/Card';
import { getDaysDifference, formatCurrency } from '../utils/helpers';
import { Project, TaskStatus } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Calendar, Users, CheckCircle, ListTodo, Pencil } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';

interface DashboardProps {
  project: Project;
  onEditProject: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ project, onEditProject }) => {
  const { t } = useLocalization();
  const { goal, duration, budget, tasks, team } = project;

  const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const projectLength = (duration.start && duration.end) ? getDaysDifference(duration.start, duration.end) : 0;
  const daysLeft = (duration.end) ? getDaysDifference(new Date().toISOString().split('T')[0], duration.end) : 0;

  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = {
    [TaskStatus.Completed]: '#10b981',
    [TaskStatus.InProgress]: '#3b82f6',
    [TaskStatus.Postponed]: '#f97316',
    [TaskStatus.NotStarted]: '#6b7280',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title={t('budget')} value={formatCurrency(budget)} icon={<DollarSign />} color="bg-green-500" />
        <Card title={t('projectLength')} value={`${projectLength} ${t('days')}`} icon={<Calendar />} color="bg-blue-500" />
        <Card title={t('teamSize')} value={team.length} icon={<Users />} color="bg-indigo-500" />
        <Card title={t('completedTasks')} value={`${completedTasks}/${totalTasks}`} icon={<CheckCircle />} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-semibold text-dark dark:text-light">{t('projectGoal')}</h3>
                <button onClick={onEditProject} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={t('editProject')}>
                    <Pencil size={18} />
                </button>
            </div>
          <p className="text-gray-600 dark:text-gray-400">{goal}</p>
          <div className="mt-4">
             <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-primary dark:text-white">{t('projectProgress')}</span>
                <span className="text-sm font-medium text-primary dark:text-white">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div className="bg-primary h-4 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{t('start')}: {new Date(duration.start).toLocaleDateString()}</span>
                <span>{daysLeft > 0 ? `${daysLeft} ${t('daysLeft')}` : t('overdue')}</span>
                <span>{t('end')}: {new Date(duration.end).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-dark dark:text-light">{t('taskStatus')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as TaskStatus]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
       <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-light">{t('recentTasks')}</h3>
            {tasks.length > 0 ? (
                <ul className="space-y-3">
                    {tasks.slice(0, 5).map(task => (
                        <li key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div className="flex items-center">
                                <ListTodo className="text-primary me-3" />
                                <div>
                                    <p className="font-medium text-dark dark:text-light">{task.name}</p>
                                    <p className="text-xs text-gray-500">{team.find(m => m.id === task.assignedTo)?.name || t('unassigned')}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            task.status === TaskStatus.Completed ? 'bg-green-100 text-green-800' :
                            task.status === TaskStatus.InProgress ? 'bg-blue-100 text-blue-800' :
                            task.status === TaskStatus.Postponed ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                            }`}>{task.status}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">{t('noTasksAdded')}</p>
            )}
        </div>
    </div>
  );
};

export default Dashboard;
