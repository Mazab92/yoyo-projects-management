import React from 'react';
import { Project } from '../types';
import EmptyState from '../components/EmptyState';

interface TeamProps {
  project: Project | null;
}

const Team: React.FC<TeamProps> = ({ project }) => {
  if (!project) {
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <EmptyState title="No Project Selected" message="Please select a project to see the team." />
        </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team for {project.name}</h1>
      {project.team.length === 0 ? (
        <EmptyState title="No Team Members" message="Add team members to your project." />
      ) : (
        <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Role</th>
                <th scope="col" className="px-6 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {project.team.map(member => (
                <tr key={member.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {member.name}
                  </th>
                  <td className="px-6 py-4">{member.role}</td>
                  <td className="px-6 py-4">{member.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default Team;
