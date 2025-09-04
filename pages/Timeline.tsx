import React from 'react';
import { Project } from '../types';
import EmptyState from '../components/EmptyState';

interface TimelineProps {
  project: Project | null;
}

const Timeline: React.FC<TimelineProps> = ({ project }) => {
  if (!project) {
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <EmptyState title="No Project Selected" message="Please select a project to see the timeline." />
        </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline for {project.name}</h1>
      {project.tasks.length === 0 ? (
        <EmptyState title="No Tasks for Timeline" message="Add tasks with due dates to see a timeline." />
      ) : (
        <div className="mt-6 p-4 text-center bg-white rounded-lg shadow dark:bg-dark-secondary">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Timeline</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            A Gantt chart or a more detailed timeline visualization for '{project.name}' would be displayed here.
          </p>
        </div>
      )}
    </main>
  );
};

export default Timeline;
