import React from 'react';
import { Project } from '../types';
import EmptyState from '../components/EmptyState';

interface BudgetProps {
  project: Project | null;
}

const Budget: React.FC<BudgetProps> = ({ project }) => {
  if (!project) {
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <EmptyState title="No Project Selected" message="Please select a project to see the budget." />
        </main>
    );
  }

  const totalAllocated = project.budget.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = project.budget.reduce((sum, item) => sum + item.spent, 0);

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget for {project.name}</h1>
       {project.budget.length === 0 ? (
        <EmptyState title="No Budget Items" message="Add budget items to track project expenses." />
      ) : (
        <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Allocated</th>
                <th scope="col" className="px-6 py-3">Spent</th>
                <th scope="col" className="px-6 py-3">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {project.budget.map(item => (
                <tr key={item.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.category}</th>
                  <td className="px-6 py-4">${item.allocated.toLocaleString()}</td>
                  <td className="px-6 py-4">${item.spent.toLocaleString()}</td>
                  <td className="px-6 py-4">${(item.allocated - item.spent).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-semibold text-gray-900 dark:text-white">
                <tr className="border-t-2 dark:border-gray-700">
                    <th scope="row" className="px-6 py-3 text-base">Total</th>
                    <td className="px-6 py-3">${totalAllocated.toLocaleString()}</td>
                    <td className="px-6 py-3">${totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-3">${(totalAllocated - totalSpent).toLocaleString()}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      )}
    </main>
  );
};

export default Budget;
