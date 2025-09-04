import React from 'react';
import { Project } from '../types';
import EmptyState from '../components/EmptyState';
import { getStatusColor } from '../utils/helpers';

interface TasksProps {
  project: Project | null;
}

const Tasks: React.FC<TasksProps> = ({ project }) => {
  if (!project) {
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <EmptyState title="No Project Selected" message="Please select a project to see tasks." />
        </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks for {project.name}</h1>
      
      {project.tasks.length === 0 ? (
        <EmptyState title="No Tasks" message="Get started by creating a new task." />
      ) : (
        <div className="mt-6 space-y-4">
          {project.tasks.map(task => (
            <div key={task.id} className="p-4 bg-white rounded-lg shadow dark:bg-dark-secondary">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{task.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">Due: {task.dueDate}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Tasks;
