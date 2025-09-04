import React from 'react';
import { Project } from '../types';
import EmptyState from '../components/EmptyState';

interface RisksProps {
  project: Project | null;
}

const Risks: React.FC<RisksProps> = ({ project }) => {
  if (!project) {
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <EmptyState title="No Project Selected" message="Please select a project to see the risks." />
        </main>
    );
  }

  const getSeverityColor = (impact: string, likelihood: string) => {
    const severityMap = { Low: 1, Medium: 2, High: 3 };
    const score = (severityMap[impact as keyof typeof severityMap] || 1) * (severityMap[likelihood as keyof typeof severityMap] || 1);
    if (score >= 6) return 'bg-red-500';
    if (score >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Risks for {project.name}</h1>
      {project.risks.length === 0 ? (
        <EmptyState title="No Risks Identified" message="Add potential risks to your project." />
      ) : (
        <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
           <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Impact</th>
                <th scope="col" className="px-6 py-3">Likelihood</th>
                <th scope="col" className="px-6 py-3">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {project.risks.map(risk => (
                <tr key={risk.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                  <td className="px-6 py-4">{risk.description}</td>
                  <td className="px-6 py-4">{risk.impact}</td>
                  <td className="px-6 py-4">{risk.likelihood}</td>
                  <td className="px-6 py-4">{risk.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default Risks;
