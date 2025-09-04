import React from 'react';
import { Project } from '../types';
import { Users, CheckSquare, AlertTriangle, DollarSign } from 'lucide-react';
import Card from '../components/Card';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import EmptyState from '../components/EmptyState';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

interface DashboardProps {
  project: Project | null;
}

const Dashboard: React.FC<DashboardProps> = ({ project }) => {
  if (!project) {
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <EmptyState title="No Project Selected" message="Please select a project from the sidebar to view its dashboard." />
        </main>
    );
  }

  const tasksByStatus = project.tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const budgetOverview = {
      allocated: project.budget.reduce((sum, item) => sum + item.allocated, 0),
      spent: project.budget.reduce((sum, item) => sum + item.spent, 0),
  };
  
  const cardData = [
    { title: 'Total Tasks', value: project.tasks.length.toString(), icon: <CheckSquare size={24} />, color: '#3B82F6' },
    { title: 'Team Members', value: project.team.length.toString(), icon: <Users size={24} />, color: '#10B981' },
    { title: 'Open Risks', value: project.risks.length.toString(), icon: <AlertTriangle size={24} />, color: '#F59E0B' },
    { title: 'Budget Spent', value: `$${budgetOverview.spent.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#EF4444' },
  ];
  
  const taskStatusData = {
    labels: Object.keys(tasksByStatus),
    datasets: [{
      label: 'Tasks by Status',
      data: Object.values(tasksByStatus),
      backgroundColor: ['#9CA3AF', '#3B82F6', '#10B981', '#F59E0B'],
    }]
  };
  
  const budgetData = {
    labels: ['Spent', 'Remaining'],
    datasets: [{
      data: [budgetOverview.spent, budgetOverview.allocated - budgetOverview.spent],
      backgroundColor: ['#EF4444', '#10B981'],
    }]
  };
  
  // Dummy data for task completion over time
  const taskCompletionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [5, 9, 3, 5, 2, 3],
        fill: false,
        borderColor: '#3B82F6',
        tension: 0.1
      }
    ]
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard: {project.name}</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
      
      <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map(card => <Card key={card.title} {...card} />)}
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Status</h2>
          <Bar data={taskStatusData} />
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Overview</h2>
          <Pie data={budgetData} />
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Completion Over Time</h2>
            <Line data={taskCompletionData} />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
