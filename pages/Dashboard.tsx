import React from 'react';
import { Project, Task, TeamMember, BudgetItem } from '../types';
import Card from '../components/Card';
import { ListChecks, DollarSign, BarChart3, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils/helpers';

interface DashboardProps {
  project: Project;
  tasks: Task[];
  team: TeamMember[];
  budget: BudgetItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ project, tasks, team, budget }) => {
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalExpenses = budget.reduce((acc, item) => acc + item.actualCost, 0);

    const tasksByStatus = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {} as Record<Task['status'], number>);

    const pieData = [
        { name: 'Completed', value: tasksByStatus['Completed'] || 0 },
        { name: 'In Progress', value: tasksByStatus['In Progress'] || 0 },
        { name: 'Postponed', value: tasksByStatus['Postponed'] || 0 },
    ];
    const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    const recentTasks = [...tasks].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-dark dark:text-light">{project.name} Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Completed Tasks" value={`${completedTasks} / ${totalTasks}`} icon={<ListChecks />} color="#10b981" />
                <Card title="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={<DollarSign />} color="#3b82f6" />
                <Card title="Overall Progress" value={`${progress}%`} icon={<BarChart3 />} color="#f59e0b" />
                <Card title="Project Duration" value={project.duration} icon={<Clock />} color="#8b5cf6" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="p-6 bg-white rounded-lg shadow-md lg:col-span-2 dark:bg-dark-secondary">
                    <h2 className="mb-4 text-lg font-semibold text-dark dark:text-light">Project Goal</h2>
                    <p className="text-gray-600 dark:text-gray-300">{project.goal}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                    <h2 className="mb-4 text-lg font-semibold text-dark dark:text-light">Tasks Status</h2>
                     {tasks.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">No task data available.</div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                <h2 className="mb-4 text-lg font-semibold text-dark dark:text-light">Recent Tasks</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Task Name</th>
                                <th scope="col" className="px-6 py-3">Assigned To</th>
                                <th scope="col" className="px-6 py-3">End Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTasks.length > 0 ? recentTasks.map(task => {
                                const member = team.find(m => m.id === task.assignedTo);
                                return (
                                    <tr key={task.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{task.name}</th>
                                        <td className="px-6 py-4">{member?.name || 'Unassigned'}</td>
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
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center">No recent tasks.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
